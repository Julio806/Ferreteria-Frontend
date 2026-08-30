import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Categoria,
  CategoriaRequest,
  CategoriaService
} from '../../core/services/categoria.service';

@Component({
  selector: 'app-categorias',
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css'
})
export class Categorias implements OnInit {

  // ==========================================
  // CATEGORÍAS
  // ==========================================

  categorias: Categoria[] = [];


  // ==========================================
  // BÚSQUEDA
  // ==========================================

  terminoBusqueda = '';


  // ==========================================
  // FORMULARIO
  // ==========================================

  categoriaForm: FormGroup;


  // ==========================================
  // ESTADOS
  // ==========================================

  cargando = true;

  error = false;

  guardando = false;

  mostrarModal = false;

  mensajeError = '';


  // ==========================================
  // EDICIÓN
  // ==========================================

  modoEdicion = false;

  categoriaEditandoId: number | null = null;


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private categoriaService: CategoriaService,
    private fb: FormBuilder
  ) {

    this.categoriaForm = this.fb.group({

      nombre: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],

      descripcion: [
        '',
        [
          Validators.maxLength(255)
        ]
      ]

    });

  }


  // ==========================================
  // INICIALIZACIÓN
  // ==========================================

  ngOnInit(): void {

    this.obtenerCategorias();

  }


  // ==========================================
  // OBTENER CATEGORÍAS
  // ==========================================

  obtenerCategorias(): void {

    this.cargando = true;

    this.error = false;

    this.categoriaService
      .obtenerTodas()
      .subscribe({

        next: (data) => {

          this.categorias = data;

          this.cargando = false;

        },

        error: (err) => {

          console.error(
            'Error al obtener categorías:',
            err
          );

          this.cargando = false;

          this.error = true;

        }

      });

  }


  // ==========================================
  // BUSCAR CATEGORÍAS
  // ==========================================

  buscarCategorias(): void {

    const termino =
      this.terminoBusqueda
        .trim()
        .toLowerCase();

    if (!termino) {

      this.obtenerCategorias();

      return;

    }

    /*
     * El backend actualmente no tiene
     * un endpoint específico para buscar
     * categorías.
     *
     * Por eso filtramos las categorías
     * que ya tenemos cargadas.
     */

    this.categorias =
      this.categorias.filter(categoria =>

        categoria.nombre
          .toLowerCase()
          .includes(termino)

        ||

        (categoria.descripcion ?? '')
          .toLowerCase()
          .includes(termino)

      );

  }


  // ==========================================
  // LIMPIAR BÚSQUEDA
  // ==========================================

  limpiarBusqueda(): void {

    this.terminoBusqueda = '';

    this.obtenerCategorias();

  }


  // ==========================================
  // ABRIR MODAL NUEVO
  // ==========================================

  abrirModal(): void {

    this.modoEdicion = false;

    this.categoriaEditandoId = null;

    this.mensajeError = '';

    this.categoriaForm.reset({

      nombre: '',

      descripcion: ''

    });

    this.mostrarModal = true;

  }


  // ==========================================
  // EDITAR CATEGORÍA
  // ==========================================

  editarCategoria(
    categoria: Categoria
  ): void {

    this.modoEdicion = true;

    this.categoriaEditandoId =
      categoria.id;

    this.mensajeError = '';

    this.categoriaForm.patchValue({

      nombre: categoria.nombre,

      descripcion: categoria.descripcion

    });

    this.mostrarModal = true;

  }


  // ==========================================
  // CERRAR MODAL
  // ==========================================

  cerrarModal(): void {

    if (this.guardando) {

      return;

    }

    this.mostrarModal = false;

    this.modoEdicion = false;

    this.categoriaEditandoId = null;

    this.mensajeError = '';

  }


  // ==========================================
  // GUARDAR CATEGORÍA
  // ==========================================

  guardarCategoria(): void {

    if (this.categoriaForm.invalid) {

      this.categoriaForm.markAllAsTouched();

      return;

    }

    this.guardando = true;

    this.mensajeError = '';

    const categoria: CategoriaRequest =
      this.categoriaForm.value;


    // ==========================================
    // ACTUALIZAR
    // ==========================================

    if (
      this.modoEdicion &&
      this.categoriaEditandoId !== null
    ) {

      this.categoriaService
        .actualizar(
          this.categoriaEditandoId,
          categoria
        )
        .subscribe({

          next: (data) => {

            console.log(
              'Categoría actualizada:',
              data
            );

            this.guardando = false;

            this.mostrarModal = false;

            this.modoEdicion = false;

            this.categoriaEditandoId = null;

            this.obtenerCategorias();

          },

          error: (err) => {

            console.error(
              'Error al actualizar categoría:',
              err
            );

            this.guardando = false;

            this.mensajeError =
              err?.error?.message ??
              'No se pudo actualizar la categoría.';

          }

        });

      return;

    }


    // ==========================================
    // CREAR
    // ==========================================

    this.categoriaService
      .crear(categoria)
      .subscribe({

        next: (data) => {

          console.log(
            'Categoría creada:',
            data
          );

          this.guardando = false;

          this.mostrarModal = false;

          this.obtenerCategorias();

        },

        error: (err) => {

          console.error(
            'Error al crear categoría:',
            err
          );

          this.guardando = false;

          this.mensajeError =
            err?.error?.message ??
            'No se pudo crear la categoría.';

        }

      });

  }


  // ==========================================
  // ELIMINAR CATEGORÍA
  // ==========================================

  eliminarCategoria(
    categoria: Categoria
  ): void {

    const confirmar = window.confirm(

      `¿Estás seguro de eliminar la categoría "${categoria.nombre}"?\n\n` +

      'Esta acción no se puede deshacer.'

    );

    if (!confirmar) {

      return;

    }

    this.categoriaService
      .eliminar(categoria.id)
      .subscribe({

        next: () => {

          console.log(
            'Categoría eliminada:',
            categoria.id
          );

          this.categorias =
            this.categorias.filter(
              c => c.id !== categoria.id
            );

        },

        error: (err) => {

          console.error(
            'Error al eliminar categoría:',
            err
          );

          alert(
            err?.error?.message ??
            'No se pudo eliminar la categoría.'
          );

        }

      });

  }


  // ==========================================
  // VALIDAR CAMPO
  // ==========================================

  campoInvalido(
    campo: string
  ): boolean {

    const control =
      this.categoriaForm.get(campo);

    return !!(
      control &&
      control.invalid &&
      control.touched
    );

  }

}