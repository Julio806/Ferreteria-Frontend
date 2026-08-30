import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  UsuarioService,
  Usuario,
  Rol,
  UsuarioRequest
} from '../../core/services/usuario.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class Usuarios implements OnInit {

  private usuarioService = inject(UsuarioService);

  usuarios: Usuario[] = [];
  roles: Rol[] = [];

  usuariosFiltrados: Usuario[] = [];

  cargando = false;
  guardando = false;

  error = '';

  busqueda = '';

  mostrarModal = false;

  modoEdicion = false;

  usuarioEditandoId: number | null = null;


  // ==========================================
  // FORMULARIO
  // ==========================================

  formulario: UsuarioRequest = {
    nombre: '',
    username: '',
    email: '',
    password: '',
    rolId: 0,
    activo: true
  };


  ngOnInit(): void {

    this.obtenerUsuarios();

    this.obtenerRoles();

  }


  // ==========================================
  // OBTENER USUARIOS
  // ==========================================

  obtenerUsuarios(): void {

    this.cargando = true;

    this.error = '';

    this.usuarioService.obtenerTodos()
      .subscribe({

        next: (usuarios) => {

          this.usuarios = usuarios;

          this.filtrarUsuarios();

          this.cargando = false;

        },

        error: (error) => {

          console.error(
            'Error al obtener usuarios:',
            error
          );

          this.error =
            'No se pudieron cargar los usuarios.';

          this.cargando = false;

        }

      });

  }


  // ==========================================
  // OBTENER ROLES
  // ==========================================

  obtenerRoles(): void {

    this.usuarioService.obtenerRoles()
      .subscribe({

        next: (roles) => {

          this.roles = roles;

        },

        error: (error) => {

          console.error(
            'Error al obtener roles:',
            error
          );

        }

      });

  }


  // ==========================================
  // BUSCAR
  // ==========================================

  filtrarUsuarios(): void {

    const texto =
      this.busqueda
        .trim()
        .toLowerCase();

    if (!texto) {

      this.usuariosFiltrados =
        [...this.usuarios];

      return;

    }

    this.usuariosFiltrados =
      this.usuarios.filter(usuario =>

        usuario.nombre
          ?.toLowerCase()
          .includes(texto)

        ||

        usuario.username
          ?.toLowerCase()
          .includes(texto)

        ||

        usuario.email
          ?.toLowerCase()
          .includes(texto)

        ||

        usuario.rol?.nombre
          ?.toLowerCase()
          .includes(texto)

      );

  }


  // ==========================================
  // ABRIR NUEVO
  // ==========================================

  nuevoUsuario(): void {

    this.modoEdicion = false;

    this.usuarioEditandoId = null;

    this.formulario = {

      nombre: '',

      username: '',

      email: '',

      password: '',

      rolId:
        this.roles.length > 0
          ? this.roles[0].id
          : 0,

      activo: true

    };

    this.error = '';

    this.mostrarModal = true;

  }


  // ==========================================
  // EDITAR
  // ==========================================

  editarUsuario(usuario: Usuario): void {

    this.modoEdicion = true;

    this.usuarioEditandoId =
      usuario.id;

    this.formulario = {

      nombre: usuario.nombre,

      username: usuario.username,

      email: usuario.email,

      password: '',

      rolId: usuario.rol?.id ?? 0,

      activo: usuario.activo

    };

    this.error = '';

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

    this.error = '';

  }


  // ==========================================
  // GUARDAR
  // ==========================================

  guardarUsuario(): void {

    if (this.guardando) {
      return;
    }

    this.error = '';

    // ------------------------------
    // VALIDACIONES
    // ------------------------------

    if (
      !this.formulario.nombre.trim()
    ) {

      this.error =
        'El nombre es obligatorio.';

      return;

    }

    if (
      !this.formulario.username.trim()
    ) {

      this.error =
        'El usuario es obligatorio.';

      return;

    }

    if (
      !this.formulario.email.trim()
    ) {

      this.error =
        'El correo electrónico es obligatorio.';

      return;

    }

    if (
      !this.formulario.rolId ||
      this.formulario.rolId === 0
    ) {

      this.error =
        'Debes seleccionar un rol.';

      return;

    }


    // ==========================================
    // CREAR
    // ==========================================

    if (!this.modoEdicion) {

      if (
        !this.formulario.password ||
        !this.formulario.password.trim()
      ) {

        this.error =
          'La contraseña es obligatoria.';

        return;

      }

      this.guardando = true;

      this.usuarioService
        .crear(this.formulario)
        .subscribe({

          next: () => {

            this.guardando = false;

            this.mostrarModal = false;

            this.obtenerUsuarios();

          },

          error: (error) => {

            console.error(
              'Error al crear usuario:',
              error
            );

            this.error =
              this.obtenerMensajeError(error);

            this.guardando = false;

          }

        });

      return;

    }


    // ==========================================
    // ACTUALIZAR
    // ==========================================

    if (
      this.usuarioEditandoId === null
    ) {
      return;
    }

    this.guardando = true;

    const datos: UsuarioRequest = {

      nombre:
        this.formulario.nombre.trim(),

      username:
        this.formulario.username.trim(),

      email:
        this.formulario.email.trim(),

      rolId:
        this.formulario.rolId,

      activo:
        this.formulario.activo

    };


    // Solo mandar password
    // si realmente escribió una nueva

    if (
      this.formulario.password &&
      this.formulario.password.trim()
    ) {

      datos.password =
        this.formulario.password.trim();

    }


    this.usuarioService
      .actualizar(
        this.usuarioEditandoId,
        datos
      )
      .subscribe({

        next: () => {

          this.guardando = false;

          this.mostrarModal = false;

          this.obtenerUsuarios();

        },

        error: (error) => {

          console.error(
            'Error al actualizar usuario:',
            error
          );

          this.error =
            this.obtenerMensajeError(error);

          this.guardando = false;

        }

      });

  }


  // ==========================================
  // CAMBIAR ESTADO
  // ==========================================

  cambiarEstado(
    usuario: Usuario
  ): void {

    const nuevoEstado =
      !usuario.activo;

    this.usuarioService
      .cambiarEstado(
        usuario.id,
        nuevoEstado
      )
      .subscribe({

        next: () => {

          usuario.activo =
            nuevoEstado;

        },

        error: (error) => {

          console.error(
            'Error al cambiar estado:',
            error
          );

        }

      });

  }


  // ==========================================
  // ELIMINAR
  // ==========================================

  eliminarUsuario(
    usuario: Usuario
  ): void {

    const confirmar =
      confirm(
        `¿Deseas desactivar al usuario "${usuario.nombre}"?`
      );

    if (!confirmar) {
      return;
    }

    this.usuarioService
      .eliminar(usuario.id)
      .subscribe({

        next: () => {

          usuario.activo = false;

        },

        error: (error) => {

          console.error(
            'Error al eliminar usuario:',
            error
          );

          this.error =
            this.obtenerMensajeError(error);

        }

      });

  }


  // ==========================================
  // MENSAJE DE ERROR
  // ==========================================

  private obtenerMensajeError(
    error: any
  ): string {

    if (
      error?.error?.message
    ) {

      return error.error.message;

    }

    if (
      typeof error?.error === 'string'
    ) {

      return error.error;

    }

    return 'Ocurrió un error al procesar la solicitud.';

  }

}