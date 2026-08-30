import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  username = '';
  password = '';

  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {

    if (!this.username.trim() || !this.password.trim()) {

      this.errorMessage =
        'Ingresa tu usuario y contraseña.';

      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService
      .login(
        this.username.trim(),
        this.password
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Login exitoso:',
            response
          );

          this.loading = false;

          this.router.navigate([
            '/dashboard'
          ]);

        },

        error: (error) => {

          console.error(
            'Error de login:',
            error
          );

          this.loading = false;

          if (error.status === 401) {

            this.errorMessage =
              'Usuario o contraseña incorrectos.';

          } else if (error.status === 0) {

            this.errorMessage =
              'No se pudo conectar con el servidor.';

          } else {

            this.errorMessage =
              'Ocurrió un error al iniciar sesión.';

          }

        }

      });

  }

}