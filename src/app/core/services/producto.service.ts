import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';

export interface Producto {

  id: number;

  codigo: string;

  nombre: string;

  descripcion: string;

  marca: string;

  precioCompra: number;

  precioVenta: number;

  stock: number;

  stockMinimo: number;

  unidadMedida: string;

  categoriaId: number;

  categoriaNombre: string;

  activo: boolean;

}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  constructor(
    private apiService: ApiService
  ) {}


  // ==========================================
  // OBTENER TODOS
  // ==========================================

  obtenerTodos(): Observable<Producto[]> {

    return this.apiService.get<Producto[]>(
      '/productos'
    );

  }


  // ==========================================
  // OBTENER ACTIVOS
  // ==========================================

  obtenerActivos(): Observable<Producto[]> {

    return this.apiService.get<Producto[]>(
      '/productos/activos'
    );

  }


  // ==========================================
  // OBTENER POR ID
  // ==========================================

  obtenerPorId(id: number): Observable<Producto> {

    return this.apiService.get<Producto>(
      `/productos/${id}`
    );

  }


  // ==========================================
  // OBTENER POR CÓDIGO
  // ==========================================

  obtenerPorCodigo(codigo: string): Observable<Producto> {

    return this.apiService.get<Producto>(
      `/productos/codigo/${codigo}`
    );

  }


  // ==========================================
  // OBTENER POR CATEGORÍA
  // ==========================================

  obtenerPorCategoria(
    categoriaId: number
  ): Observable<Producto[]> {

    return this.apiService.get<Producto[]>(
      `/productos/categoria/${categoriaId}`
    );

  }


  // ==========================================
  // BUSCAR POR NOMBRE
  // ==========================================

    buscarPorNombre(
        nombre: string
    ): Observable<Producto[]> {

        const params = new HttpParams()
            .set('nombre', nombre);

        return this.apiService.get<Producto[]>(
            '/productos/buscar',
            params
        );

    }


  // ==========================================
  // STOCK BAJO
  // ==========================================

  obtenerStockBajo(): Observable<Producto[]> {

    return this.apiService.get<Producto[]>(
      '/productos/stock-bajo'
    );

  }


  // ==========================================
  // CREAR
  // ==========================================

  crear(producto: ProductoRequest): Observable<Producto> {

    return this.apiService.post<Producto>(
      '/productos',
      producto
    );

  }


  // ==========================================
  // ACTUALIZAR
  // ==========================================

  actualizar(
    id: number,
    producto: ProductoRequest
  ): Observable<Producto> {

    return this.apiService.put<Producto>(
      `/productos/${id}`,
      producto
    );

  }


  // ==========================================
  // AUMENTAR STOCK
  // ==========================================

  aumentarStock(
    id: number,
    cantidad: number
  ): Observable<Producto> {

    return this.apiService.patch<Producto>(
      `/productos/${id}/stock/aumentar?cantidad=${cantidad}`,
      {}
    );

  }


  // ==========================================
  // DISMINUIR STOCK
  // ==========================================

  disminuirStock(
    id: number,
    cantidad: number
  ): Observable<Producto> {

    return this.apiService.patch<Producto>(
      `/productos/${id}/stock/disminuir?cantidad=${cantidad}`,
      {}
    );

  }


  // ==========================================
  // ELIMINAR
  // ==========================================

  eliminar(id: number): Observable<void> {

    return this.apiService.delete<void>(
      `/productos/${id}`
    );

  }

}


// ==========================================
// REQUEST PARA CREAR / ACTUALIZAR
// ==========================================

export interface ProductoRequest {

  codigo: string;

  nombre: string;

  descripcion: string;

  marca: string;

  precioCompra: number;

  precioVenta: number;

  stock: number;

  stockMinimo: number;

  unidadMedida: string;

  categoriaId: number;

}