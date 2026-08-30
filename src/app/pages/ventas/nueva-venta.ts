import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  ProductoService,
  Producto
} from '../../core/services/producto.service';

import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';


// ==========================================
// ITEM DEL CARRITO
// ==========================================

interface CarritoItem {

  producto: Producto;

  cantidad: number;

  subtotal: number;

}


// ==========================================
// REQUEST DE VENTA
// ==========================================

interface VentaItemRequest {

  productoId: number;

  cantidad: number;

}


interface VentaRequest {

  usuarioId: number;

  metodoPago: string;

  items: VentaItemRequest[];

}


// ==========================================
// RESPONSE DE VENTA
// ==========================================

interface VentaResponse {

  id: number;

  folio: string;

  usuarioId?: number;

  usuarioNombre?: string;

  username?: string;

  subtotal?: number;

  impuesto?: number;

  total?: number;

  metodoPago?: string;

  estado?: string;

  fechaCreacion?: string;

}


@Component({

  selector: 'app-nueva-venta',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './nueva-venta.html',

  styleUrl: './nueva-venta.css'

})


export class NuevaVenta implements OnInit {


  // ==========================================
  // PRODUCTOS
  // ==========================================

  productos: Producto[] = [];

  productosFiltrados: Producto[] = [];

  busqueda: string = '';

  cargando: boolean = false;

  error: string = '';


  // ==========================================
  // CARRITO
  // ==========================================

  carrito: CarritoItem[] = [];


  // ==========================================
  // MÉTODO DE PAGO
  // ==========================================

  metodoPago: string = 'EFECTIVO';


  // ==========================================
  // ESTADO DE LA VENTA
  // ==========================================

  guardando: boolean = false;

  mensajeExito: string = '';


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(

    private productoService: ProductoService,

    private apiService: ApiService,

    private authService: AuthService,

    private router: Router

  ) {}


  // ==========================================
  // INICIALIZAR
  // ==========================================

  ngOnInit(): void {

    this.cargarProductos();

  }


  // ==========================================
  // CARGAR PRODUCTOS
  // ==========================================

  cargarProductos(): void {

    this.cargando = true;

    this.error = '';

    this.productoService
      .obtenerActivos()
      .subscribe({

        next: (productos) => {

          this.productos = productos;

          this.productosFiltrados = productos;

          this.cargando = false;

        },

        error: (error) => {

          console.error(
            'Error al cargar productos:',
            error
          );

          this.error =
            error?.error?.message ||
            'No se pudieron cargar los productos.';

          this.cargando = false;

        }

      });

  }


  // ==========================================
  // BUSCAR PRODUCTO
  // ==========================================

  buscarProducto(): void {

    this.buscarProductos();

  }


  // ==========================================
  // BUSCAR PRODUCTOS
  // ==========================================

  buscarProductos(): void {

    const texto =
      this.busqueda
        .trim()
        .toLowerCase();


    if (!texto) {

      this.productosFiltrados =
        this.productos;

      return;

    }


    this.productosFiltrados =
      this.productos.filter(producto => {

        const nombre =
          producto.nombre
            ?.toLowerCase() || '';

        const codigo =
          producto.codigo
            ?.toLowerCase() || '';

        const marca =
          producto.marca
            ?.toLowerCase() || '';


        return (

          nombre.includes(texto) ||

          codigo.includes(texto) ||

          marca.includes(texto)

        );

      });

  }


  // ==========================================
  // AGREGAR PRODUCTO
  // ==========================================

  agregarAlCarrito(
    producto: Producto
  ): void {

    this.error = '';


    if (producto.stock <= 0) {

      this.error =
        `El producto "${producto.nombre}" no tiene stock disponible.`;

      return;

    }


    const item =
      this.carrito.find(

        elemento =>
          elemento.producto.id ===
          producto.id

      );


    if (item) {

      if (
        item.cantidad <
        producto.stock
      ) {

        item.cantidad++;

        this.actualizarSubtotalItem(item);

      } else {

        this.error =
          `No hay más stock disponible de "${producto.nombre}".`;

      }

      return;

    }


    const nuevoItem: CarritoItem = {

      producto: producto,

      cantidad: 1,

      subtotal:
        Number(producto.precioVenta)

    };


    this.carrito.push(
      nuevoItem
    );

  }


  // ==========================================
  // AUMENTAR CANTIDAD
  // ==========================================

  aumentarCantidad(
    item: CarritoItem
  ): void {

    this.error = '';


    if (
      item.cantidad <
      item.producto.stock
    ) {

      item.cantidad++;

      this.actualizarSubtotalItem(item);

    } else {

      this.error =
        `No hay más stock disponible de "${item.producto.nombre}".`;

    }

  }


  // ==========================================
  // DISMINUIR CANTIDAD
  // ==========================================

  disminuirCantidad(
    item: CarritoItem
  ): void {

    this.error = '';


    if (item.cantidad > 1) {

      item.cantidad--;

      this.actualizarSubtotalItem(item);

      return;

    }


    this.eliminarDelCarrito(item);

  }


  // ==========================================
  // ACTUALIZAR SUBTOTAL DEL ITEM
  // ==========================================

