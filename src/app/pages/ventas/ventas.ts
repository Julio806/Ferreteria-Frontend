
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../core/services/api.service';

// ==========================================
// INTERFACES
// ==========================================

export interface VentaItem {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Venta {
  id: number;
  folio: string;
  usuarioId: number;
  usuarioNombre: string;
  username: string;
  subtotal: number;
  impuesto: number;
  total: number;
  metodoPago: string;
  estado: string;
  fechaCreacion: string;
  items: VentaItem[];
}

// ==========================================
// COMPONENTE
// ==========================================

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css'
})
export class Ventas implements OnInit {

  // ==========================================
  // LISTA DE VENTAS
  // ==========================================

  ventas: Venta[] = [];
  ventasFiltradas: Venta[] = [];

  // ==========================================
  // PAGINACIÓN
  // ==========================================

  paginaActual = 1;
  ventasPorPagina = 10;

  // Ventas que corresponden a la página actual
  get ventasPaginadas(): Venta[] {
    const inicio =
      (this.paginaActual - 1) * this.ventasPorPagina;

    const fin = inicio + this.ventasPorPagina;

    return this.ventasFiltradas.slice(inicio, fin);
  }

  // Total de páginas disponibles
  get totalPaginas(): number {
    return Math.ceil(
      this.ventasFiltradas.length / this.ventasPorPagina
    );
  }

  // Números de página: 1, 2, 3...
  get paginas(): number[] {
    return Array.from(
      { length: this.totalPaginas },
      (_, indice) => indice + 1
    );
  }

  // Primer registro visible
  get primerRegistro(): number {
    if (this.ventasFiltradas.length === 0) {
      return 0;
    }

    return (
      (this.paginaActual - 1) * this.ventasPorPagina + 1
    );
  }

  // Último registro visible
  get ultimoRegistro(): number {
    return Math.min(
      this.paginaActual * this.ventasPorPagina,
      this.ventasFiltradas.length
    );
  }

