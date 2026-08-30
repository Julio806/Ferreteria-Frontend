import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Rol,
  RolService
} from '../../core/services/rol.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './roles.html',
  styleUrl: './roles.css'
})
export class Roles implements OnInit {

  roles: Rol[] = [];

  cargando = false;
  error = false;

  mostrarModal = false;

  editando = false;

  rolSeleccionadoId: number | null = null;

  nombreRol = '';

  errorFormulario = '';

  guardando = false;

  constructor(
    private rolService: RolService
  ) {}

  // ==========================================
  // INICIALIZAR
  // ==========================================

  ngOnInit(): void {
    this.obtenerRoles();
  }

  // ==========================================
  // OBTENER ROLES
  // ==========================================

  obtenerRoles(): void {

    this.cargando = true;
    this.error = false;

    this.rolService.obtenerTodos().subscribe({

      next: (roles) => {

        this.roles = roles;

        this.cargando = false;
      },

      error: (error) => {

        console.error('Error al obtener roles:', error);

        this.cargando = false;
        this.error = true;
      }

    });

  }

  // ==========================================
  // ABRIR NUEVO
  // ==========================================

  nuevoRol(): void {

    this.editando = false;

    this.rolSeleccionadoId = null;

    this.nombreRol = '';

    this.errorFormulario = '';

    this.mostrarModal = true;
  }

  // ==========================================
  // ABRIR EDITAR
  // ==========================================

  editarRol(rol: Rol): void {

    this.editando = true;

    this.rolSeleccionadoId = rol.id;

    this.nombreRol = rol.nombre;

    this.errorFormulario = '';

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

    this.errorFormulario = '';
  }

  // ==========================================
  // GUARDAR
  // ==========================================

  guardarRol(): void {

    this.errorFormulario = '';

    const nombre = this.nombreRol.trim();

    if (!nombre) {

      this.errorFormulario =
        'El nombre del rol es obligatorio.';

      return;
    }

    if (nombre.length < 2) {

      this.errorFormulario =
        'El nombre del rol debe tener al menos 2 caracteres.';

      return;
    }

    this.guardando = true;

    const request = {
      nombre: nombre
    };

    // ========================================
    // CREAR
    // ========================================

    if (!this.editando) {

      this.rolService.crear(request).subscribe({

        next: (rol) => {

          this.roles.push(rol);

          this.guardando = false;

          this.mostrarModal = false;
        },

        error: (error) => {

          console.error('Error al crear rol:', error);

          this.guardando = false;

          this.errorFormulario =
            error?.error?.message ||
            'No se pudo crear el rol.';
        }

      });

      return;
    }

    // ========================================
    // ACTUALIZAR
    // ========================================

    if (this.rolSeleccionadoId !== null) {

      this.rolService
        .actualizar(
          this.rolSeleccionadoId,
          request
        )
        .subscribe({

          next: (rolActualizado) => {

            const indice =
              this.roles.findIndex(
                r => r.id === rolActualizado.id
              );

            if (indice !== -1) {

              this.roles[indice] =
                rolActualizado;
            }

            this.guardando = false;

            this.mostrarModal = false;
          },

          error: (error) => {

            console.error(
              'Error al actualizar rol:',
              error
            );

            this.guardando = false;

            this.errorFormulario =
              error?.error?.message ||
              'No se pudo actualizar el rol.';
          }

        });

    }

  }

  // ==========================================
  // ELIMINAR
  // ==========================================

  eliminarRol(rol: Rol): void {

    const confirmar = confirm(
      `¿Deseas eliminar el rol "${rol.nombre}"?`
    );

    if (!confirmar) {
      return;
    }

    this.rolService
      .eliminar(rol.id)
      .subscribe({

        next: () => {

          this.roles =
            this.roles.filter(
              r => r.id !== rol.id
            );
        },

        error: (error) => {

          console.error(
            'Error al eliminar rol:',
            error
          );

          alert(
            error?.error?.message ||
            'No se pudo eliminar el rol.'
          );
        }

      });

  }

}