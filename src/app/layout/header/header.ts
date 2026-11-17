
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { Producto, ProductoService } from '../../core/services/producto.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit, OnDestroy {

  username: string | null = null;
  rol: string | null = null;

  notificacionesAbiertas = false;
  cargandoNotificaciones = false;
  errorNotificaciones = false;

  productosStockBajo: Producto[] = [];

  private suscripcion?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private productoService: ProductoService
  ) {
    this.username = this.authService.getUsername();
    this.rol = this.authService.getRole();
  }

  ngOnInit(): void {
    this.cargarNotificaciones();

    // Actualizar las alertas cada 60 segundos.
    this.suscripcion = interval(60000).subscribe(() => {
      this.cargarNotificaciones();
    });
  }

  ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }



  cargarNotificaciones(): void {
    this.cargandoNotificaciones = true;
    this.errorNotificaciones = false;

    this.productoService.obtenerStockBajo().subscribe({
      next: (productos: Producto[]) => {
        console.log('PRODUCTOS CON STOCK BAJO:', productos);

        this.productosStockBajo = productos.filter(
          (producto: Producto) => producto.activo !== false
        );

        console.log(
          'NOTIFICACIONES MOSTRADAS:',
          this.productosStockBajo.length
        );

        this.cargandoNotificaciones = false;
      },
      error: (error: unknown) => {
        console.error('Error al cargar notificaciones:', error);
        this.cargandoNotificaciones = false;
        this.errorNotificaciones = true;
      }
    });
  }



  toggleNotificaciones(): void {
    console.log('🔔 Clic en la campana');

    this.notificacionesAbiertas = !this.notificacionesAbiertas;

    console.log('¿Panel abierto?', this.notificacionesAbiertas);

    if (this.notificacionesAbiertas) {
      this.cargarNotificaciones();
    }
  }

  verProducto(producto: Producto): void {
    this.notificacionesAbiertas = false;

    this.router.navigate(['/compras/nueva'], {
      queryParams: {
        productoId: producto.id
      }
    });
  }

  irAInventario(): void {
    this.notificacionesAbiertas = false;

    // Por ahora, Inventario corresponde a /productos.
    this.router.navigate(['/productos'], {
      queryParams: { stockBajo: true }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
