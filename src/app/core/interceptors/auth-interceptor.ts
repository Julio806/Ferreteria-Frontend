
import { HttpInterceptorFn } from '@angular/common/http';

import {
  catchError,
  throwError
} from 'rxjs';

import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  // No interceptar el inicio de sesión
  const isLoginRequest = req.url.includes('/auth/login');

  if (isLoginRequest) {
    return next(req);
  }

  const token = authService.getToken();

  // Comprobar expiración
  if (token && authService.isTokenExpired(token)) {

    authService.logout();

    router.navigate(['/login']);

    return throwError(() =>
      new Error('La sesión ha expirado')
    );
  }

  // Agregar token a las peticiones
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(authReq).pipe(

    catchError(error => {

      if (error.status === 401 && token) {

        authService.logout();

        router.navigate(['/login']);

      }

      return throwError(() => error);

    })

  );
};
