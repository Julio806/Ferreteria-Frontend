import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  ReporteService,
  VentaReporte
} from '../../core/services/reporte.service';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import * as XLSX from 'xlsx';


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

  private reporteService =
    inject(ReporteService);


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
  // INICIO
  // ==========================================

  ngOnInit(): void {

    this.establecerFechas();

    this.cargarVentas();

  }


  // ==========================================
  // FECHAS INICIALES
  // ==========================================

  establecerFechas(): void {

    const hoy = new Date();


    this.fechaHasta =
      this.formatearFechaInput(hoy);


    const inicio = new Date(hoy);

    inicio.setDate(
      inicio.getDate() - 30
    );


    this.fechaDesde =
      this.formatearFechaInput(inicio);

  }


  // ==========================================
  // FORMATO FECHA INPUT
  // ==========================================

  private formatearFechaInput(
    fecha: Date
  ): string {

    const año =
      fecha.getFullYear();

    const mes =
      String(
        fecha.getMonth() + 1
      ).padStart(2, '0');

    const dia =
      String(
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


    this.reporteService
      .obtenerVentas()
      .subscribe({

        next: (ventas) => {

          this.ventas = ventas || [];

          this.aplicarFiltros();

          this.loading = false;

        },


        error: (err) => {

          console.error(
            'Error al cargar ventas:',
            err
          );


          this.error =
            'No se pudieron cargar las ventas.';

          this.loading = false;

        }

      });

  }


  // ==========================================
  // APLICAR FILTROS
  // ==========================================

  aplicarFiltros(): void {

    this.ventasFiltradas =
      this.ventas.filter(
        venta => {

          if (!venta.fechaCreacion) {
            return false;
          }


          const fechaVenta =
            venta.fechaCreacion
              .substring(0, 10);


          return (
            fechaVenta >= this.fechaDesde &&
            fechaVenta <= this.fechaHasta
          );

        }
      );


    this.calcularReporte();

  }


  // ==========================================
  // CALCULAR REPORTE
  // ==========================================

  calcularReporte(): void {

    this.totalVentas =
      this.ventasFiltradas.length;


    this.ventasCompletadas =
      this.ventasFiltradas.filter(
        venta =>
          venta.estado === 'COMPLETADA'
      ).length;


    this.ventasCanceladas =
      this.ventasFiltradas.filter(
        venta =>
          venta.estado === 'CANCELADA'
      ).length;


    const ventasValidas =
      this.ventasFiltradas.filter(
        venta =>
          venta.estado === 'COMPLETADA'
      );


    this.totalSubtotal =
      ventasValidas.reduce(
        (total, venta) =>
          total +
          Number(venta.subtotal || 0),
        0
      );


    this.totalImpuesto =
      ventasValidas.reduce(
        (total, venta) =>
          total +
          Number(venta.impuesto || 0),
        0
      );


    this.totalVendido =
      ventasValidas.reduce(
        (total, venta) =>
          total +
          Number(venta.total || 0),
        0
      );


    this.calcularMetodosPago(
      ventasValidas
    );


    this.calcularVendedores(
      ventasValidas
    );


    this.calcularProductos(
      ventasValidas
    );

  }


  // ==========================================
  // MÉTODOS DE PAGO
  // ==========================================

  calcularMetodosPago(
    ventas: VentaReporte[]
  ): void {

    const mapa =
      new Map<
        string,
        MetodoPagoReporte
      >();


    ventas.forEach(
      venta => {

        const nombre =
          this.formatearMetodoPago(
            venta.metodoPago
          );


        const existente =
          mapa.get(nombre);


        if (existente) {

          existente.cantidad++;

          existente.total +=
            Number(
              venta.total || 0
            );

        } else {

          mapa.set(
            nombre,
            {
              nombre,
              cantidad: 1,
              total:
                Number(
                  venta.total || 0
                )
            }
          );

        }

      }
    );


    this.metodosPago =
      Array.from(
        mapa.values()
      ).sort(
        (a, b) =>
          b.total - a.total
      );

  }


  // ==========================================
  // VENDEDORES
  // ==========================================

  calcularVendedores(
    ventas: VentaReporte[]
  ): void {

    const mapa =
      new Map<
        string,
        VendedorReporte
      >();


    ventas.forEach(
      venta => {

        const nombre =
          venta.usuarioNombre ||
          venta.username ||
          'Sin vendedor';


        const existente =
          mapa.get(nombre);


        if (existente) {

          existente.cantidad++;

          existente.total +=
            Number(
              venta.total || 0
            );

        } else {

          mapa.set(
            nombre,
            {
              nombre,
              cantidad: 1,
              total:
                Number(
                  venta.total || 0
                )
            }
          );

        }

      }
    );


    this.vendedores =
      Array.from(
        mapa.values()
      ).sort(
        (a, b) =>
          b.total - a.total
      );

  }


  // ==========================================
  // PRODUCTOS MÁS VENDIDOS
  // ==========================================

  calcularProductos(
    ventas: VentaReporte[]
  ): void {

    const mapa =
      new Map<
        string,
        ProductoReporte
      >();


    ventas.forEach(
      venta => {

        venta.items?.forEach(
          item => {

            const nombre =
              item.productoNombre ||
              'Producto';


            const existente =
              mapa.get(nombre);


            if (existente) {

              existente.cantidad +=
                Number(
                  item.cantidad || 0
                );


              existente.total +=
                Number(
                  item.subtotal || 0
                );

            } else {

              mapa.set(
                nombre,
                {
                  nombre,
                  cantidad:
                    Number(
                      item.cantidad || 0
                    ),
                  total:
                    Number(
                      item.subtotal || 0
                    )
                }
              );

            }

          }
        );

      }
    );


    this.productos =
      Array.from(
        mapa.values()
      )
      .sort(
        (a, b) =>
          b.cantidad - a.cantidad
      )
      .slice(0, 10);

  }


  // ==========================================
  // MÉTODO DE PAGO
  // ==========================================

  formatearMetodoPago(
    metodo: string
  ): string {

    switch (metodo) {

      case 'EFECTIVO':
        return 'Efectivo';

      case 'TARJETA':
        return 'Tarjeta';

      case 'TRANSFERENCIA':
        return 'Transferencia';

      default:
        return metodo;

    }

  }


  // ==========================================
  // MONEDA
  // ==========================================

  formatearMoneda(
    valor: number
  ): string {

    return Number(
      valor || 0
    ).toLocaleString(
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
  // EXPORTAR EXCEL
  // ==========================================

  exportarExcel(): void {

    if (
      this.ventasFiltradas.length === 0
    ) {
      return;
    }


    const ventasExcel =
      this.ventasFiltradas.map(
        venta => ({

          Folio:
            venta.folio,

          Fecha:
            this.formatearFecha(
              venta.fechaCreacion
            ),

          Vendedor:
            venta.usuarioNombre ||
            venta.username ||
            'Sin vendedor',

          MetodoPago:
            this.formatearMetodoPago(
              venta.metodoPago
            ),

          Estado:
            venta.estado,

          Subtotal:
            Number(
              venta.subtotal || 0
            ),

          Impuesto:
            Number(
              venta.impuesto || 0
            ),

          Total:
            Number(
              venta.total || 0
            )

        })
      );


    const hojaVentas =
      XLSX.utils.json_to_sheet(
        ventasExcel
      );


    const resumenExcel = [

      {
        Concepto: 'Total de ventas',
        Valor: this.totalVentas
      },

      {
        Concepto: 'Ventas completadas',
        Valor: this.ventasCompletadas
      },

      {
        Concepto: 'Ventas canceladas',
        Valor: this.ventasCanceladas
      },

      {
        Concepto: 'Subtotal vendido',
        Valor: this.totalSubtotal
      },

      {
        Concepto: 'Impuestos',
        Valor: this.totalImpuesto
      },

      {
        Concepto: 'Total vendido',
        Valor: this.totalVendido
      }

    ];


    const hojaResumen =
      XLSX.utils.json_to_sheet(
        resumenExcel
      );


    const hojaProductos =
      XLSX.utils.json_to_sheet(
        this.productos.map(
          (producto, index) => ({

            Posicion:
              index + 1,

            Producto:
              producto.nombre,

            Unidades:
              producto.cantidad,

            Total:
              producto.total

          })
        )
      );


    const libro =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
      libro,
      hojaResumen,
      'Resumen'
    );


    XLSX.utils.book_append_sheet(
      libro,
      hojaVentas,
      'Ventas'
    );


    XLSX.utils.book_append_sheet(
      libro,
      hojaProductos,
      'Productos'
    );


    const nombreArchivo =
      `reporte-ventas-${this.fechaDesde}-${this.fechaHasta}.xlsx`;


    XLSX.writeFile(
      libro,
      nombreArchivo
    );

  }


  // ==========================================
  // EXPORTAR PDF
  // ==========================================

  exportarPDF(): void {

    if (
      this.ventasFiltradas.length === 0
    ) {
      return;
    }


    const doc =
      new jsPDF();


    const titulo =
      'FERRE CENTRO';


    const subtitulo =
      'Reporte de ventas';


    // ========================================
    // ENCABEZADO
    // ========================================

    doc.setFontSize(20);

    doc.setFont('helvetica', 'bold');

    doc.text(
      titulo,
      14,
      18
    );


    doc.setFontSize(14);

    doc.setFont('helvetica', 'normal');

    doc.text(
      subtitulo,
      14,
      27
    );


    doc.setFontSize(9);

    doc.text(
      `Periodo: ${this.formatearFechaTexto(this.fechaDesde)} - ${this.formatearFechaTexto(this.fechaHasta)}`,
      14,
      35
    );


    // ========================================
    // RESUMEN
    // ========================================

    autoTable(
      doc,
      {
        startY: 43,

        head: [
          [
            'Concepto',
            'Valor'
          ]
        ],

        body: [

          [
            'Total de ventas',
            this.totalVentas.toString()
          ],

          [
            'Ventas completadas',
            this.ventasCompletadas.toString()
          ],

          [
            'Ventas canceladas',
            this.ventasCanceladas.toString()
          ],

          [
            'Subtotal vendido',
            this.formatearMoneda(
              this.totalSubtotal
            )
          ],

          [
            'Impuestos',
            this.formatearMoneda(
              this.totalImpuesto
            )
          ],

          [
            'Total vendido',
            this.formatearMoneda(
              this.totalVendido
            )
          ]

        ],

        theme: 'grid',

        styles: {
          fontSize: 9
        }

      }
    );


    // ========================================
    // MÉTODOS DE PAGO
    // ========================================

    const yMetodos =
      (
        doc as any
      ).lastAutoTable.finalY + 10;


    doc.setFontSize(13);

    doc.setFont(
      'helvetica',
      'bold'
    );

    doc.text(
      'Métodos de pago',
      14,
      yMetodos
    );


    autoTable(
      doc,
      {

        startY:
          yMetodos + 5,

        head: [
          [
            'Método',
            'Ventas',
            'Total'
          ]
        ],

        body:
          this.metodosPago.map(
            metodo => [

              metodo.nombre,

              metodo.cantidad.toString(),

              this.formatearMoneda(
                metodo.total
              )

            ]
          ),

        theme: 'grid',

        styles: {
          fontSize: 9
        }

      }
    );


    // ========================================
    // PRODUCTOS
    // ========================================

    let yProductos =
      (
        doc as any
      ).lastAutoTable.finalY + 10;


    if (
      yProductos > 250
    ) {

      doc.addPage();

      yProductos = 20;

    }


    doc.setFontSize(13);

    doc.setFont(
      'helvetica',
      'bold'
    );

    doc.text(
      'Productos más vendidos',
      14,
      yProductos
    );


    autoTable(
      doc,
      {

        startY:
          yProductos + 5,

        head: [
          [
            '#',
            'Producto',
            'Unidades',
            'Total'
          ]
        ],

        body:
          this.productos.map(
            (producto, index) => [

              (index + 1).toString(),

              producto.nombre,

              producto.cantidad.toString(),

              this.formatearMoneda(
                producto.total
              )

            ]
          ),

        theme: 'grid',

        styles: {
          fontSize: 9
        }

      }
    );


    // ========================================
    // PIE
    // ========================================

    const paginas =
      doc.getNumberOfPages();


    for (
      let i = 1;
      i <= paginas;
      i++
    ) {

      doc.setPage(i);

      doc.setFontSize(8);

      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.text(
        `Página ${i} de ${paginas}`,
        14,
        290
      );

    }


    const nombreArchivo =
      `reporte-ventas-${this.fechaDesde}-${this.fechaHasta}.pdf`;


    doc.save(
      nombreArchivo
    );

  }


  // ==========================================
  // FECHA PARA MOSTRAR
  // ==========================================

  formatearFecha(
    fecha: string
  ): string {

    if (!fecha) {
      return '';
    }


    const fechaObj =
      new Date(fecha);


    return fechaObj.toLocaleDateString(
      'es-MX'
    );

  }


  // ==========================================
  // FECHA TEXTO PDF
  // ==========================================

  formatearFechaTexto(
    fecha: string
  ): string {

    if (!fecha) {
      return '';
    }


    const partes =
      fecha.split('-');


    if (
      partes.length !== 3
    ) {
      return fecha;
    }


    return `${partes[2]}/${partes[1]}/${partes[0]}`;

  }

}