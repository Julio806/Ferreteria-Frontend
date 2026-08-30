import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../core/services/api.service';


// ==========================================
// INTERFACES
// ==========================================

export interface CompraItem {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Compra {
  id: number;
  folio: string;

  usuarioId: number;
  usuarioNombre: string;
  username: string;

  subtotal: number;
  impuesto: number;
  total: number;

  estado: 'COMPLETADA' | 'CANCELADA';

  fechaCreacion: string;

  items: CompraItem[];
}


// ==========================================
// COMPONENTE
// ==========================================

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [
    CommonModule
    , FormsModule
  ],
  templateUrl: './compras.html',
  styleUrl: './compras.css'
})
export class Compras implements OnInit {

  // ==========================================
  // DATOS
  // ==========================================

  compras: Compra[] = [];

  comprasFiltradas: Compra[] = [];

  cargando = false;

  error = '';

  // ==========================================
  // BÚSQUEDA
  // ==========================================

  terminoBusqueda = '';

  filtroEstado = 'TODOS';

  // ==========================================
  // MODAL
  // ==========================================

  compraSeleccionada: Compra | null = null;

  mostrarDetalle = false;

  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  // ==========================================
  // INIT
  // ==========================================

  ngOnInit(): void {

    this.cargarCompras();

  }

  // ==========================================
  // CARGAR COMPRAS
  // ==========================================

  cargarCompras(): void {

    this.cargando = true;

    this.error = '';

    this.apiService
      .get<Compra[]>('/compras')
      .subscribe({

        next: (response) => {

          this.compras = response || [];

          this.aplicarFiltros();

          this.cargando = false;

        },

        error: (err) => {

          console.error(
            'Error al cargar compras:',
            err
          );

          this.error =
            'No se pudieron cargar las compras.';

          this.cargando = false;

        }

      });

  }

  // ==========================================
  // BUSCAR
  // ==========================================

  buscarCompra(): void {

    this.aplicarFiltros();

  }

  // ==========================================
  // APLICAR FILTROS
  // ==========================================

  aplicarFiltros(): void {

    let resultado = [...this.compras];

    // ----------------------------------------
    // FILTRO POR ESTADO
    // ----------------------------------------

    if (this.filtroEstado !== 'TODOS') {

      resultado = resultado.filter(
        compra =>
          compra.estado === this.filtroEstado
      );

    }

    // ----------------------------------------
    // FILTRO POR TEXTO
    // ----------------------------------------

    const termino =
      this.terminoBusqueda
        .trim()
        .toLowerCase();

    if (termino) {

      resultado = resultado.filter(
        compra =>

          compra.folio
            ?.toLowerCase()
            .includes(termino)

          ||

          compra.usuarioNombre
            ?.toLowerCase()
            .includes(termino)

          ||

          compra.username
            ?.toLowerCase()
            .includes(termino)

      );

    }

    this.comprasFiltradas = resultado;

  }

  // ==========================================
  // CAMBIAR FILTRO
  // ==========================================

  cambiarFiltroEstado(
    estado: string
  ): void {

    this.filtroEstado = estado;

    this.aplicarFiltros();

  }

  // ==========================================
  // VER COMPRA
  // ==========================================

  verCompra(
    compra: Compra
  ): void {

    this.compraSeleccionada = compra;

    this.mostrarDetalle = true;

  }

  // ==========================================
  // CERRAR DETALLE
  // ==========================================

  cerrarDetalle(): void {

    this.mostrarDetalle = false;

    this.compraSeleccionada = null;

  }

  // ==========================================
  // CANCELAR COMPRA
  // ==========================================

  cancelarCompra(
    compra: Compra
  ): void {

    if (compra.estado === 'CANCELADA') {

      return;

    }

    const confirmar =
      window.confirm(
        `¿Estás seguro de cancelar la compra ${compra.folio}?`
      );

    if (!confirmar) {

      return;

    }

    this.apiService
      .put<void>(
        `/compras/${compra.id}/cancelar`,
        {}
      )
      .subscribe({

        next: () => {

          alert(
            'Compra cancelada correctamente.'
          );

          this.cerrarDetalle();

          this.cargarCompras();

        },

        error: (err) => {

          console.error(
            'Error al cancelar compra:',
            err
          );

          alert(
            'No se pudo cancelar la compra.'
          );

        }

      });

  }

  // ==========================================
  // NUEVA COMPRA
  // ==========================================

  nuevaCompra(): void {

    this.router.navigate([
      '/compras/nueva'
    ]);

  }

  // ==========================================
  // TOTAL DE COMPRAS
  // ==========================================

  obtenerTotalCompras(): number {

    return this.compras.length;

  }

  // ==========================================
  // COMPRAS COMPLETADAS
  // ==========================================

  obtenerComprasCompletadas(): number {

    return this.compras.filter(
      compra =>
        compra.estado === 'COMPLETADA'
    ).length;

  }

  // ==========================================
  // COMPRAS CANCELADAS
  // ==========================================

  obtenerComprasCanceladas(): number {

    return this.compras.filter(
      compra =>
        compra.estado === 'CANCELADA'
    ).length;

  }

  // ==========================================
  // TOTAL GASTADO
  // ==========================================

  obtenerTotalGastado(): number {

    return this.compras
      .filter(
        compra =>
          compra.estado === 'COMPLETADA'
      )
      .reduce(
        (total, compra) =>
          total + Number(compra.total || 0),
        0
      );

  }

  // ==========================================
  // FORMATEAR DINERO
  // ==========================================

  formatearDinero(
    cantidad: number
  ): string {

    return Number(cantidad || 0)
      .toLocaleString(
        'es-MX',
        {
          style: 'currency',
          currency: 'MXN'
        }
      );

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
      .toLocaleString(
        'es-MX',
        {
          dateStyle: 'short',
          timeStyle: 'short'
        }
      );

  }

}