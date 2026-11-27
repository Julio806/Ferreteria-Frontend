import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../../config/api-base';

export interface Rol {
  id: number;
  nombre: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  username: string;
  email: string;
  activo: boolean;
  rol: Rol;
}

export interface UsuarioRequest {
  nombre: string;
  username: string;
  email: string;
  password?: string;
  rolId: number;
  activo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private http = inject(HttpClient);

  private apiUrl = `${API_BASE}/usuarios`;
  private rolesUrl = `${API_BASE}/roles`;

  obtenerTodos(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  crear(usuario: UsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  actualizar(
    id: number,
    usuario: UsuarioRequest
  ): Observable<Usuario> {
    return this.http.put<Usuario>(
      `${this.apiUrl}/${id}`,
      usuario
    );
  }

cambiarEstado(id: number, activo: boolean): Observable<void> {
  return this.http.patch<void>(
    `${this.apiUrl}/${id}/estado?activo=${activo}`,
    null
  );
}

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

  obtenerRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.rolesUrl);
  }
}
