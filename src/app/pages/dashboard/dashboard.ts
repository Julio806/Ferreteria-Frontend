import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  DashboardService,
  DashboardResponse
} from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    CurrencyPipe
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  // ==========================================
  // INFORMACIÓN DEL DASHBOARD
  // ==========================================

  dashboard: DashboardResponse | null = null;


  // ==========================================
  // ESTADOS
  // ==========================================

  cargando = true;

  error = false;


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private dashboardService: DashboardService
  ) {}


  // ==========================================
  // INICIALIZACIÓN
  // ==========================================

  ngOnInit(): void {

    this.obtenerDashboard();

  }


  // ==========================================
  // OBTENER INFORMACIÓN
  // ==========================================

  obtenerDashboard(): void {

    this.cargando = true;

    this.error = false;

    this.dashboardService
      .obtenerDashboard()
      .subscribe({

        // ==================================
        // RESPUESTA EXITOSA
        // ==================================

        next: (data: DashboardResponse) => {

          this.dashboard = data;

          this.cargando = false;

          console.log(
            'Dashboard recibido:',
            data
          );

        },


        // ==================================
        // ERROR
        // ==================================

        error: (err) => {

          console.error(
            'Error al obtener dashboard:',
            err
          );

          this.cargando = false;

          this.error = true;

        }

      });

  }

}