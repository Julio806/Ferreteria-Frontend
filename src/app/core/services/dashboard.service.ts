import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';

export interface DashboardResponse {

  totalProductos: number;

  productosStockBajo: number;

  totalVentas: number;

  ventasDelDia: number;

  totalCompras: number;

  comprasDelDia: number;

  totalVendidoDelDia: number;

  rol: string;

}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private apiService: ApiService
  ) {}

  obtenerDashboard(): Observable<DashboardResponse> {

    return this.apiService.get<DashboardResponse>(
      '/dashboard'
    );

  }

}