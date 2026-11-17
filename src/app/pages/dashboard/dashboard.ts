
import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

import {
  Chart,
  ChartConfiguration,
  registerables
} from 'chart.js';

import {
  DashboardService,
  DashboardResponse,
  PronosticoInventario
} from '../../core/services/dashboard.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {

  dashboard: DashboardResponse | null = null;
  rol: string | null = null;
  cargando = true;
  error = false;

  filtroEstado = 'TODOS';
  filtroReposicion = 'TODOS';
  busqueda = '';

  graficaStock: Chart | null = null;
  graficaDistribucion: Chart | null = null;
  graficaVentas: Chart | null = null;
  graficaPronostico: Chart | null = null;

constructor(
  private dashboardService: DashboardService,
  private authService: AuthService
) {
  this.rol = this.authService.getRole();
}

  ngOnInit(): void {
    this.obtenerDashboard();
  }

  ngOnDestroy(): void {
    this.destruirGraficas();
  }

  // ==========================================
  // CARGAR INFORMACIÓN DEL DASHBOARD
  // ==========================================

  obtenerDashboard(): void {

    this.cargando = true;
    this.error = false;

    this.destruirGraficas();

    this.dashboardService.obtenerDashboard().subscribe({

      next: (data: DashboardResponse) => {

        this.dashboard = {
          ...data,
          pronosticosInventario:
            data.pronosticosInventario ?? []
        };

        this.cargando = false;

        setTimeout(() => {
          this.crearGraficas();
        }, 100);
      },

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

  // ==========================================
  // LISTA GENERAL DE PRODUCTOS
  // ==========================================

  get productos(): PronosticoInventario[] {
    return this.dashboard?.pronosticosInventario ?? [];
  }

  // ==========================================
  // FILTROS Y BÚSQUEDA
  // ==========================================

  get productosFiltrados(): PronosticoInventario[] {

    const texto = this.busqueda
      .trim()
      .toLocaleLowerCase();

    return this.productos.filter(producto => {

      const estado = this.claseEstado(producto);

      // Filtro por estado
      const coincideEstado =
        this.filtroEstado === 'TODOS' ||
        estado === this.filtroEstado;

      // Filtro por reposición
      const necesitaReposicion =
        producto.stockActual <= producto.stockMinimo;

      const coincideReposicion =
        this.filtroReposicion === 'TODOS' ||
        (
          this.filtroReposicion === 'SI' &&
          necesitaReposicion
        ) ||
        (
          this.filtroReposicion === 'NO' &&
          !necesitaReposicion
        );

      // Búsqueda por nombre o código
      const nombre = String(producto.nombre ?? '')
        .trim()
        .toLocaleLowerCase();

      const codigo = String(producto.codigo ?? '')
        .trim()
        .toLocaleLowerCase();

      const coincideBusqueda =
        texto === '' ||
        nombre.includes(texto) ||
        codigo.includes(texto);

      return (
        coincideEstado &&
        coincideReposicion &&
        coincideBusqueda
      );
    });
  }

  actualizarFiltros(): void {
    // Los resultados se actualizan automáticamente
    // mediante el getter productosFiltrados.
  }

  limpiarFiltros(): void {

    this.filtroEstado = 'TODOS';
    this.filtroReposicion = 'TODOS';
    this.busqueda = '';
  }

  // ==========================================
  // INDICADORES KPI
  // ==========================================

  get totalUnidades(): number {

    return this.productos.reduce(
      (total, producto) =>
        total + producto.stockActual,
      0
    );
  }

  get productosAgotados(): number {

    return this.productos.filter(
      producto => producto.stockActual <= 0
    ).length;
  }

  get productosCriticos(): number {

    return this.productos.filter(
      producto =>
        producto.stockActual > 0 &&
        producto.stockActual <= producto.stockMinimo
    ).length;
  }

  get productosEstables(): number {

    return this.productos.filter(
      producto =>
        producto.stockActual > producto.stockMinimo
    ).length;
  }

  get productosPorReponer(): number {

    return this.productos.filter(
      producto =>
        producto.stockActual <= producto.stockMinimo
    ).length;
  }

  get porcentajeReposicion(): number {

    if (!this.productos.length) return 0;

    return (
      this.productosPorReponer /
      this.productos.length
    ) * 100;
  }

  get porcentajeEstables(): number {

    if (!this.productos.length) return 0;

    return (
      this.productosEstables /
      this.productos.length
    ) * 100;
  }

  get porcentajeCriticos(): number {

    if (!this.productos.length) return 0;

    return (
      this.productosCriticos /
      this.productos.length
    ) * 100;
  }

  get coberturaPromedio(): number {

    const productosConVenta = this.productos.filter(
      producto => producto.promedioVentaDiaria > 0
    );

    if (!productosConVenta.length) return 0;

    const totalDias = productosConVenta.reduce(
      (total, producto) =>
        total + producto.diasRestantes,
      0
    );

    return Math.round(
      totalDias / productosConVenta.length
    );
  }

  // ==========================================
  // PRODUCTOS PARA LAS GRÁFICAS
  // ==========================================

  get productosConMayorStock(): PronosticoInventario[] {

    return [...this.productos]
      .sort(
        (a, b) => b.stockActual - a.stockActual
      )
      .slice(0, 7);
  }

  get productosConMayorVenta(): PronosticoInventario[] {

    return [...this.productos]
      .sort(
        (a, b) =>
          b.unidadesVendidasUltimos30Dias -
          a.unidadesVendidasUltimos30Dias
      )
      .slice(0, 7);
  }

  get productosConPronostico(): PronosticoInventario[] {

    return [...this.productos]
      .filter(
        producto =>
          producto.promedioVentaDiaria > 0
      )
      .sort(
        (a, b) =>
          a.diasRestantes - b.diasRestantes
      )
      .slice(0, 7);
  }

  // ==========================================
  // ESTADOS DEL INVENTARIO
  // ==========================================

  claseEstado(
    producto: PronosticoInventario
  ): string {

    if (producto.stockActual <= 0) {
      return 'agotado';
    }

    if (
      producto.stockActual <=
      producto.stockMinimo
    ) {
      return 'critico';
    }

    return 'estable';
  }

  textoEstado(
    producto: PronosticoInventario
  ): string {

    if (producto.stockActual <= 0) {
      return 'Agotado';
    }

    if (
      producto.stockActual <=
      producto.stockMinimo
    ) {
      return 'Reordenar';
    }

    return 'Estable';
  }

  porcentajeStock(
    producto: PronosticoInventario
  ): number {

    const referencia = producto.stockMinimo * 3;

    if (referencia <= 0) {
      return producto.stockActual > 0 ? 100 : 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        (producto.stockActual / referencia) * 100
      )
    );
  }

  porcentajeBarra(stock: number): number {

    const maximo = Math.max(
      1,
      ...this.productosConMayorStock.map(
        producto => producto.stockActual
      )
    );

    return (stock / maximo) * 100;
  }

  trackProducto(
    index: number,
    producto: PronosticoInventario
  ): number {

    return producto.productoId;
  }

  // ==========================================
  // ALERTAS DE INVENTARIO
  // ==========================================

  get productosAlerta(): PronosticoInventario[] {

    return this.productos.filter(
      producto =>
        producto.stockActual <= producto.stockMinimo
    );
  }

  // ==========================================
  // CREAR GRÁFICAS
  // ==========================================

  crearGraficas(): void {

    if (!this.dashboard) return;

    this.destruirGraficas();

    this.crearGraficaStock();
    this.crearGraficaDistribucion();
    this.crearGraficaVentas();
    this.crearGraficaPronostico();
  }

  // ==========================================
  // GRÁFICA 1: STOCK POR PRODUCTO
  // ==========================================

  crearGraficaStock(): void {

    const canvas = document.getElementById(
      'graficaStock'
    ) as HTMLCanvasElement | null;

    if (!canvas) return;

    const productos = this.productosConMayorStock;

    const configuracion: ChartConfiguration<'bar'> = {

      type: 'bar',

      data: {
        labels: productos.map(
          producto => producto.nombre
        ),

        datasets: [{
          label: 'Unidades disponibles',

          data: productos.map(
            producto => producto.stockActual
          ),

          backgroundColor: '#ff8500',

          borderRadius: 6,

          borderSkipped: false,

          barThickness: 18
        }]
      },

      options: {

        indexAxis: 'y',

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

          legend: {
            display: false
          },

          tooltip: {
            callbacks: {
              label: (context) =>
                ` ${context.parsed.x} unidades`
            }
          }
        },

        scales: {

          x: {
            beginAtZero: true,

            grid: {
              color: 'rgba(255,255,255,0.06)'
            },

            ticks: {
              color: '#9ca3af',
              precision: 0
            }
          },

          y: {
            grid: {
              display: false
            },

            ticks: {
              color: '#d1d5db'
            }
          }
        }
      }
    };

    this.graficaStock = new Chart(
      canvas,
      configuracion
    );
  }

  // ==========================================
  // GRÁFICA 2: DISTRIBUCIÓN DEL INVENTARIO
  // ==========================================

  crearGraficaDistribucion(): void {

    const canvas = document.getElementById(
      'graficaDistribucion'
    ) as HTMLCanvasElement | null;

    if (!canvas) return;

    const configuracion: ChartConfiguration<'doughnut'> = {

      type: 'doughnut',

      data: {

        labels: [
          'Estables',
          'Por reponer',
          'Agotados'
        ],

        datasets: [{
          data: [
            this.productosEstables,
            this.productosCriticos,
            this.productosAgotados
          ],

          backgroundColor: [
            '#ff8500',
            '#facc15',
            '#ef4444'
          ],

          borderWidth: 0,

          hoverOffset: 8
        }]
      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        cutout: '72%',

        plugins: {

          legend: {
            position: 'bottom',

            labels: {
              color: '#d1d5db',
              padding: 20,
              usePointStyle: true
            }
          }
        }
      }
    };

    this.graficaDistribucion = new Chart(
      canvas,
      configuracion
    );
  }

  // ==========================================
  // GRÁFICA 3: VENTAS DE LOS ÚLTIMOS 30 DÍAS
  // ==========================================

  crearGraficaVentas(): void {

    const canvas = document.getElementById(
      'graficaVentas'
    ) as HTMLCanvasElement | null;

    if (!canvas) return;

    const productos = this.productosConMayorVenta;

    const configuracion: ChartConfiguration<'bar'> = {

      type: 'bar',

      data: {

        labels: productos.map(
          producto => producto.nombre
        ),

        datasets: [{
          label: 'Unidades vendidas',

          data: productos.map(
            producto =>
              producto.unidadesVendidasUltimos30Dias
          ),

          backgroundColor: '#fb923c',

          borderRadius: 6,

          borderSkipped: false
        }]
      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

          legend: {
            display: false
          },

          tooltip: {
            callbacks: {
              label: (context) =>
                ` ${context.parsed.y} unidades`
            }
          }
        },

        scales: {

          y: {
            beginAtZero: true,

            ticks: {
              color: '#9ca3af',
              precision: 0
            },

            grid: {
              color: 'rgba(255,255,255,0.06)'
            }
          },

          x: {
            ticks: {
              color: '#d1d5db'
            },

            grid: {
              display: false
            }
          }
        }
      }
    };

    this.graficaVentas = new Chart(
      canvas,
      configuracion
    );
  }

  // ==========================================
  // GRÁFICA 4: PRONÓSTICO DE AGOTAMIENTO
  // ==========================================

  crearGraficaPronostico(): void {

    const canvas = document.getElementById(
      'graficaPronostico'
    ) as HTMLCanvasElement | null;

    if (!canvas) return;

    const productos = this.productosConPronostico;

    const colores = productos.map(producto => {

      if (producto.diasRestantes <= 7) {
        return '#ef4444';
      }

      if (producto.diasRestantes <= 30) {
        return '#facc15';
      }

      return '#ff8500';
    });

    const configuracion: ChartConfiguration<'bar'> = {

      type: 'bar',

      data: {

        labels: productos.map(
          producto => producto.nombre
        ),

        datasets: [{
          label: 'Días estimados',

          data: productos.map(
            producto => producto.diasRestantes
          ),

          backgroundColor: colores,

          borderRadius: 6,

          borderSkipped: false
        }]
      },

      options: {

        indexAxis: 'y',

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

          legend: {
            display: false
          },

          tooltip: {
            callbacks: {
              label: (context) =>
                ` ${context.parsed.x} días estimados`
            }
          }
        },

        scales: {

          x: {
            beginAtZero: true,

            ticks: {
              color: '#9ca3af',
              precision: 0
            },

            grid: {
              color: 'rgba(255,255,255,0.06)'
            }
          },

          y: {
            ticks: {
              color: '#d1d5db'
            },

            grid: {
              display: false
            }
          }
        }
      }
    };

    this.graficaPronostico = new Chart(
      canvas,
      configuracion
    );
  }

  // ==========================================
  // DESTRUIR GRÁFICAS
  // ==========================================

  destruirGraficas(): void {

    this.graficaStock?.destroy();
    this.graficaDistribucion?.destroy();
    this.graficaVentas?.destroy();
    this.graficaPronostico?.destroy();

    this.graficaStock = null;
    this.graficaDistribucion = null;
    this.graficaVentas = null;
    this.graficaPronostico = null;
  }

  isAdmin(): boolean {
  const rolNormalizado = this.rol
    ?.trim()
    .toUpperCase()
    .replace(/^ROLE_/, '');

  return rolNormalizado === 'ADMIN';
}
}
