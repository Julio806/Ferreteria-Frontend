
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface PronosticoInventario {
  productoId: number;
  codigo: string;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  unidadesVendidasUltimos30Dias: number;
  promedioVentaDiaria: number;
  diasRestantes: number;
  fechaProbableAgotamiento: string;
  recomendacion: string;
}

export interface DashboardResponse {
  totalProductos: number;
  productosStockBajo: number;
  totalVentas: number;
  ventasDelDia: number;
  totalCompras: number;
  comprasDelDia: number;
  totalVendidoDelDia: number;
  rol: string;
  pronosticosInventario: PronosticoInventario[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private apiService: ApiService) {}

  obtenerDashboard(): Observable<DashboardResponse> {
    return this.apiService.get<DashboardResponse>('/dashboard');
  }
}
