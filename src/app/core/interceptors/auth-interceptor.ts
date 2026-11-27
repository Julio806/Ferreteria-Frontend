
import {
  HttpInterceptorFn
} from '@angular/common/http';

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

  const token = authService.getToken();

  // No enviar tokens vencidos
  if (token && authService.isTokenExpired(token)) {

    authService.logout();

    router.navigate(['/login']);

    return throwError(() =>
      new Error('La sesión ha expirado')
    );
  }

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(authReq).pipe(

    catchError(error => {

      if (error.status === 401) {

        authService.logout();

        router.navigate(['/login']);

      }

      return throwError(() => error);

    })

  );
};