  private actualizarSubtotalItem(
    item: CarritoItem
  ): void {

    item.subtotal =

      Number(
        item.producto.precioVenta
      )

      *

      item.cantidad;

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
          elemento.producto.id !==
          item.producto.id

      );

  }


  // ==========================================
  // LIMPIAR VENTA
  // ==========================================

  limpiarVenta(): void {

    this.carrito = [];

    this.error = '';

    this.mensajeExito = '';

  }


  // ==========================================
  // LIMPIAR CARRITO
  // ==========================================

  limpiarCarrito(): void {

    this.limpiarVenta();

  }


  // ==========================================
  // SUBTOTAL
  // ==========================================

  obtenerSubtotal(): number {

    return this.carrito.reduce(

      (total, item) => {

        return total +
          (
            Number(
              item.producto.precioVenta
            ) *
            item.cantidad
          );

      },

      0

    );

  }


  // ==========================================
  // IMPUESTO
  // ==========================================

  obtenerImpuesto(): number {

    return this.obtenerSubtotal() * 0.16;

  }


  // ==========================================
  // TOTAL
  // ==========================================

  obtenerTotal(): number {

    return (

      this.obtenerSubtotal() +

      this.obtenerImpuesto()

    );

  }


  // ==========================================
  // GET SUBTOTAL
  // ==========================================

  get subtotal(): number {

    return this.obtenerSubtotal();

  }


  // ==========================================
  // GET IMPUESTO
  // ==========================================

  get impuesto(): number {

    return this.obtenerImpuesto();

  }


  // ==========================================
  // GET TOTAL
  // ==========================================

  get total(): number {

    return this.obtenerTotal();

  }


  // ==========================================
  // CANTIDAD DE PRODUCTOS
  // ==========================================

  get cantidadProductos(): number {

    return this.carrito.reduce(

      (total, item) =>
        total + item.cantidad,

      0

    );

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
    ).format(
      Number(cantidad) || 0
    );

  }


  // ==========================================
  // SELECCIONAR MÉTODO DE PAGO
  // ==========================================

  seleccionarMetodoPago(
    metodo: string
  ): void {

    this.metodoPago = metodo;

  }


  // ==========================================
  // FINALIZAR VENTA
  // ==========================================

  finalizarVenta(): void {

    this.error = '';

    this.mensajeExito = '';


    // ----------------------------------------
    // VALIDAR CARRITO
    // ----------------------------------------

    if (
      this.carrito.length === 0
    ) {

      this.error =
        'Agrega al menos un producto al carrito.';

      return;

    }


    // ----------------------------------------
    // OBTENER USUARIO
    // ----------------------------------------

    const usuarioId =
      this.authService.getUsuarioId();


    console.log(
      '======================================'
    );

    console.log(
      'USUARIO ACTUAL:',
      usuarioId
    );

    console.log(
      '======================================'
    );


    if (usuarioId === null) {

      this.error =
        'No se pudo identificar al usuario actual. Inicia sesión nuevamente.';

      return;

    }


    // ----------------------------------------
    // CREAR REQUEST
    // ----------------------------------------

    const request: VentaRequest = {

      usuarioId: usuarioId,

      metodoPago: this.metodoPago,

      items:

        this.carrito.map(item => ({

          productoId:
            item.producto.id,

          cantidad:
            item.cantidad

        }))

    };


    // ----------------------------------------
    // MOSTRAR REQUEST
    // ----------------------------------------

    console.log(
      'REQUEST DE VENTA:',
      request
    );


    // ----------------------------------------
    // GUARDANDO
    // ----------------------------------------

    this.guardando = true;


    // ----------------------------------------
    // ENVIAR AL BACKEND
    // ----------------------------------------

    this.apiService
      .post<VentaResponse>(
        '/ventas',
        request
      )
      .subscribe({

        // ====================================
        // ÉXITO
        // ====================================

        next: (response) => {

          console.log(
            '======================================'
          );

          console.log(
            'VENTA CREADA CORRECTAMENTE'
          );

          console.log(
            response
          );

          console.log(
            '======================================'
          );


          this.guardando = false;


          this.mensajeExito =
            'Venta realizada correctamente.';


          const folio =
            response?.folio ||
            'Sin folio';


          const total =
            Number(
              response?.total ??
              this.obtenerTotal()
            );


          alert(

            `Venta realizada correctamente.\n\n` +

            `Folio: ${folio}\n` +

            `Total: ${this.formatearDinero(total)}`

          );


          // ----------------------------------
          // REGRESAR A VENTAS
          // ----------------------------------

          this.router.navigate([
            '/ventas'
          ]);

        },


        // ====================================
        // ERROR
        // ====================================

        error: (error) => {

          console.error(
            '======================================'
          );

          console.error(
            'ERROR AL CREAR VENTA'
          );

          console.error(
            error
          );

          console.error(
            '======================================'
          );


          this.guardando = false;


          this.error =

            error?.error?.message ||

            error?.error?.error ||

            'No se pudo realizar la venta.';

        }

      });

  }


  // ==========================================
  // VOLVER A VENTAS
  // ==========================================

  volverAVentas(): void {

    this.router.navigate([
      '/ventas'
    ]);

  }

}