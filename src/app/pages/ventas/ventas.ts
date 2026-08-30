import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  FormsModule
} from '@angular/forms';

import {
  ApiService
} from '../../core/services/api.service';


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
  ) {}


  // ==========================================
  // INICIALIZAR
  // ==========================================

  ngOnInit(): void {

    this.cargarVentas();

  }


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

          this.ventas = response;

          this.ventasFiltradas = [...response];

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

    const texto =
      this.busqueda
        .trim()
        .toLowerCase();


    if (!texto) {

      this.ventasFiltradas =
        [...this.ventas];

      return;

    }


    this.ventasFiltradas =
      this.ventas.filter(venta => {

        return (

          venta.folio
            ?.toLowerCase()
            .includes(texto)

          ||

          venta.usuarioNombre
            ?.toLowerCase()
            .includes(texto)

          ||

          venta.username
            ?.toLowerCase()
            .includes(texto)

          ||

          venta.metodoPago
            ?.toLowerCase()
            .includes(texto)

          ||

          venta.estado
            ?.toLowerCase()
            .includes(texto)

        );

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

  formatearDinero(
    cantidad: number
  ): string {

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

  formatearFecha(
    fecha: string
  ): string {

    if (!fecha) {
      return '-';
    }

    return new Date(fecha)
      .toLocaleDateString(
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

  formatearHora(
    fecha: string
  ): string {

    if (!fecha) {
      return '';
    }

    return new Date(fecha)
      .toLocaleTimeString(
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

  obtenerMetodoPago(
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
        return metodo || '-';

    }

  }


  // ==========================================
  // ESTADO DE VENTA
  // ==========================================

  obtenerEstado(
    estado: string
  ): string {

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

  cancelarVenta(
    venta: Venta
  ): void {

    const confirmar =
      confirm(
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


}