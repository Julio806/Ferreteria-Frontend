
import { inject } from '@angular/core';

import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router
} from '@angular/router';

import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  // ==========================================
  // VALIDAR AUTENTICACIÓN Y EXPIRACIÓN
  // ==========================================

  if (!authService.isAuthenticated()) {

    authService.logout();

    return router.createUrlTree(['/login']);

  }

  // ==========================================
  // OBTENER ROL DEL USUARIO
  // ==========================================

  const userRole = authService.getRole();

  const allowedRoles = route.data['roles'] as string[];


  // ==========================================
  // VALIDAR EXISTENCIA DEL ROL
  // ==========================================

  if (!userRole) {

    authService.logout();

    return router.createUrlTree(['/login']);

  }


  // ==========================================
  // VALIDAR PERMISOS
  // ==========================================

  if (allowedRoles?.includes(userRole)) {

    return true;

  }


  // ==========================================
  // ACCESO NO AUTORIZADO
  // ==========================================

  return router.createUrlTree(['/dashboard']);

};
