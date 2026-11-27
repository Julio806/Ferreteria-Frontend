
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE } from '../../config/api-base';

// ==========================================
// INTERFACES DE VENTAS
// ==========================================

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

// ==========================================
// INTERFACES DE PLANTILLAS
// ==========================================

export type TipoDocumento =
  | 'VENTAS_WORD'
  | 'VENTAS_EXCEL'
  | 'INVENTARIO_WORD'
  | 'INVENTARIO_EXCEL';

export interface DocumentoPlantilla {
  id: number;
  nombre: string;
  tipo: TipoDocumento;
  nombreArchivo: string;
  rutaArchivo: string;
  extension: string;
  fechaSubida: string;
}

// ==========================================
// SERVICIO
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  private http = inject(HttpClient);

  private apiUrl = `${API_BASE}/ventas`;
  private documentosUrl = `${API_BASE}/documentos`;
  private reportesUrl = `${API_BASE}/reportes`;

  // ==========================================
  // OBTENER VENTAS
  // ==========================================

  obtenerVentas(): Observable<VentaReporte[]> {
    return this.http.get<VentaReporte[]>(this.apiUrl);
  }

  // ==========================================
  // CONSULTAR PLANTILLAS
  // ==========================================

  obtenerPlantillas(): Observable<DocumentoPlantilla[]> {
    return this.http.get<DocumentoPlantilla[]>(
      this.documentosUrl
    );
  }

  obtenerPlantilla(
    tipo: TipoDocumento
  ): Observable<DocumentoPlantilla> {

    return this.http.get<DocumentoPlantilla>(
      `${this.documentosUrl}/${tipo}`
    );
  }

  // ==========================================
  // SUBIR PLANTILLA
  // ==========================================

  subirPlantilla(
    tipo: TipoDocumento,
    archivo: File
  ): Observable<DocumentoPlantilla> {

    const formData = new FormData();
    formData.append('archivo', archivo);

    return this.http.post<DocumentoPlantilla>(
      `${this.documentosUrl}/${tipo}`,
      formData
    );
  }

  // ==========================================
  // REEMPLAZAR PLANTILLA
  // ==========================================

  reemplazarPlantilla(
    tipo: TipoDocumento,
    archivo: File
  ): Observable<DocumentoPlantilla> {

    const formData = new FormData();
    formData.append('archivo', archivo);

    return this.http.put<DocumentoPlantilla>(
      `${this.documentosUrl}/${tipo}`,
      formData
    );
  }

  // ==========================================
  // ELIMINAR PLANTILLA
  // ==========================================

  eliminarPlantilla(
    tipo: TipoDocumento
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.documentosUrl}/${tipo}`
    );
  }

  // ==========================================
  // GENERAR WORD DE VENTAS
  // ==========================================

  generarVentasWord(
    fechaDesde: string,
    fechaHasta: string
  ): Observable<Blob> {

    const params = new HttpParams()
      .set('fechaDesde', fechaDesde)
      .set('fechaHasta', fechaHasta);

    return this.http.get(
      `${this.reportesUrl}/ventas/word`,
      {
        params,
        responseType: 'blob'
      }
    );
  }

  // ==========================================
  // GENERAR EXCEL DE VENTAS
  // ==========================================

  generarVentasExcel(
    fechaDesde: string,
    fechaHasta: string
  ): Observable<Blob> {

    const params = new HttpParams()
      .set('fechaDesde', fechaDesde)
      .set('fechaHasta', fechaHasta);

    return this.http.get(
      `${this.reportesUrl}/ventas/excel`,
      {
        params,
        responseType: 'blob'
      }
    );
  }

  // ==========================================
  // GENERAR WORD DE INVENTARIO
  // ==========================================

  generarInventarioWord(): Observable<Blob> {

    return this.http.get(
      `${this.reportesUrl}/inventario/word`,
      {
        responseType: 'blob'
      }
    );
  }

  // ==========================================
  // GENERAR EXCEL DE INVENTARIO
  // ==========================================

  generarInventarioExcel(): Observable<Blob> {

    return this.http.get(
      `${this.reportesUrl}/inventario/excel`,
      {
        responseType: 'blob'
      }
    );
  }

}
