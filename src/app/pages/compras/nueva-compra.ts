import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  Producto,
  ProductoService
} from '../../core/services/producto.service';

import {
  Compra,
  CompraItemRequest,
  CompraRequest,
  CompraService
} from '../../core/services/compra.service';

import { AuthService } from '../../core/services/auth.service';

interface CarritoItem {
  producto: Producto;
  cantidad: number;
  subtotal: number;
}

@Component({
  selector: 'app-nueva-compra',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './nueva-compra.html',
  styleUrl: './nueva-compra.css'
})
export class NuevaCompra implements OnInit {

  // ==========================================
  // PRODUCTOS
  // ==========================================

  productos: Producto[] = [];

  productosFiltrados: Producto[] = [];

  buscarProductoTexto = '';

  cargando = false;

  error = '';

  // ==========================================
  // CARRITO
  // ==========================================

  carrito: CarritoItem[] = [];

  // ==========================================
  // DATOS DE LA COMPRA
  // ==========================================

  usuarioId: number | null = null;

  usuarioNombre = '';

  guardando = false;

  mensaje = '';

  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private productoService: ProductoService,
    private compraService: CompraService,
    private authService: AuthService,
    private router: Router,
     private route: ActivatedRoute
  ) {}

  // ==========================================
  // INIT
  // ==========================================

  ngOnInit(): void {

    this.obtenerUsuario();

    this.cargarProductos();

  }

  // ==========================================
  // OBTENER USUARIO
  // ==========================================

  obtenerUsuario(): void {

    const username = this.authService.getUsername();

    this.usuarioNombre = username ?? '';

    /*
     * Por ahora intentamos obtener el ID desde
     * localStorage si ya fue guardado por el login.
     */

    const usuarioIdGuardado =
      localStorage.getItem('usuarioId');

    if (usuarioIdGuardado) {

      this.usuarioId =
        Number(usuarioIdGuardado);

    }

  }

  // ==========================================
  // CARGAR PRODUCTOS
  // ==========================================

 cargarProductos(): void {
  this.cargando = true;
  this.error = '';

  this.productoService.obtenerActivos().subscribe({
    next: productos => {
      this.productos = productos;
      this.productosFiltrados = [...productos];
      this.cargando = false;

      this.route.queryParamMap.subscribe(params => {
        const productoId = Number(params.get('productoId'));

        if (!productoId) {
          return;
        }

        const producto = this.productos.find(
          p => Number(p.id) === productoId
        );

        if (producto) {
          this.agregarProducto(producto);
          this.buscarProductoTexto = producto.nombre;
          this.buscarProductos();
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { productoId: null },
            queryParamsHandling: 'merge',
            replaceUrl: true
          });
        } else {
          this.error =
            'No se encontró el producto seleccionado. Puede estar inactivo o ya no estar disponible.';
        }
      });
    },
    error: error => {
      console.error('Error al cargar productos:', error);
      this.error = 'No se pudieron cargar los productos.';
      this.cargando = false;
    }
  });
}
  // ==========================================
  // BUSCAR PRODUCTOS
  // ==========================================

  buscarProductos(): void {

    const texto =
      this.buscarProductoTexto
        .trim()
        .toLowerCase();

    if (!texto) {

      this.productosFiltrados =
        [...this.productos];

      return;

    }

    this.productosFiltrados =
      this.productos.filter(producto =>
        producto.nombre
          .toLowerCase()
          .includes(texto)
        ||
        producto.codigo
          .toLowerCase()
          .includes(texto)
        ||
        producto.marca
          .toLowerCase()
          .includes(texto)
      );

  }

  // ==========================================
  // AGREGAR AL CARRITO
  // ==========================================

  agregarProducto(producto: Producto): void {

    if (!producto.activo) {

      return;

    }

    const itemExistente =
      this.carrito.find(
        item =>
          item.producto.id === producto.id
      );

    if (itemExistente) {

      itemExistente.cantidad++;

      this.actualizarSubtotal(
        itemExistente
      );

      return;

    }

    const nuevoItem: CarritoItem = {

      producto,

      cantidad: 1,

      subtotal: Number(
        producto.precioCompra
      )

    };

    this.carrito.push(nuevoItem);

  }

  // ==========================================
  // AUMENTAR CANTIDAD
  // ==========================================

  aumentarCantidad(
    item: CarritoItem
  ): void {

    item.cantidad++;

    this.actualizarSubtotal(item);

  }

  // ==========================================
  // DISMINUIR CANTIDAD
  // ==========================================

  disminuirCantidad(
    item: CarritoItem
  ): void {

    if (item.cantidad <= 1) {

      this.eliminarDelCarrito(item);

      return;

    }

    item.cantidad--;

    this.actualizarSubtotal(item);

  }

  // ==========================================
  // ACTUALIZAR SUBTOTAL
  // ==========================================

  actualizarSubtotal(
    item: CarritoItem
  ): void {

    item.subtotal =
      Number(item.producto.precioCompra)
      * item.cantidad;

  }

  // ==========================================
  // ELIMINAR DEL CARRITO
  // ==========================================

  eliminarDelCarrito(
    item: CarritoItem
  ): void {

    this.carrito =
      this.carrito.filter(
        elemento =>
          elemento !== item
      );

  }

  // ==========================================
  // CAMBIAR CANTIDAD MANUALMENTE
  // ==========================================

  cambiarCantidad(
    item: CarritoItem
  ): void {

    if (
      !item.cantidad ||
      item.cantidad < 1
    ) {

      item.cantidad = 1;

    }

    this.actualizarSubtotal(item);

  }

  // ==========================================
  // OBTENER SUBTOTAL
  // ==========================================

  obtenerSubtotal(): number {

    return this.carrito.reduce(
      (total, item) =>
        total + item.subtotal,
      0
    );

  }

  // ==========================================
  // OBTENER IMPUESTO
  // ==========================================

  obtenerImpuesto(): number {

    /*
     * IVA del 16%.
     */

    return this.obtenerSubtotal() * 0.16;

  }

  // ==========================================
  // OBTENER TOTAL
  // ==========================================

  obtenerTotal(): number {

    return (
      this.obtenerSubtotal()
      +
      this.obtenerImpuesto()
    );

  }

  // ==========================================
  // FORMATEAR DINERO
  // ==========================================

  formatearDinero(
    cantidad: number
  ): string {

    return cantidad.toLocaleString(
      'es-MX',
      {
        style: 'currency',
        currency: 'MXN'
      }
    );

  }

  // ==========================================
  // LIMPIAR COMPRA
  // ==========================================

  limpiarCompra(): void {

    this.carrito = [];

    this.mensaje = '';

    this.error = '';

  }

  // ==========================================
  // FINALIZAR COMPRA
  // ==========================================

  finalizarCompra(): void {

    this.error = '';

    this.mensaje = '';

    if (this.carrito.length === 0) {

      this.error =
        'Agrega al menos un producto a la compra.';

      return;

    }

    if (!this.usuarioId) {

      this.error =
        'No se pudo identificar al usuario.';

      return;

    }

    this.guardando = true;

    const items: CompraItemRequest[] =
      this.carrito.map(item => ({

        productoId:
          item.producto.id,

        cantidad:
          item.cantidad

      }));

    const request: CompraRequest = {

      usuarioId:
        this.usuarioId,

      items

    };

    this.compraService.crear(request)
      .subscribe({

        next: compra => {

          console.log(
            'Compra creada:',
            compra
          );

          this.guardando = false;

          this.mensaje =
            `Compra ${compra.folio} registrada correctamente.`;

          this.carrito = [];

          /*
           * Regresamos al listado después
           * de registrar correctamente.
           */

          setTimeout(() => {

            this.router.navigate(
              ['/compras']
            );

          }, 1200);

        },

        error: error => {

          console.error(
            'Error al registrar compra:',
            error
          );

          this.guardando = false;

          this.error =
            error?.error?.message
            ||
            'No se pudo registrar la compra.';

        }

      });

  }

  // ==========================================
  // REGRESAR
  // ==========================================

  regresar(): void {

    this.router.navigate(
      ['/compras']
    );

  }

}
