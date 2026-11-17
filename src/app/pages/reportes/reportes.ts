<section class="reportes">

  <!-- ========================================= -->
  <!-- HEADER -->
  <!-- ========================================= -->

  <div class="reportes-header">

    <div>

      <h1>
        Reportes de ventas
      </h1>

      <p>
        Consulta y analiza el comportamiento de las ventas.
      </p>

    </div>


    <div class="acciones">

      <button
        class="btn-secondary"
        type="button"
        (click)="recargar()"
        [disabled]="loading"
      >
        ↻ Actualizar
      </button>


      <button
        class="btn-excel"
        type="button"
        (click)="exportarExcel()"
        [disabled]="loading || ventasFiltradas.length === 0"
      >
        📊 Excel
      </button>


      <button
        class="btn-pdf"
        type="button"
        (click)="exportarPDF()"
        [disabled]="loading || ventasFiltradas.length === 0"
      >
        📄 PDF
      </button>

    </div>

  </div>


  <!-- ========================================= -->
  <!-- ERROR -->
  <!-- ========================================= -->

  @if (error) {

    <div class="error">

      <div class="error-icon">
        ⚠️
      </div>

      <p>
        {{ error }}
      </p>

      <button
        class="btn-primary"
        type="button"
        (click)="recargar()"
      >
        Intentar nuevamente
      </button>

    </div>

  }


  <!-- ========================================= -->
  <!-- LOADING -->
  <!-- ========================================= -->

  @if (loading) {

    <div class="loading">

      <div class="loading-icon">
        ⏳
      </div>

      <p>
        Cargando información de ventas...
      </p>

    </div>

  }


  @if (!loading && !error) {

    <!-- ======================================= -->
    <!-- FILTROS -->
    <!-- ======================================= -->

    <div class="filtros">

      <div class="filtro-group">

        <label>
          Desde
        </label>

        <input
          type="date"
          [(ngModel)]="fechaDesde"
          (ngModelChange)="aplicarFiltros()"
        >

      </div>


      <div class="filtro-group">

        <label>
          Hasta
        </label>

        <input
          type="date"
          [(ngModel)]="fechaHasta"
          (ngModelChange)="aplicarFiltros()"
        >

      </div>


      <div class="filtro-info">

        <span>
          Ventas encontradas
        </span>

        <strong>
          {{ ventasFiltradas.length }}
        </strong>

      </div>

    </div>


    <!-- ======================================= -->
    <!-- RESUMEN -->
    <!-- ======================================= -->

    <div class="resumen-grid">

      <div class="resumen-card">

        <div class="resumen-icon">
          🧾
        </div>

        <div>

          <span>
            Total de ventas
          </span>

          <strong>
            {{ totalVentas }}
          </strong>

        </div>

      </div>


      <div class="resumen-card">

        <div class="resumen-icon">
          ✓
        </div>

        <div>

          <span>
            Ventas completadas
          </span>

          <strong>
            {{ ventasCompletadas }}
          </strong>

        </div>

      </div>


      <div class="resumen-card">

        <div class="resumen-icon canceladas">
          ×
        </div>

        <div>

          <span>
            Ventas canceladas
          </span>

          <strong>
            {{ ventasCanceladas }}
          </strong>

        </div>

      </div>


      <div class="resumen-card principal">

        <div class="resumen-icon dinero">
          $
        </div>

        <div>

          <span>
            Total vendido
          </span>

          <strong>
            {{ formatearMoneda(totalVendido) }}
          </strong>

        </div>

      </div>

    </div>


    <!-- ======================================= -->
    <!-- MONTOS -->
    <!-- ======================================= -->

    <div class="montos-grid">

      <div class="monto-card">

        <span>
          Subtotal vendido
        </span>

        <strong>
          {{ formatearMoneda(totalSubtotal) }}
        </strong>

      </div>


      <div class="monto-card">

        <span>
          Impuestos
        </span>

        <strong>
          {{ formatearMoneda(totalImpuesto) }}
        </strong>

      </div>

    </div>


    <!-- ======================================= -->
    <!-- REPORTES -->
    <!-- ======================================= -->

    <div class="reportes-grid">


      <!-- MÉTODOS DE PAGO -->

      <div class="reporte-card">

        <div class="card-header">

          <h2>
            Métodos de pago
          </h2>

          <p>
            Ventas agrupadas por método.
          </p>

        </div>


        @if (metodosPago.length > 0) {

          @for (
            metodo of metodosPago;
            track metodo.nombre
          ) {

            <div class="lista-item">

              <div class="lista-info">

                <strong>
                  {{ metodo.nombre }}
                </strong>

                <small>
                  {{ metodo.cantidad }}
                  venta(s)
                </small>

              </div>

              <div class="lista-total">

                {{ formatearMoneda(metodo.total) }}

              </div>

            </div>

          }

        } @else {

          <div class="sin-datos">
            No hay información disponible.
          </div>

        }

      </div>



      <!-- VENDEDORES -->

      <div class="reporte-card">

        <div class="card-header">

          <h2>
            Ventas por vendedor
          </h2>

          <p>
            Rendimiento de los vendedores.
          </p>

        </div>


        @if (vendedores.length > 0) {

          @for (
            vendedor of vendedores;
            track vendedor.nombre
          ) {

            <div class="lista-item">

              <div class="lista-info">

                <strong>
                  {{ vendedor.nombre }}
                </strong>

                <small>
                  {{ vendedor.cantidad }}
                  venta(s)
                </small>

              </div>

              <div class="lista-total">

                {{ formatearMoneda(vendedor.total) }}

              </div>

            </div>

          }

        } @else {

          <div class="sin-datos">
            No hay información disponible.
          </div>

        }

      </div>

    </div>



    <!-- ======================================= -->
    <!-- PRODUCTOS -->
    <!-- ======================================= -->

    <div class="reporte-card productos-card">

      <div class="card-header">

        <h2>
          Productos más vendidos
        </h2>

        <p>
          Los productos con mayor cantidad de unidades vendidas.
        </p>

      </div>


      @if (productos.length > 0) {

        @for (
          producto of productos;
          track producto.nombre;
          let i = $index
        ) {

          <div class="producto-item">

            <div class="producto-posicion">

              {{ i + 1 }}

            </div>


            <div class="producto-info">

              <strong>
                {{ producto.nombre }}
              </strong>

              <small>
                {{ producto.cantidad }}
                unidad(es)
              </small>

            </div>


            <div class="producto-total">

              {{ formatearMoneda(producto.total) }}

            </div>

          </div>

        }

      } @else {

        <div class="sin-datos">
          No hay productos vendidos en este periodo.
        </div>

      }

    </div>



    <!-- ======================================= -->
    <!-- VENTAS DETALLADAS -->
    <!-- ======================================= -->

    <div class="reporte-card ventas-card">

      <div class="card-header">

        <h2>
          Ventas del periodo
        </h2>

        <p>
          Detalle de las ventas encontradas.
        </p>

      </div>


      @if (ventasFiltradas.length > 0) {

        <div class="tabla-container">

          <table>

            <thead>

              <tr>

                <th>
                  Folio
                </th>

                <th>
                  Fecha
                </th>

                <th>
                  Vendedor
                </th>

                <th>
                  Método
                </th>

                <th>
                  Estado
                </th>

                <th>
                  Total
                </th>

              </tr>

            </thead>


            <tbody>

              @for (
                venta of ventasFiltradas;
                track venta.id
              ) {

                <tr>

                  <td>
                    <strong>
                      {{ venta.folio }}
                    </strong>
                  </td>

                  <td>
                    {{ formatearFecha(venta.fechaCreacion) }}
                  </td>

                  <td>
                    {{
                      venta.usuarioNombre ||
                      venta.username ||
                      'Sin vendedor'
                    }}
                  </td>

                  <td>
                    {{
                      formatearMetodoPago(
                        venta.metodoPago
                      )
                    }}
                  </td>

                  <td>

                    <span
                      class="estado"
                      [class.completada]="
                        venta.estado === 'COMPLETADA'
                      "
                      [class.cancelada]="
                        venta.estado === 'CANCELADA'
                      "
                    >

                      {{
                        venta.estado === 'COMPLETADA'
                          ? 'Completada'
                          : 'Cancelada'
                      }}

                    </span>

                  </td>

                  <td class="total-columna">

                    {{
                      formatearMoneda(
                        venta.total
                      )
                    }}

                  </td>

                </tr>

              }

            </tbody>

          </table>

        </div>

      } @else {

        <div class="sin-ventas">

          <div>
            📊
          </div>

          <h3>
            No hay ventas en este periodo
          </h3>

          <p>
            Cambia las fechas para consultar otro periodo.
          </p>

        </div>

      }

    </div>

  }

</section>
