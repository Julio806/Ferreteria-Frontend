import { Component } from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class LayoutComponent {

  // ==========================================
  // INFORMACIÓN DEL USUARIO
  // ==========================================

  username: string | null = null;

  rol: string | null = null;


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private router: Router,
    private authService: AuthService
  ) {

    this.username =
      this.authService.getUsername();

    this.rol =
      this.authService.getRole();

  }


  // ==========================================
  // INICIALIZAR
  // ==========================================

  get inicialUsuario(): string {

    if (!this.username) {
      return 'U';
    }

    return this.username
      .charAt(0)
      .toUpperCase();

  }


  // ==========================================
  // CERRAR SESIÓN
  // ==========================================

  logout(): void {

    this.authService.logout();

    this.router.navigate(['/login']);

  }

}