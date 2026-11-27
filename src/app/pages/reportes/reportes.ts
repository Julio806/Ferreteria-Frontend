
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  ReporteService,
  VentaReporte,
  DocumentoPlantilla,
  TipoDocumento
} from '../../core/services/reporte.service';

// ==========================================
// INTERFACES
// ==========================================

interface MetodoPagoReporte {
  nombre: string;
  cantidad: number;
  total: number;
}

interface VendedorReporte {
  nombre: string;
  cantidad: number;
  total: number;
}

interface ProductoReporte {
  nombre: string;
  cantidad: number;
  total: number;
}

// ==========================================
// COMPONENTE
// ==========================================

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class Reportes implements OnInit {

  private reporteService = inject(ReporteService);

  // ==========================================
  // PESTAÑAS
  // ==========================================

  pestanaActiva: 'ventas' | 'plantillas' = 'ventas';

  // ==========================================
  // VENTAS
  // ==========================================

  ventas: VentaReporte[] = [];

  ventasFiltradas: VentaReporte[] = [];

  // ==========================================
  // ESTADOS
  // ==========================================

  loading = true;

  error = '';

  // ==========================================
  // DESCARGAS
  // ==========================================

  descargandoReporte: string | null = null;

  mensajeDescarga = '';

  errorDescarga = '';

  // ==========================================
  // FILTROS
  // ==========================================

  fechaDesde = '';

  fechaHasta = '';

  // ==========================================
  // RESUMEN
  // ==========================================

  totalVentas = 0;

  ventasCompletadas = 0;

  ventasCanceladas = 0;

  totalVendido = 0;

  totalImpuesto = 0;

  totalSubtotal = 0;

  // ==========================================
  // REPORTES
  // ==========================================

  metodosPago: MetodoPagoReporte[] = [];

  vendedores: VendedorReporte[] = [];

  productos: ProductoReporte[] = [];

  // ==========================================
  // ADMINISTRACIÓN DE PLANTILLAS
  // ==========================================

  plantillas: DocumentoPlantilla[] = [];

  archivosSeleccionados: Partial<Record<TipoDocumento, File>> = {};

  subiendoPlantilla: TipoDocumento | null = null;

  mensajePlantillas = '';

  errorPlantillas = '';

  tiposPlantilla = [
    {
      tipo: 'VENTAS_WORD' as TipoDocumento,
      nombre: 'Reporte de ventas Word',
      descripcion: 'Plantilla para generar reportes de ventas en Word.',
      extension: '.docx',
      icono: 'file-text',
      color: 'word'
    },
    {
      tipo: 'VENTAS_EXCEL' as TipoDocumento,
      nombre: 'Reporte de ventas Excel',
      descripcion: 'Plantilla para generar reportes de ventas en Excel.',
      extension: '.xlsx',
      icono: 'file-spreadsheet',
      color: 'excel'
    },
    {
      tipo: 'INVENTARIO_WORD' as TipoDocumento,
      nombre: 'Reporte de inventario Word',
      descripcion: 'Plantilla para generar reportes de inventario en Word.',
      extension: '.docx',
      icono: 'file-text',
      color: 'word'
    },
    {
      tipo: 'INVENTARIO_EXCEL' as TipoDocumento,
      nombre: 'Reporte de inventario Excel',
      descripcion: 'Plantilla para generar reportes de inventario en Excel.',
      extension: '.xlsx',
      icono: 'file-spreadsheet',
      color: 'excel'
    }
  ];

  // ==========================================
  // INICIO
  // ==========================================

  ngOnInit(): void {
    this.establecerFechas();
    this.cargarVentas();
    this.cargarPlantillas();
  }

  // ==========================================
  // FECHAS INICIALES
  // ==========================================

  establecerFechas(): void {
    const hoy = new Date();

    this.fechaHasta = this.formatearFechaInput(hoy);

    const inicio = new Date(hoy);
    inicio.setDate(inicio.getDate() - 30);

    this.fechaDesde = this.formatearFechaInput(inicio);
  }

  // ==========================================
  // FORMATO FECHA INPUT
  // ==========================================

  private formatearFechaInput(fecha: Date): string {
    const año = fecha.getFullYear();

    const mes = String(
      fecha.getMonth() + 1
    ).padStart(2, '0');

    const dia = String(
      fecha.getDate()
    ).padStart(2, '0');

    return `${año}-${mes}-${dia}`;
  }

  // ==========================================
  // CARGAR VENTAS
  // ==========================================

  cargarVentas(): void {
    this.loading = true;
    this.error = '';

    this.reporteService.obtenerVentas().subscribe({

      next: (ventas) => {
        this.ventas = ventas || [];

        this.aplicarFiltros();

        this.loading = false;
      },

      error: (err) => {
        console.error('Error al cargar ventas:', err);

        this.error = 'No se pudieron cargar las ventas.';

        this.loading = false;
      }

    });
  }

  // ==========================================
  // APLICAR FILTROS
  // ==========================================

  aplicarFiltros(): void {

    if (
      this.fechaDesde &&
      this.fechaHasta &&
      this.fechaDesde > this.fechaHasta
    ) {
      this.ventasFiltradas = [];
      this.calcularReporte();
      return;
    }

    this.ventasFiltradas = this.ventas.filter(venta => {

      if (!venta.fechaCreacion) {
        return false;
      }

      const fechaVenta = venta.fechaCreacion.substring(0, 10);

      const cumpleDesde = !this.fechaDesde ||
        fechaVenta >= this.fechaDesde;

      const cumpleHasta = !this.fechaHasta ||
        fechaVenta <= this.fechaHasta;

      return cumpleDesde && cumpleHasta;

    });

    this.calcularReporte();
  }

  // ==========================================
  // CALCULAR REPORTE
  // ==========================================

  calcularReporte(): void {

    this.totalVentas = this.ventasFiltradas.length;

    this.ventasCompletadas = this.ventasFiltradas.filter(
      venta => venta.estado === 'COMPLETADA'
    ).length;

    this.ventasCanceladas = this.ventasFiltradas.filter(
      venta => venta.estado === 'CANCELADA'
    ).length;

    const ventasValidas = this.ventasFiltradas.filter(
      venta => venta.estado === 'COMPLETADA'
    );

    this.totalSubtotal = ventasValidas.reduce(
      (total, venta) => total + Number(venta.subtotal || 0),
      0
    );

    this.totalImpuesto = ventasValidas.reduce(
      (total, venta) => total + Number(venta.impuesto || 0),
      0
    );

    this.totalVendido = ventasValidas.reduce(
      (total, venta) => total + Number(venta.total || 0),
      0
    );

    this.calcularMetodosPago(ventasValidas);

    this.calcularVendedores(ventasValidas);

    this.calcularProductos(ventasValidas);
  }

  // ==========================================
  // MÉTODOS DE PAGO
  // ==========================================

  calcularMetodosPago(ventas: VentaReporte[]): void {

    const mapa = new Map<string, MetodoPagoReporte>();

    ventas.forEach(venta => {

      const nombre = this.formatearMetodoPago(
        venta.metodoPago
      );

      const existente = mapa.get(nombre);

      if (existente) {

        existente.cantidad++;

        existente.total += Number(venta.total || 0);

      } else {

        mapa.set(nombre, {
          nombre,
          cantidad: 1,
          total: Number(venta.total || 0)
        });

      }

    });

    this.metodosPago = Array.from(
      mapa.values()
    ).sort((a, b) => b.total - a.total);
  }

  // ==========================================
  // VENDEDORES
  // ==========================================

  calcularVendedores(ventas: VentaReporte[]): void {

    const mapa = new Map<string, VendedorReporte>();

    ventas.forEach(venta => {

      const nombre =
        venta.usuarioNombre ||
        venta.username ||
        'Sin vendedor';

      const existente = mapa.get(nombre);

      if (existente) {

        existente.cantidad++;

        existente.total += Number(venta.total || 0);

      } else {

        mapa.set(nombre, {
          nombre,
          cantidad: 1,
          total: Number(venta.total || 0)
        });

      }

    });

    this.vendedores = Array.from(
      mapa.values()
    ).sort((a, b) => b.total - a.total);
  }

  // ==========================================
  // PRODUCTOS MÁS VENDIDOS
  // ==========================================

  calcularProductos(ventas: VentaReporte[]): void {

    const mapa = new Map<string, ProductoReporte>();

    ventas.forEach(venta => {

      venta.items?.forEach(item => {

        const nombre = item.productoNombre || 'Producto';

        const existente = mapa.get(nombre);

        if (existente) {

          existente.cantidad += Number(item.cantidad || 0);

          existente.total += Number(item.subtotal || 0);

        } else {

          mapa.set(nombre, {
            nombre,
            cantidad: Number(item.cantidad || 0),
            total: Number(item.subtotal || 0)
          });

        }

      });

    });

    this.productos = Array.from(
      mapa.values()
    )
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);
  }

  // ==========================================
  // MÉTODO DE PAGO
  // ==========================================

  formatearMetodoPago(metodo: string): string {

    switch (metodo) {

      case 'EFECTIVO':
        return 'Efectivo';

      case 'TARJETA':
        return 'Tarjeta';

      case 'TRANSFERENCIA':
        return 'Transferencia';

      default:
        return metodo || 'No especificado';

    }
  }

  // ==========================================
  // MONEDA
  // ==========================================

  formatearMoneda(valor: number): string {

    return Number(valor || 0).toLocaleString(
      'es-MX',
      {
        style: 'currency',
        currency: 'MXN'
      }
    );
  }

  // ==========================================
  // RECARGAR
  // ==========================================

  recargar(): void {
    this.cargarVentas();
  }

  // ==========================================
  // DESCARGAR ARCHIVO RECIBIDO DEL BACKEND
  // ==========================================

  private descargarArchivo(
    archivo: Blob,
    nombreArchivo: string
  ): void {

    if (!archivo || archivo.size === 0) {
      this.errorDescarga = 'El servidor no generó ningún archivo.';
      return;
    }

    const url = window.URL.createObjectURL(archivo);

    const enlace = document.createElement('a');

    enlace.href = url;
    enlace.download = nombreArchivo;

    document.body.appendChild(enlace);

    enlace.click();

    document.body.removeChild(enlace);

    window.URL.revokeObjectURL(url);
  }

  // ==========================================
  // EXPORTAR WORD DE VENTAS
  // ==========================================

  exportarWord(): void {

    if (this.ventasFiltradas.length === 0) {
      this.errorDescarga = 'No hay ventas para generar el reporte.';
      return;
    }

    if (!this.fechaDesde || !this.fechaHasta) {
      this.errorDescarga = 'Selecciona ambas fechas.';
      return;
    }

    if (this.fechaDesde > this.fechaHasta) {
      this.errorDescarga = 'La fecha inicial no puede ser posterior a la final.';
      return;
    }

    this.descargandoReporte = 'ventas-word';
    this.mensajeDescarga = '';
    this.errorDescarga = '';

    this.reporteService.generarVentasWord(
      this.fechaDesde,
      this.fechaHasta
    ).subscribe({

      next: (archivo) => {

        this.descargarArchivo(
          archivo,
          `reporte-ventas-${this.fechaDesde}-${this.fechaHasta}.docx`
        );

        if (!this.errorDescarga) {
          this.mensajeDescarga = 'Reporte Word de ventas generado correctamente.';
        }

        this.descargandoReporte = null;
      },

      error: (error) => {

        console.error('Error al generar Word de ventas:', error);

        this.errorDescarga =
          'No se pudo generar el Word de ventas. Verifica que la plantilla esté cargada y revisa el backend.';

        this.descargandoReporte = null;
      }

    });
  }

  // ==========================================
  // EXPORTAR EXCEL DE VENTAS
  // ==========================================

  exportarExcel(): void {

    if (this.ventasFiltradas.length === 0) {
      this.errorDescarga = 'No hay ventas para generar el reporte.';
      return;
    }

    if (!this.fechaDesde || !this.fechaHasta) {
      this.errorDescarga = 'Selecciona ambas fechas.';
      return;
    }

    if (this.fechaDesde > this.fechaHasta) {
      this.errorDescarga = 'La fecha inicial no puede ser posterior a la final.';
      return;
    }

    this.descargandoReporte = 'ventas-excel';
    this.mensajeDescarga = '';
    this.errorDescarga = '';

    this.reporteService.generarVentasExcel(
      this.fechaDesde,
      this.fechaHasta
    ).subscribe({

      next: (archivo) => {

        this.descargarArchivo(
          archivo,
          `reporte-ventas-${this.fechaDesde}-${this.fechaHasta}.xlsx`
        );

        if (!this.errorDescarga) {
          this.mensajeDescarga = 'Reporte Excel de ventas generado correctamente.';
        }

        this.descargandoReporte = null;
      },

      error: (error) => {

        console.error('Error al generar Excel de ventas:', error);

        this.errorDescarga =
          'No se pudo generar el Excel de ventas. Verifica que la plantilla esté cargada y revisa el backend.';

        this.descargandoReporte = null;
      }

    });
  }

  // ==========================================
  // EXPORTAR WORD DE INVENTARIO
  // ==========================================

  exportarInventarioWord(): void {

    this.descargandoReporte = 'inventario-word';
    this.mensajeDescarga = '';
    this.errorDescarga = '';

    this.reporteService.generarInventarioWord().subscribe({

      next: (archivo) => {

        this.descargarArchivo(
          archivo,
          'reporte-inventario.docx'
        );

        if (!this.errorDescarga) {
          this.mensajeDescarga = 'Reporte Word de inventario generado correctamente.';
        }

        this.descargandoReporte = null;
      },

      error: (error) => {

        console.error('Error al generar Word de inventario:', error);

        this.errorDescarga =
          'No se pudo generar el Word de inventario. Verifica que la plantilla esté cargada y revisa el backend.';

        this.descargandoReporte = null;
      }

    });
  }

  // ==========================================
  // EXPORTAR EXCEL DE INVENTARIO
  // ==========================================

  exportarInventarioExcel(): void {

    this.descargandoReporte = 'inventario-excel';
    this.mensajeDescarga = '';
    this.errorDescarga = '';

    this.reporteService.generarInventarioExcel().subscribe({

      next: (archivo) => {

        this.descargarArchivo(
          archivo,
          'reporte-inventario.xlsx'
        );

        if (!this.errorDescarga) {
          this.mensajeDescarga = 'Reporte Excel de inventario generado correctamente.';
        }

        this.descargandoReporte = null;
      },

      error: (error) => {

        console.error('Error al generar Excel de inventario:', error);

        this.errorDescarga =
          'No se pudo generar el Excel de inventario. Verifica que la plantilla esté cargada y revisa el backend.';

        this.descargandoReporte = null;
      }

    });
  }

  // ==========================================
  // FECHA PARA MOSTRAR
  // ==========================================

  formatearFecha(fecha: string): string {

    if (!fecha) {
      return '';
    }

    const fechaObj = new Date(fecha);

    return fechaObj.toLocaleDateString('es-MX');
  }

  // ==========================================
  // FECHA TEXTO
  // ==========================================

  formatearFechaTexto(fecha: string): string {

    if (!fecha) {
      return '';
    }

    const partes = fecha.split('-');

    if (partes.length !== 3) {
      return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  // ==========================================
  // CARGAR PLANTILLAS
  // ==========================================

  cargarPlantillas(): void {

    this.errorPlantillas = '';

    this.reporteService.obtenerPlantillas().subscribe({

      next: (datos) => {
        this.plantillas = datos || [];
      },

      error: (error) => {

        console.error('Error al cargar plantillas:', error);

        this.errorPlantillas =
          'No se pudieron consultar las plantillas.';

      }

    });
  }

  // ==========================================
  // SELECCIONAR ARCHIVO
  // ==========================================

  seleccionarArchivo(
    event: Event,
    tipo: TipoDocumento
  ): void {

    const input = event.target as HTMLInputElement;

    const archivo = input.files?.[0];

    if (!archivo) {
      return;
    }

    const configuracion = this.tiposPlantilla.find(
      item => item.tipo === tipo
    );

    if (!configuracion) {
      return;
    }

    const extension = archivo.name
      .substring(archivo.name.lastIndexOf('.'))
      .toLowerCase();

    if (extension !== configuracion.extension) {

      this.errorPlantillas =
        `Selecciona un archivo ${configuracion.extension}.`;

      delete this.archivosSeleccionados[tipo];

      input.value = '';

      return;
    }

    if (archivo.size > 10 * 1024 * 1024) {

      this.errorPlantillas =
        'El archivo no debe superar los 10 MB.';

      delete this.archivosSeleccionados[tipo];

      input.value = '';

      return;
    }

    this.errorPlantillas = '';
    this.mensajePlantillas = '';

    this.archivosSeleccionados[tipo] = archivo;
  }

  // ==========================================
  // SUBIR O REEMPLAZAR PLANTILLA
  // ==========================================

  guardarPlantilla(tipo: TipoDocumento): void {

    const archivo = this.archivosSeleccionados[tipo];

    if (!archivo) {

      this.errorPlantillas =
        'Primero selecciona un archivo.';

      return;
    }

    if (this.subiendoPlantilla !== null) {
      return;
    }

    const existe = this.plantillas.some(
      plantilla => plantilla.tipo === tipo
    );

    this.subiendoPlantilla = tipo;

    this.errorPlantillas = '';
    this.mensajePlantillas = '';

    const peticion = existe
      ? this.reporteService.reemplazarPlantilla(tipo, archivo)
      : this.reporteService.subirPlantilla(tipo, archivo);

    peticion.subscribe({

      next: () => {

        this.subiendoPlantilla = null;

        delete this.archivosSeleccionados[tipo];

        this.mensajePlantillas = existe
          ? 'Plantilla reemplazada correctamente.'
          : 'Plantilla cargada correctamente.';

        this.cargarPlantillas();

      },

      error: (error) => {

        console.error('Error al guardar plantilla:', error);

        this.subiendoPlantilla = null;

        this.errorPlantillas =
          error.error?.message ||
          'No fue posible guardar la plantilla.';

      }

    });
  }

  // ==========================================
  // OBTENER PLANTILLA POR TIPO
  // ==========================================

  obtenerPlantilla(
    tipo: TipoDocumento
  ): DocumentoPlantilla | undefined {

    return this.plantillas.find(
      plantilla => plantilla.tipo === tipo
    );
  }

}
