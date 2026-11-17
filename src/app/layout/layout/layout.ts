
import { Component } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { Header } from '../header/header';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    Header
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class LayoutComponent {

  username: string | null = null;
  rol: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.username = this.authService.getUsername();
    this.rol = this.authService.getRole();

    console.log('USUARIO:', this.username);
    console.log('ROL RECUPERADO:', this.rol);
    console.log('¿ES ADMIN?:', this.isAdmin());
  }

  get inicialUsuario(): string {
    return this.username
      ? this.username.charAt(0).toUpperCase()
      : 'U';
  }

  isAdmin(): boolean {
    const rolNormalizado = this.rol
      ?.trim()
      .toUpperCase()
      .replace(/^ROLE_/, '');

    return rolNormalizado === 'ADMIN';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
