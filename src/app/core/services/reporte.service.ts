import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../../config/api-base';

export interface VentaItemReporte {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface VentaReporte {
  id: number;
  folio: string;

  usuarioId: number;
  usuarioNombre: string;
  username: string;

  subtotal: number;
  impuesto: number;
  total: number;

  metodoPago: string;
  estado: string;

  fechaCreacion: string;

  items: VentaItemReporte[];
}

@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  private http = inject(HttpClient);

  private apiUrl =
    `${API_BASE}/ventas`;

  // ==========================================
  // OBTENER TODAS LAS VENTAS
  // ==========================================

  obtenerVentas(): Observable<VentaReporte[]> {

    return this.http.get<VentaReporte[]>(
      this.apiUrl
    );
  }

}