  // Cambiar de página
  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) {
      return;
    }

    this.paginaActual = pagina;
  }

  // ==========================================
  // ESTADOS
  // ==========================================

  cargando = false;
  error = '';

  // ==========================================
  // BUSCADOR
  // ==========================================

  busqueda = '';

  // ==========================================
  // VENTA SELECCIONADA
  // ==========================================

  ventaSeleccionada: Venta | null = null;
  mostrarDetalle = false;

  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  // ==========================================
  // INICIALIZAR
  // ==========================================

  ngOnInit(): void {
    this.cargarVentas();
  }

  // ==========================================
  // NUEVA VENTA
  // ==========================================

  nuevaVenta(): void {
    this.router.navigate(['/ventas/nueva']);
  }

  // ==========================================
  // OBTENER VENTAS
  // ==========================================

  cargarVentas(): void {
    this.cargando = true;
    this.error = '';

    this.apiService
      .get<Venta[]>('/ventas')
      .subscribe({
        next: (response) => {
          this.ventas = response ?? [];

          // Aplicar nuevamente el filtro actual
          this.aplicarFiltro();

          // Regresar a la primera página
          this.paginaActual = 1;

          this.cargando = false;
        },

        error: (err) => {
          console.error(
            'Error al cargar ventas:',
            err
          );

          this.error =
            'No se pudieron cargar las ventas.';

          this.cargando = false;
        }
      });
  }

  // ==========================================
  // BUSCAR VENTAS
  // ==========================================

  buscar(): void {
    // Volver a la primera página al buscar
    this.paginaActual = 1;

    this.aplicarFiltro();
  }

  // Aplicar filtro sin perder el texto de búsqueda

  private aplicarFiltro(): void {

    const texto = this.busqueda
      .trim()
      .toLowerCase();

    // Primero aplicar la búsqueda
    const resultados = !texto
      ? [...this.ventas]
      : this.ventas.filter((venta) => {

        return (
          venta.folio?.toLowerCase().includes(texto) ||
          venta.usuarioNombre?.toLowerCase().includes(texto) ||
          venta.username?.toLowerCase().includes(texto) ||
          venta.metodoPago?.toLowerCase().includes(texto) ||
          venta.estado?.toLowerCase().includes(texto)
        );

      });

    // Después ordenar por fecha: más recientes primero
    this.ventasFiltradas = resultados.sort((a, b) => {

      const fechaA = new Date(a.fechaCreacion).getTime();
      const fechaB = new Date(b.fechaCreacion).getTime();

      return fechaB - fechaA;

    });

  }


  // ==========================================
  // VER DETALLE DE VENTA
  // ==========================================

  verVenta(venta: Venta): void {
    this.ventaSeleccionada = venta;
    this.mostrarDetalle = true;
  }

  // ==========================================
  // CERRAR DETALLE
  // ==========================================

  cerrarDetalle(): void {
    this.mostrarDetalle = false;
    this.ventaSeleccionada = null;
  }

  // ==========================================
  // FORMATEAR DINERO
  // ==========================================

  formatearDinero(cantidad: number): string {
    return new Intl.NumberFormat(
      'es-MX',
      {
        style: 'currency',
        currency: 'MXN'
      }
    ).format(cantidad ?? 0);
  }

  // ==========================================
  // FORMATEAR FECHA
  // ==========================================

  formatearFecha(fecha: string): string {
    if (!fecha) {
      return '-';
    }

    const fechaConvertida = new Date(fecha);

    if (Number.isNaN(fechaConvertida.getTime())) {
      return '-';
    }

    return fechaConvertida.toLocaleDateString(
      'es-MX',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    );
  }

  // ==========================================
  // FORMATEAR HORA
  // ==========================================

  formatearHora(fecha: string): string {
    if (!fecha) {
      return '';
    }

    const fechaConvertida = new Date(fecha);

    if (Number.isNaN(fechaConvertida.getTime())) {
      return '';
    }

    return fechaConvertida.toLocaleTimeString(
      'es-MX',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  }

  // ==========================================
  // MÉTODO DE PAGO
  // ==========================================

  obtenerMetodoPago(metodo: string): string {
    switch (metodo) {
      case 'EFECTIVO':
        return 'Efectivo';

      case 'TARJETA':
        return 'Tarjeta';

      case 'TRANSFERENCIA':
        return 'Transferencia';

      default:
        return metodo || '-';
    }
  }

  // ==========================================
  // ESTADO DE VENTA
  // ==========================================

  obtenerEstado(estado: string): string {
    switch (estado) {
      case 'COMPLETADA':
        return 'Completada';

      case 'CANCELADA':
        return 'Cancelada';

      case 'PENDIENTE':
        return 'Pendiente';

      default:
        return estado || '-';
    }
  }

  // ==========================================
  // CANCELAR VENTA
  // ==========================================

  cancelarVenta(venta: Venta): void {
    const confirmar = confirm(
      `¿Deseas cancelar la venta ${venta.folio}?`
    );

    if (!confirmar) {
      return;
    }

    this.apiService
      .put<void>(
        `/ventas/${venta.id}/cancelar`,
        {}
      )
      .subscribe({
        next: () => {
          // Recargar ventas y actualizar el paginador
          this.cargarVentas();
        },

        error: (err) => {
          console.error(
            'Error al cancelar venta:',
            err
          );

          alert(
            'No se pudo cancelar la venta.'
          );
        }
      });
  }

  // ==========================================
  // TICKET DE UNA VENTA EXISTENTE
  // ==========================================

  ticketSeleccionado: Venta | null = null;
  mostrarTicket = false;

  verTicket(venta: Venta): void {
    this.ticketSeleccionado = venta;
    this.mostrarTicket = true;
  }

  cerrarTicket(): void {
    this.mostrarTicket = false;
    this.ticketSeleccionado = null;
  }

  imprimirTicketVenta(): void {
    const venta = this.ticketSeleccionado;

    if (!venta) {
      return;
    }

    const dinero = (cantidad: number) =>
      new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(Number(cantidad) || 0);

    const escapar = (valor: unknown) =>
      String(valor ?? '').replace(/[&<>"']/g, caracter => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[caracter] ?? caracter);

    const productos = (venta.items ?? []).map(item => `
      <div class="producto">
        <strong>${escapar(item.productoNombre)}</strong>
        <div class="detalle">
          <span>${item.cantidad} x ${dinero(item.precioUnitario)}</span>
          <strong>${dinero(item.subtotal)}</strong>
        </div>
      </div>
    `).join('');

    const ventana = window.open('', '_blank', 'width=420,height=700');

    if (!ventana) {
      alert('Permite las ventanas emergentes para imprimir el ticket.');
      return;
    }

    ventana.document.open();
    ventana.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Ticket ${escapar(venta.folio)}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          * { box-sizing: border-box; }
          body {
            width: 80mm;
            margin: 0;
            padding: 5mm;
            color: #000;
            background: #fff;
            font: 11px Arial, sans-serif;
          }
          .ticket { width: 100%; }
          .centro { text-align: center; }
          h1 { font-size: 19px; margin: 0 0 4px; }
          p { margin: 3px 0; }
          hr { border: 0; border-top: 1px dashed #000; margin: 10px 0; }
          .dato, .detalle, .total {
            display: flex;
            justify-content: space-between;
            gap: 8px;
            margin: 5px 0;
          }
          .dato span { flex-shrink: 0; }
          .dato strong { text-align: right; overflow-wrap: anywhere; }
          .producto { margin: 8px 0; overflow-wrap: anywhere; }
          .detalle { font-size: 10px; }
          .total { font-size: 15px; font-weight: bold; }
          .pie { margin-top: 16px; text-align: center; }
          .logo-ticket {
  display: block;
  width: 100%;
  max-width: 68mm;
  max-height: 27mm;
  object-fit: contain;
  margin: 0 auto 5mm;
}
        </style>
      </head>
      <body>
        <main class="ticket">
<header class="centro">
  <img
    src="${window.location.origin}/logo-gum.png"
    alt="Ferretería GUM"
    class="logo-ticket"
  />
  <p>COMPROBANTE DE VENTA</p>
</header>

          <hr>

          <div class="dato">
            <span>Folio:</span>
            <strong>${escapar(venta.folio)}</strong>
          </div>
          <div class="dato">
            <span>Fecha:</span>
            <strong>${escapar(this.formatearFecha(venta.fechaCreacion))}</strong>
          </div>
          <div class="dato">
            <span>Vendedor:</span>
            <strong>${escapar(venta.usuarioNombre || venta.username || 'N/A')}</strong>
          </div>
          <div class="dato">
            <span>Estado:</span>
            <strong>${escapar(this.obtenerEstado(venta.estado))}</strong>
          </div>

          <hr>
          <strong>PRODUCTOS</strong>
          ${productos || '<p>Sin productos registrados.</p>'}

          <hr>
          <div class="dato">
            <span>Subtotal</span>
            <strong>${dinero(venta.subtotal)}</strong>
          </div>
          <div class="dato">
            <span>IVA</span>
            <strong>${dinero(venta.impuesto)}</strong>
          </div>
          <div class="total">
            <span>TOTAL</span>
            <span>${dinero(venta.total)}</span>
          </div>
          <hr>
          <div class="dato">
            <span>Método de pago:</span>
            <strong>${escapar(this.obtenerMetodoPago(venta.metodoPago))}</strong>
          </div>

          <footer class="pie">
            <strong>¡Gracias por su compra!</strong>
            <p>Ferre Centro</p>
          </footer>
        </main>
        <script>
          window.onload = () => {
            window.focus();
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    ventana.document.close();
  }

}
