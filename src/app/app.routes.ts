import { Routes } from '@angular/router';

import { LayoutComponent } from './layout/layout/layout';

import { Login } from './pages/login/login';

import { Dashboard } from './pages/dashboard/dashboard';
import { Productos } from './pages/productos/productos';
import { Categorias } from './pages/categorias/categorias';
import { Ventas } from './pages/ventas/ventas';
import { NuevaVenta } from './pages/ventas/nueva-venta';

import { Compras } from './pages/compras/compras';
import { Usuarios } from './pages/usuarios/usuarios';
import { Roles } from './pages/roles/roles';

import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { NuevaCompra } from './pages/compras/nueva-compra';
import { Reportes } from './pages/reportes/reportes';
export const routes: Routes = [

  // ==========================================
  // LOGIN
  // ==========================================

  {
    path: 'login',
    component: Login
  },

  // ==========================================
  // SISTEMA PROTEGIDO
  // ==========================================

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],

    children: [

      // ----------------------------------------
      // RUTA PRINCIPAL
      // ----------------------------------------

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      // ----------------------------------------
      // DASHBOARD
      // ----------------------------------------

      {
        path: 'dashboard',
        component: Dashboard
      },

      // ----------------------------------------
      // PRODUCTOS
      // ----------------------------------------

      {
        path: 'productos',
        component: Productos
      },

      // ----------------------------------------
      // CATEGORÍAS
      // ----------------------------------------

      {
        path: 'categorias',
        component: Categorias
      },

      // ----------------------------------------
      // VENTAS
      // ----------------------------------------

      {
        path: 'ventas',
        component: Ventas
      },

      // ----------------------------------------
      // NUEVA VENTA
      // ----------------------------------------

      {
        path: 'ventas/nueva',
        component: NuevaVenta
      },

      // ----------------------------------------
      // COMPRAS
      // ----------------------------------------

      {
        path: 'compras',
        component: Compras
      },

      // ----------------------------------------
      // NUEVA COMPRA
      // ----------------------------------------

      {
        path: 'compras/nueva',
        component: NuevaCompra
      },

      // USUARIOS - SOLO ADMIN
      // ----------------------------------------

      {
        path: 'usuarios',
        component: Usuarios,
        canActivate: [roleGuard],
        data: {
          roles: ['ADMIN']
        }
      },

       // ----------------------------------------
      // REPORTES DE VENTAS
      // ----------------------------------------

      {
        path: 'reportes',
        component: Reportes,
      },

      // ----------------------------------------
      // ROLES - SOLO ADMIN
      // ----------------------------------------

      {
        path: 'roles',
        component: Roles,
        canActivate: [roleGuard],
        data: {
          roles: ['ADMIN']
        }
      }
      

    ]
  },

  // ==========================================
  // RUTA NO ENCONTRADA
  // ==========================================

  {
    path: '**',
    redirectTo: 'dashboard'
  }

];