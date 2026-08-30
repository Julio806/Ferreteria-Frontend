import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {

  username: string | null = null;
  rol: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.username = this.authService.getUsername();
    this.rol = this.authService.getRole();
  }

  logout(): void {

    this.authService.logout();

    this.router.navigate(['/login']);

  }

}