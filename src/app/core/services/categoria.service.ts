import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';


// ==========================================
// MODELO CATEGORÍA
// ==========================================

export interface Categoria {

  id: number;

  nombre: string;

  descripcion: string;

  activo: boolean;

}


// ==========================================
// REQUEST
// ==========================================

export interface CategoriaRequest {

  nombre: string;

  descripcion: string;

}


// ==========================================
// SERVICIO
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  constructor(
    private apiService: ApiService
  ) {}


  // ==========================================
  // OBTENER TODAS
  // ==========================================

  obtenerTodas(): Observable<Categoria[]> {

    return this.apiService.get<Categoria[]>(
      '/categorias'
    );

  }


  // ==========================================
  // OBTENER ACTIVAS
  // ==========================================

  obtenerActivas(): Observable<Categoria[]> {

    return this.apiService.get<Categoria[]>(
      '/categorias/activas'
    );

  }


  // ==========================================
  // OBTENER POR ID
  // ==========================================

  obtenerPorId(
    id: number
  ): Observable<Categoria> {

    return this.apiService.get<Categoria>(
      `/categorias/${id}`
    );

  }


  // ==========================================
  // CREAR
  // ==========================================

  crear(
    categoria: CategoriaRequest
  ): Observable<Categoria> {

    return this.apiService.post<Categoria>(
      '/categorias',
      categoria
    );

  }


  // ==========================================
  // ACTUALIZAR
  // ==========================================

  actualizar(
    id: number,
    categoria: CategoriaRequest
  ): Observable<Categoria> {

    return this.apiService.put<Categoria>(
      `/categorias/${id}`,
      categoria
    );

  }


  // ==========================================
  // ELIMINAR
  // ==========================================

  eliminar(
    id: number
  ): Observable<void> {

    return this.apiService.delete<void>(
      `/categorias/${id}`
    );

  }

}
