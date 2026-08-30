import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';


// ==========================================
// ITEM DE LA COMPRA
// ==========================================

export interface CompraItemRequest {

  productoId: number;

  cantidad: number;

}


// ==========================================
// REQUEST PARA CREAR COMPRA
// ==========================================

export interface CompraRequest {

  usuarioId: number;

  items: CompraItemRequest[];

}


// ==========================================
// ITEM DE RESPUESTA
// ==========================================

export interface CompraItemResponse {

  id: number;

  productoId: number;

  productoNombre: string;

  cantidad: number;

  precioUnitario: number;

  subtotal: number;

}


// ==========================================
// ESTADO DE COMPRA
// ==========================================

export type EstadoCompra =
  | 'COMPLETADA'
  | 'CANCELADA';


// ==========================================
// RESPUESTA DE COMPRA
// ==========================================

export interface Compra {

  id: number;

  folio: string;

  usuarioId: number;

  usuarioNombre: string;

  username: string;

  subtotal: number;

  impuesto: number;

  total: number;

  estado: EstadoCompra;

  fechaCreacion: string;

  items: CompraItemResponse[];

}


// ==========================================
// SERVICIO
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class CompraService {

  constructor(
    private apiService: ApiService
  ) {}


  // ==========================================
  // CREAR COMPRA
  // ==========================================

  crear(
    compra: CompraRequest
  ): Observable<Compra> {

    return this.apiService.post<Compra>(
      '/compras',
      compra
    );

  }


  // ==========================================
  // OBTENER TODAS
  // ==========================================

  obtenerTodas(): Observable<Compra[]> {

    return this.apiService.get<Compra[]>(
      '/compras'
    );

  }


  // ==========================================
  // OBTENER POR ID
  // ==========================================

  obtenerPorId(
    id: number
  ): Observable<Compra> {

    return this.apiService.get<Compra>(
      `/compras/${id}`
    );

  }


  // ==========================================
  // COMPRAS DEL DÍA
  // ==========================================

  obtenerComprasDelDia(): Observable<Compra[]> {

    return this.apiService.get<Compra[]>(
      '/compras/hoy'
    );

  }


  // ==========================================
  // COMPRAS POR FECHA
  // ==========================================

  obtenerPorFecha(
    fecha: string
  ): Observable<Compra[]> {

    return this.apiService.get<Compra[]>(
      `/compras/fecha/${fecha}`
    );

  }


  // ==========================================
  // COMPRAS POR USUARIO
  // ==========================================

  obtenerPorUsuario(
    usuarioId: number
  ): Observable<Compra[]> {

    return this.apiService.get<Compra[]>(
      `/compras/usuario/${usuarioId}`
    );

  }


  // ==========================================
  // CANCELAR COMPRA
  // ==========================================

  cancelar(
    id: number
  ): Observable<void> {

    return this.apiService.put<void>(
      `/compras/${id}/cancelar`,
      {}
    );

  }

}