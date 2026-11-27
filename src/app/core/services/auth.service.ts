
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { API_BASE } from '../../config/api-base';

interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  usuarioId: number;
  token: string;
  username: string;
  rol: string;
}

interface JwtPayload {
  exp?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL = `${API_BASE}/auth`;

  private readonly TOKEN_KEY = 'token';
  private readonly USERNAME_KEY = 'username';
  private readonly ROLE_KEY = 'rol';
  private readonly USER_ID_KEY = 'usuarioId';

  constructor(private http: HttpClient) {}

  // LOGIN
  login(
    username: string,
    password: string
  ): Observable<LoginResponse> {

    const credentials: LoginRequest = {
      username,
      password
    };

    return this.http
      .post<LoginResponse>(
        `${this.API_URL}/login`,
        credentials
      )
      .pipe(
        tap(response => {

          localStorage.setItem(
            this.TOKEN_KEY,
            response.token
          );

          localStorage.setItem(
            this.USERNAME_KEY,
            response.username
          );

          localStorage.setItem(
            this.ROLE_KEY,
            response.rol
          );

          localStorage.setItem(
            this.USER_ID_KEY,
            response.usuarioId.toString()
          );

        })
      );
  }

  // LOGOUT
  logout(): void {

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem(this.USER_ID_KEY);

  }

  // OBTENER TOKEN
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // OBTENER USERNAME
  getUsername(): string | null {
    return localStorage.getItem(this.USERNAME_KEY);
  }

  // OBTENER ROL
  getRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }

  // OBTENER ID DEL USUARIO
  getUsuarioId(): number | null {

    const id = localStorage.getItem(this.USER_ID_KEY);

    if (!id) {
      return null;
    }

    const usuarioId = Number(id);

    if (isNaN(usuarioId)) {
      return null;
    }

    return usuarioId;
  }

  // COMPROBAR SI EL TOKEN HA EXPIRADO
  isTokenExpired(token: string): boolean {

    try {

      const payloadBase64 = token.split('.')[1];

      if (!payloadBase64) {
        return true;
      }

      const base64 = payloadBase64
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const payload: JwtPayload = JSON.parse(
        decodeURIComponent(
          Array.from(atob(base64))
            .map(char =>
              '%' + char.charCodeAt(0)
                .toString(16)
                .padStart(2, '0')
            )
            .join('')
        )
      );

      if (
        typeof payload.exp !== 'number'
      ) {
        return true;
      }

      return payload.exp * 1000 <= Date.now();

    } catch {

      return true;

    }
  }

  // AUTENTICACIÓN
  isAuthenticated(): boolean {

    const token = this.getToken();

    if (!token) {
      return false;
    }

    if (this.isTokenExpired(token)) {

      this.logout();

      return false;
    }

    return true;
  }

}
