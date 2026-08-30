import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';


// ==========================================
// ENUMS
// ==========================================

export type MetodoPago =
  | 'EFECTIVO'
  | 'TARJETA'
  | 'TRANSFERENCIA';

export type EstadoVenta =
  | 'COMPLETADA'
  | 'CANCELADA';


// ==========================================
// PRODUCTO DE LA VENTA
// ==========================================

export interface VentaItemRequest {

  productoId: number;

  cantidad: number;

}


// ==========================================
// REQUEST PARA CREAR VENTA
// ==========================================

export interface VentaRequest {

  usuarioId: number;

  metodoPago: MetodoPago;

  items: VentaItemRequest[];

}


// ==========================================
// ITEM DE RESPUESTA
// ==========================================

export interface VentaItemResponse {

  id: number;

  productoId: number;

  productoNombre: string;

  cantidad: number;

  precioUnitario: number;

  subtotal: number;

}


// ==========================================
// RESPUESTA DE VENTA
// ==========================================

export interface Venta {

  id: number;

  folio: string;

  usuarioId: number;

  usuarioNombre: string;

  username: string;

  subtotal: number;

  impuesto: number;

  total: number;

  metodoPago: MetodoPago;

  estado: EstadoVenta;

  fechaCreacion: string;

  items: VentaItemResponse[];

}


// ==========================================
// SERVICIO
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class VentaService {

  constructor(
    private apiService: ApiService
  ) {}


  // ==========================================
  // CREAR VENTA
  // ==========================================

  crear(
    venta: VentaRequest
  ): Observable<Venta> {

    return this.apiService.post<Venta>(
      '/ventas',
      venta
    );

  }


  // ==========================================
  // OBTENER TODAS
  // ==========================================

  obtenerTodas(): Observable<Venta[]> {

    return this.apiService.get<Venta[]>(
      '/ventas'
    );

  }


  // ==========================================
  // OBTENER POR ID
  // ==========================================

  obtenerPorId(
    id: number
  ): Observable<Venta> {

    return this.apiService.get<Venta>(
      `/ventas/${id}`
    );

  }


  // ==========================================
  // VENTAS DEL DÍA
  // ==========================================

  obtenerVentasDelDia(): Observable<Venta[]> {

    return this.apiService.get<Venta[]>(
      '/ventas/hoy'
    );

  }


  // ==========================================
  // VENTAS POR FECHA
  // ==========================================

  obtenerPorFecha(
    fecha: string
  ): Observable<Venta[]> {

    return this.apiService.get<Venta[]>(
      `/ventas/fecha/${fecha}`
    );

  }


  // ==========================================
  // VENTAS POR USUARIO
  // ==========================================

  obtenerPorUsuario(
    usuarioId: number
  ): Observable<Venta[]> {

    return this.apiService.get<Venta[]>(
      `/ventas/usuario/${usuarioId}`
    );

  }


  // ==========================================
  // CANCELAR VENTA
  // ==========================================

  cancelar(
    id: number
  ): Observable<void> {

    return this.apiService.put<void>(
      `/ventas/${id}/cancelar`,
      {}
    );

  }

}