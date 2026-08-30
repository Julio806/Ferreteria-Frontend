import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../../config/api-base';

export interface Rol {
  id: number;
  nombre: string;
}

export interface RolRequest {
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class RolService {

  private readonly apiUrl = `${API_BASE}/roles`;

  constructor(private http: HttpClient) {}

  // ==========================================
  // OBTENER TODOS
  // ==========================================

  obtenerTodos(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.apiUrl);
  }

  // ==========================================
  // OBTENER POR ID
  // ==========================================

  obtenerPorId(id: number): Observable<Rol> {
    return this.http.get<Rol>(`${this.apiUrl}/${id}`);
  }

  // ==========================================
  // CREAR
  // ==========================================

  crear(rol: RolRequest): Observable<Rol> {
    return this.http.post<Rol>(this.apiUrl, rol);
  }

  // ==========================================
  // ACTUALIZAR
  // ==========================================

  actualizar(id: number, rol: RolRequest): Observable<Rol> {
    return this.http.put<Rol>(
      `${this.apiUrl}/${id}`,
      rol
    );
  }

  // ==========================================
  // ELIMINAR
  // ==========================================

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}