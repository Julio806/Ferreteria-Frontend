import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';

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

  private errorTimeout: ReturnType<typeof setTimeout> | undefined;


  // ==========================================
  // TICKET
  // ==========================================

  ventaRealizada: VentaResponse | null = null;

  mostrarTicket: boolean = false;


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(

    private productoService: ProductoService,

    private apiService: ApiService,

    private authService: AuthService,

    private router: Router

  ) { }


  // ==========================================
  // INICIALIZAR
  // ==========================================

  ngOnInit(): void {

    this.cargarProductos();

  }


  // ==========================================
  // NOTIFICACIONES DE ERROR
  // ==========================================

  mostrarError(mensaje: string): void {

    this.error = mensaje;

    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }

    this.errorTimeout = setTimeout(() => {
      this.error = '';
      this.errorTimeout = undefined;
    }, 4000);

  }

  cerrarMensajeError(): void {

    this.error = '';

    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
      this.errorTimeout = undefined;
    }

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

          this.mostrarError(
            error?.error?.message ||
            'No se pudieron cargar los productos.'
          );

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

      this.mostrarError(
        `El producto "${producto.nombre}" no tiene stock disponible.`
      );

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

        this.mostrarError(
          `No hay más stock disponible de "${producto.nombre}".`
        );

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

      this.mostrarError(
        `No hay más stock disponible de "${item.producto.nombre}".`
      );

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

    this.ventaRealizada = null;

    this.mostrarTicket = false;

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
  // FORMATEAR FECHA
  // ==========================================

  formatearFecha(
    fecha?: string
  ): string {

    if (!fecha) {

      return new Date().toLocaleString(
        'es-MX'
      );

    }

    return new Date(fecha).toLocaleString(
      'es-MX'
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

      this.mostrarError(
        'Agrega al menos un producto al carrito.'
      );

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

      this.mostrarError(
        'No se pudo identificar al usuario actual. Inicia sesión nuevamente.'
      );

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


          // ----------------------------------
          // GUARDAR RESPUESTA DE LA VENTA
          // ----------------------------------

          this.ventaRealizada =
            response;


          // ----------------------------------
          // MENSAJE DE ÉXITO
          // ----------------------------------

          this.mensajeExito =
            'Venta realizada correctamente.';


          // ----------------------------------
          // MOSTRAR MODAL DEL TICKET
          // ----------------------------------

          this.mostrarTicket =
            true;

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


          this.mostrarError(
            error?.error?.message ||
            error?.error?.error ||
            'No se pudo realizar la venta.'
          );

        }

      });

  }


  // ==========================================
  // IMPRIMIR TICKET
  // ==========================================

  imprimirTicket(): void {

    const ticket =
      document.querySelector(
        '.ticket-vista'
      ) as HTMLElement | null;


    // ----------------------------------------
    // VALIDAR TICKET
    // ----------------------------------------

    if (!ticket) {

      console.error(
        'No se encontró el ticket para imprimir.'
      );

      return;

    }


    // ----------------------------------------
    // ABRIR VENTANA DE IMPRESIÓN
    // ----------------------------------------

    const ventana =
      window.open(
        '',
        '_blank',
        'width=400,height=700'
      );


    // ----------------------------------------
    // POPUP BLOQUEADO
    // ----------------------------------------

    if (!ventana) {

      alert(
        'El navegador bloqueó la ventana de impresión. Permite las ventanas emergentes para este sitio.'
      );

      return;

    }


    // ----------------------------------------
    // CREAR DOCUMENTO DE IMPRESIÓN
    // ----------------------------------------

    ventana.document.open();


    ventana.document.write(`

      <!DOCTYPE html>

      <html lang="es">

        <head>

          <meta charset="UTF-8">

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          >

          <title>
            Ticket de venta
          </title>


          <style>

            @page {

              size: 80mm auto;

              margin: 0;

            }


            * {

              box-sizing: border-box;

            }


            html {

              width: 80mm;

              margin: 0;

              padding: 0;

            }


            body {

              width: 80mm;

              margin: 0;

              padding: 0;

              background: #ffffff;

              color: #000000;

              font-family:
                Arial,
                Helvetica,
                sans-serif;

              font-size: 11px;

              line-height: 1.35;

            }


            .ticket-print {

              width: 80mm;

              max-width: 80mm;

              margin: 0;

              padding: 5mm;

              background: #ffffff;

              color: #000000;

            }


            /* ================================
               ENCABEZADO
               ================================ */

            .ticket-center {

              text-align: center;

            }


            .ticket-center h1 {

              margin: 0;

              font-size: 18px;

              font-weight: 800;

              letter-spacing: 1px;

            }


            .ticket-center p {

              margin: 2px 0;

              font-size: 10px;

            }


            /* ================================
               LÍNEAS
               ================================ */

            .ticket-linea {

              width: 100%;

              margin: 8px 0;

              border-top:
                1px dashed #000000;

            }


            /* ================================
               INFORMACIÓN
               ================================ */

            .ticket-info > div {

              display: flex;

              justify-content:
                space-between;

              align-items:
                flex-start;

              gap: 8px;

              margin: 3px 0;

            }


            .ticket-info span {

              word-break:
                break-word;

            }


            .ticket-info strong {

              text-align: right;

              word-break:
                break-word;

            }


            /* ================================
               PRODUCTOS
               ================================ */

            .ticket-producto {

              margin-bottom: 7px;

            }


            .ticket-producto-nombre {

              font-weight: 700;

              word-break:
                break-word;

            }


            .ticket-producto-detalle {

              display: flex;

              justify-content:
                space-between;

              align-items:
                flex-start;

              gap: 8px;

              margin-top: 2px;

              font-size: 10px;

            }


            .ticket-producto-detalle span {

              word-break:
                break-word;

            }


            .ticket-producto-detalle strong {

              text-align: right;

              white-space: nowrap;

            }


            /* ================================
               TOTALES
               ================================ */

            .ticket-totales > div {

              display: flex;

              align-items:
                center;

              justify-content:
                space-between;

              gap: 10px;

              margin: 4px 0;

            }


            .ticket-total {

              margin-top: 7px !important;

              font-size: 14px;

              font-weight: 800;

            }


            .ticket-total strong {

              font-size: 15px;

            }


            /* ================================
               MÉTODO DE PAGO
               ================================ */

            .ticket-pago {

              display: flex;

              justify-content:
                space-between;

              align-items:
                center;

              gap: 10px;

            }


            .ticket-pago strong {

              text-transform:
                uppercase;

            }


            /* ================================
               FOOTER
               ================================ */

            .ticket-footer {

              margin-top: 15px;

              text-align: center;

            }


            .ticket-footer p {

              margin: 0 0 4px;

              font-weight: 700;

            }


            .ticket-footer span {

              font-size: 9px;

            }

            .ticket-logo-img {
  display: block;
  width: 42mm;
  max-width: 100%;
  height: auto;
  margin: 0 auto 3mm;
  object-fit: contain;
}


          </style>

        </head>


        <body>

          ${ticket.outerHTML}

        </body>

      </html>

    `);


    ventana.document.close();


    // ----------------------------------------
    // ESPERAR A QUE CARGUE
    // ----------------------------------------

    ventana.focus();


const imagenes = Array.from(ventana.document.images);

Promise.all(
  imagenes.map(img => {
    if (img.complete) {
      return Promise.resolve();
    }

    return new Promise<void>(resolve => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    });
  })
).then(() => {
  ventana.focus();
  ventana.print();
  ventana.close();
});

  }


  // ==========================================
  // CERRAR TICKET
  // ==========================================

  cerrarTicket(): void {

    // Limpiar los datos de la venta finalizada
    this.limpiarVenta();

    // Restablecer el método de pago
    this.metodoPago = 'EFECTIVO';

    // Regresar al listado de ventas
    this.router.navigate(['/ventas']);

  }
  // ==========================================
  // ==========================================
  // GENERAR PDF DEL TICKET
  // ==========================================

  generarPdfTicket(): void {

    if (!this.ventaRealizada) {

      console.error(
        'No existe una venta para generar el PDF.'
      );

      return;

    }

    const venta = this.ventaRealizada;
    const productos = this.carrito;

    // ----------------------------------------
    // CONFIGURACIÓN DEL TICKET
    // ----------------------------------------

    const anchoTicket = 80;
    const margen = 5;
    const anchoUtil = anchoTicket - (margen * 2);

    /*
     * La altura se calcula de acuerdo con los
     * productos y la longitud de sus nombres.
     * De esta forma el PDF no queda como una
     * hoja enorme con espacio blanco.
     */

    let alturaTicket = 92;

    productos.forEach(item => {

      const nombre =
        String(item.producto.nombre || '');

      const lineasNombre =
        Math.max(
          1,
          Math.ceil(nombre.length / 32)
        );

      alturaTicket +=
        (lineasNombre * 4) + 9;

    });

    alturaTicket += 8;

    // ----------------------------------------
    // CREAR PDF 80 MM
    // ----------------------------------------

    const pdf = new jsPDF({

      orientation: 'portrait',

      unit: 'mm',

      format: [
        anchoTicket,
        alturaTicket
      ],

      compress: true

    });

    let y = 8;

    pdf.setTextColor(0, 0, 0);

    // ----------------------------------------
    // ENCABEZADO
    // ----------------------------------------

    pdf.setFont(
      'helvetica',
      'bold'
    );

    pdf.setFontSize(15);

    pdf.text(
      'FERRE CENTRO',
      40,
      y,
      {
        align: 'center'
      }
    );

    y += 5;

    pdf.setFont(
      'helvetica',
      'normal'
    );

    pdf.setFontSize(8);

    pdf.text(
      'FERRETERÍA JG',
      40,
      y,
      {
        align: 'center'
      }
    );

    y += 4;

    pdf.text(
      'Ticket de venta',
      40,
      y,
      {
        align: 'center'
      }
    );

    y += 5;

    // ----------------------------------------
    // LÍNEA
    // ----------------------------------------

    pdf.setLineWidth(0.2);

    pdf.line(
      margen,
      y,
      anchoTicket - margen,
      y
    );

    y += 5;

    // ----------------------------------------
    // INFORMACIÓN DE LA VENTA
    // ----------------------------------------

    pdf.setFontSize(8);

    pdf.setFont(
      'helvetica',
      'bold'
    );

    pdf.text(
      'Folio:',
      margen,
      y
    );

    pdf.setFont(
      'helvetica',
      'normal'
    );

    pdf.text(
      venta.folio || 'Sin folio',
      anchoTicket - margen,
      y,
      {
        align: 'right'
      }
    );

    y += 4;

    pdf.setFont(
      'helvetica',
      'bold'
    );

    pdf.text(
      'Fecha:',
      margen,
      y
    );

    pdf.setFont(
      'helvetica',
      'normal'
    );

    pdf.text(
      this.formatearFecha(
        venta.fechaCreacion
      ),
      anchoTicket - margen,
      y,
      {
        align: 'right'
      }
    );

    y += 4;

    pdf.setFont(
      'helvetica',
      'bold'
    );

    pdf.text(
      'Vendedor:',
      margen,
      y
    );

    pdf.setFont(
      'helvetica',
      'normal'
    );

    const vendedor =
      venta.usuarioNombre ||
      venta.username ||
      'N/A';

    const vendedorLineas =
      pdf.splitTextToSize(
        vendedor,
        48
      );

    pdf.text(
      vendedorLineas,
      anchoTicket - margen,
      y,
      {
        align: 'right'
      }
    );

    y += Math.max(
      4,
      vendedorLineas.length * 3.5
    );

    y += 2;

    // ----------------------------------------
    // LÍNEA
    // ----------------------------------------

    pdf.line(
      margen,
      y,
      anchoTicket - margen,
      y
    );

    y += 5;

    // ----------------------------------------
    // PRODUCTOS
    // ----------------------------------------

    pdf.setFontSize(8);

    productos.forEach(item => {

      const nombre =
        String(
          item.producto.nombre || ''
        );

      pdf.setFont(
        'helvetica',
        'bold'
      );

      const nombreLineas =
        pdf.splitTextToSize(
          nombre,
          anchoUtil
        );

      pdf.text(
        nombreLineas,
        margen,
        y
      );

      y +=
        nombreLineas.length * 3.5;

      y += 1;

      pdf.setFont(
        'helvetica',
        'normal'
      );

      const precioUnitario =
        this.formatearDinero(
          Number(
            item.producto.precioVenta
          )
        );

      const subtotalItem =
        this.formatearDinero(
          Number(item.subtotal)
        );

      pdf.text(
        `${item.cantidad} x ${precioUnitario}`,
        margen,
        y
      );

      pdf.text(
        subtotalItem,
        anchoTicket - margen,
        y,
        {
          align: 'right'
        }
      );

      y += 5;

    });

    // ----------------------------------------
    // LÍNEA
    // ----------------------------------------

    pdf.line(
      margen,
      y,
      anchoTicket - margen,
      y
    );

    y += 5;

    // ----------------------------------------
    // SUBTOTAL
    // ----------------------------------------

    pdf.setFont(
      'helvetica',
      'normal'
    );

    pdf.setFontSize(8);

    pdf.text(
      'Subtotal',
      margen,
      y
    );

    pdf.text(
      this.formatearDinero(
        Number(
          venta.subtotal ??
          this.subtotal
        )
      ),
      anchoTicket - margen,
      y,
      {
        align: 'right'
      }
    );

    y += 4;

    // ----------------------------------------
    // IVA
    // ----------------------------------------

    pdf.text(
      'IVA 16%',
      margen,
      y
    );

    pdf.text(
      this.formatearDinero(
        Number(
          venta.impuesto ??
          this.impuesto
        )
      ),
      anchoTicket - margen,
      y,
      {
        align: 'right'
      }
    );

    y += 6;

    // ----------------------------------------
    // TOTAL
    // ----------------------------------------

    pdf.setFont(
      'helvetica',
      'bold'
    );

    pdf.setFontSize(12);

    pdf.text(
      'TOTAL',
      margen,
      y
    );

    pdf.text(
      this.formatearDinero(
        Number(
          venta.total ??
          this.total
        )
      ),
      anchoTicket - margen,
      y,
      {
        align: 'right'
      }
    );

    y += 6;

    // ----------------------------------------
    // LÍNEA
    // ----------------------------------------

    pdf.setLineWidth(0.2);

    pdf.line(
      margen,
      y,
      anchoTicket - margen,
      y
    );

    y += 5;

    // ----------------------------------------
    // MÉTODO DE PAGO
    // ----------------------------------------

    pdf.setFont(
      'helvetica',
      'normal'
    );

    pdf.setFontSize(8);

    pdf.text(
      'Método de pago',
      margen,
      y
    );

    pdf.setFont(
      'helvetica',
      'bold'
    );

    const metodoPago =
      (
        venta.metodoPago ||
        this.metodoPago ||
        'EFECTIVO'
      ).toUpperCase();

    pdf.text(
      metodoPago,
      anchoTicket - margen,
      y,
      {
        align: 'right'
      }
    );

    y += 8;

    // ----------------------------------------
    // PIE DEL TICKET
    // ----------------------------------------

    pdf.setFont(
      'helvetica',
      'bold'
    );

    pdf.setFontSize(9);

    pdf.text(
      '¡Gracias por su compra!',
      40,
      y,
      {
        align: 'center'
      }
    );

    y += 4;

    pdf.setFont(
      'helvetica',
      'normal'
    );

    pdf.setFontSize(7);

    pdf.text(
      'Ferre Centro',
      40,
      y,
      {
        align: 'center'
      }
    );

    // ----------------------------------------
    // GUARDAR
    // ----------------------------------------

    const folio =
      venta.folio ||
      'ticket';

    pdf.save(
      `Ticket-${folio}.pdf`
    );

  }

  // NUEVA VENTA
  // ==========================================

  nuevaVenta(): void {

    this.carrito = [];

    this.error = '';

    this.mensajeExito = '';

    this.ventaRealizada = null;

    this.mostrarTicket = false;

    this.metodoPago = 'EFECTIVO';

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
