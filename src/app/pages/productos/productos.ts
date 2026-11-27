
import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Producto,
  ProductoRequest,
  ProductoService
} from '../../core/services/producto.service';

import {
  Categoria,
  CategoriaService
} from '../../core/services/categoria.service';

@Component({
  selector: 'app-productos',
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class Productos implements OnInit {

  // PRODUCTOS
  productos: Producto[] = [];
  productosOriginales: Producto[] = [];

  // CATEGORÍAS
  categorias: Categoria[] = [];

  // BÚSQUEDA
  terminoBusqueda = '';

  // FORMULARIO
  productoForm: FormGroup;

  // ESTADOS
  cargando = true;
  error = false;
  guardando = false;
  mostrarModal = false;
  mensajeError = '';

  // EDICIÓN
  modoEdicion = false;
  productoEditandoId: number | null = null;

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private fb: FormBuilder
  ) {

    this.productoForm = this.fb.group({

      codigo: [
        '',
        [
          Validators.required,
          Validators.maxLength(50)
        ]
      ],

      codigoBarras: [
        '',
        [
          Validators.maxLength(100)
        ]
      ],

      nombre: [
        '',
        [
          Validators.required,
          Validators.maxLength(150)
        ]
      ],

      descripcion: [''],

      marca: [''],

      precioCompra: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      precioVenta: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      stock: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      stockMinimo: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      unidadMedida: [
        'PIEZA',
        [
          Validators.required
        ]
      ],

      categoriaId: [
        null,
        [
          Validators.required
        ]
      ]

    });

  }

  // INICIALIZACIÓN
  ngOnInit(): void {

    this.obtenerProductos();
    this.obtenerCategorias();

  }

  // OBTENER PRODUCTOS
  obtenerProductos(): void {

    this.cargando = true;
    this.error = false;

    this.productoService
      .obtenerTodos()
      .subscribe({

        next: (data) => {

          this.productosOriginales = [...data];

          this.buscarProductos();

          this.cargando = false;

        },

        error: (err) => {

          console.error(
            'Error al obtener productos:',
            err
          );

          this.cargando = false;
          this.error = true;

        }

      });

  }

  // NORMALIZAR TEXTO
  private normalizarTexto(texto: string): string {

    return (texto ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  }

  // BUSCAR PRODUCTOS EN TIEMPO REAL
  buscarProductos(): void {

    const termino = this.normalizarTexto(
      this.terminoBusqueda
    );

    if (!termino) {

      this.productos = [...this.productosOriginales];

      return;

    }

    this.productos = this.productosOriginales.filter(
      producto => {

        const nombre = this.normalizarTexto(
          producto.nombre ?? ''
        );

        const codigo = this.normalizarTexto(
          producto.codigo ?? ''
        );

        const codigoBarras = this.normalizarTexto(
          producto.codigoBarras ?? ''
        );

        const marca = this.normalizarTexto(
          producto.marca ?? ''
        );

        const categoria = this.normalizarTexto(
          producto.categoriaNombre ?? ''
        );

        return nombre.includes(termino) ||
               codigo.includes(termino) ||
               codigoBarras.includes(termino) ||
               marca.includes(termino) ||
               categoria.includes(termino);

      }
    );

  }

  // LIMPIAR BÚSQUEDA
  limpiarBusqueda(): void {

    this.terminoBusqueda = '';

    this.buscarProductos();

  }

  // OBTENER CATEGORÍAS
  obtenerCategorias(): void {

    this.categoriaService
      .obtenerTodas()
      .subscribe({

        next: (data) => {

          this.categorias = data;

        },

        error: (err) => {

          console.error(
            'Error al obtener categorías:',
            err
          );

        }

      });

  }

  // ABRIR MODAL NUEVO
  abrirModal(): void {

    this.modoEdicion = false;
    this.productoEditandoId = null;

    this.productoForm.reset({

      codigo: '',
      codigoBarras: '',
      nombre: '',
      descripcion: '',
      marca: '',
      precioCompra: 0,
      precioVenta: 0,
      stock: 0,
      stockMinimo: 0,
      unidadMedida: 'PIEZA',
      categoriaId: null

    });

    this.mensajeError = '';
    this.mostrarModal = true;

  }

  // EDITAR PRODUCTO
  editarProducto(producto: Producto): void {

    this.modoEdicion = true;
    this.productoEditandoId = producto.id;
    this.mensajeError = '';

    this.productoForm.patchValue({

      codigo: producto.codigo,
      codigoBarras: producto.codigoBarras ?? '',
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      marca: producto.marca,
      precioCompra: producto.precioCompra,
      precioVenta: producto.precioVenta,
      stock: producto.stock,
      stockMinimo: producto.stockMinimo,
      unidadMedida: producto.unidadMedida,
      categoriaId: producto.categoriaId

    });

    this.mostrarModal = true;

  }

  // CERRAR MODAL
  cerrarModal(): void {

    if (this.guardando) {
      return;
    }

    this.mostrarModal = false;
    this.modoEdicion = false;
    this.productoEditandoId = null;
    this.mensajeError = '';

  }

  // GUARDAR PRODUCTO
  guardarProducto(): void {

    if (this.productoForm.invalid) {

      this.productoForm.markAllAsTouched();
      return;

    }

    this.guardando = true;
    this.mensajeError = '';

    const producto: ProductoRequest =
      this.productoForm.getRawValue();

    // ACTUALIZAR PRODUCTO
    if (
      this.modoEdicion &&
      this.productoEditandoId !== null
    ) {

      this.productoService
        .actualizar(
          this.productoEditandoId,
          producto
        )
        .subscribe({

          next: (data) => {

            console.log('Producto actualizado:', data);

            this.guardando = false;
            this.mostrarModal = false;
            this.modoEdicion = false;
            this.productoEditandoId = null;

            this.obtenerProductos();

          },

          error: (err) => {

            console.error(
              'Error al actualizar producto:',
              err
            );

            this.guardando = false;

            this.mensajeError =
              err?.error?.message ??
              'No se pudo actualizar el producto.';

          }

        });

      return;

    }

    // CREAR PRODUCTO
    this.productoService
      .crear(producto)
      .subscribe({

        next: (data) => {

          console.log('Producto creado:', data);

          this.guardando = false;
          this.mostrarModal = false;

          this.obtenerProductos();

        },

        error: (err) => {

          console.error(
            'Error al crear producto:',
            err
          );

          this.guardando = false;

          this.mensajeError =
            err?.error?.message ??
            'No se pudo crear el producto.';

        }

      });

  }

  // VALIDAR CAMPO
  campoInvalido(campo: string): boolean {

    const control = this.productoForm.get(campo);

    return !!(
      control &&
      control.invalid &&
      control.touched
    );

  }

  // ELIMINAR PRODUCTO
  eliminarProducto(producto: Producto): void {

    const confirmar = window.confirm(

      `¿Estás seguro de eliminar el producto "${producto.nombre}"?\n\n` +
      `Código: ${producto.codigo}\n` +
      `Código de barras: ${producto.codigoBarras || 'Sin asignar'}\n` +
      `Stock: ${producto.stock}`

    );

    if (!confirmar) {
      return;
    }

    this.productoService
      .eliminar(producto.id)
      .subscribe({

        next: () => {

          console.log(
            'Producto eliminado:',
            producto.id
          );

          this.productosOriginales =
            this.productosOriginales.filter(
              p => p.id !== producto.id
            );

          this.buscarProductos();

        },

        error: (err) => {

          console.error(
            'Error al eliminar producto:',
            err
          );

          alert(
            err?.error?.message ??
            'No se pudo eliminar el producto.'
          );

        }

      });

  }

}
