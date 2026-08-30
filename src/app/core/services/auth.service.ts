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


@Injectable({
  providedIn: 'root'
})
export class AuthService {


  // ==========================================
  // URL BASE DEL BACKEND
  // ==========================================

  private readonly API_URL =
    `${API_BASE}/auth`;


  // ==========================================
  // CLAVES LOCAL STORAGE
  // ==========================================

  private readonly TOKEN_KEY =
    'token';

  private readonly USERNAME_KEY =
    'username';

  private readonly ROLE_KEY =
    'rol';

  private readonly USER_ID_KEY =
    'usuarioId';


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private http: HttpClient
  ) {}


  // ==========================================
  // LOGIN
  // ==========================================

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


  // ==========================================
  // LOGOUT
  // ==========================================

  logout(): void {

    localStorage.removeItem(
      this.TOKEN_KEY
    );

    localStorage.removeItem(
      this.USERNAME_KEY
    );

    localStorage.removeItem(
      this.ROLE_KEY
    );

    localStorage.removeItem(
      this.USER_ID_KEY
    );

  }


  // ==========================================
  // OBTENER TOKEN
  // ==========================================

  getToken(): string | null {

    return localStorage.getItem(
      this.TOKEN_KEY
    );

  }


  // ==========================================
  // OBTENER USERNAME
  // ==========================================

  getUsername(): string | null {

    return localStorage.getItem(
      this.USERNAME_KEY
    );

  }


  // ==========================================
  // OBTENER ROL
  // ==========================================

  getRole(): string | null {

    return localStorage.getItem(
      this.ROLE_KEY
    );

  }


  // ==========================================
  // OBTENER ID DEL USUARIO
  // ==========================================

  getUsuarioId(): number | null {

    const id =
      localStorage.getItem(
        this.USER_ID_KEY
      );


    if (!id) {

      return null;

    }


    const usuarioId =
      Number(id);


    if (isNaN(usuarioId)) {

      return null;

    }


    return usuarioId;

  }


  // ==========================================
  // AUTENTICACIÓN
  // ==========================================

  isAuthenticated(): boolean {

    return !!this.getToken();

  }

}