/**
 * AdminReportes.logic.js
 * Lógica de negocio para el componente AdminReportes.
 * Todas las funciones están encapsuladas en window.AdminReportesLogic
 */
(function() {
  // Evita la redeclaración si el script se carga varias veces  
  if (window.AdminReportesLogic) {
    return;
  }

  window.AdminReportesLogic = {

    /**
     * Formatea un número como moneda Chilena (CLP).
     * @param {number|string} n - El número a formatear.
     * @returns {string} El número formateado como CLP (ej: $1.234).
     */
    CLP: function(n) {
      // Definición original del componente 
      return Number(n).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
    },

    /**
     * Convierte una fecha (idealmente ISO) a una clave de fecha (YYYY-MM-DD).
     * Maneja valores inválidos con un try-catch.
     * @param {string} iso - La cadena de fecha.
     * @returns {string} La fecha en formato YYYY-MM-DD.
     */
    toDateKey: function(iso) {
      // Definición original del componente 
      try {
        const d = new Date(iso);
        return d.toISOString().slice(0, 10);
      } catch {
        return String(iso).slice(0, 10);
      }
    },

    /**
     * Calcula los totales y contadores basados en las órdenes filtradas.
     * @param {Array<Object>} enRango - Array de órdenes filtradas por fecha.
     * @returns {Object} Un objeto con { total, count, pagado, fallido, anulado }.
     */
    calcularTotales: function(enRango) {
      // Lógica extraída del useMemo 'totales' 
      const acc = { total: 0, count: 0, pagado: 0, fallido: 0, anulado: 0 };
      if (!Array.isArray(enRango)) {
        return acc;
      }
      enRango.forEach(o => {
        acc.count += 1;
        acc.total += Number(o.total) || 0;
        acc[o.estado] = (acc[o.estado] || 0) + 1;
      });
      return acc;
    },

    /**
     * Agrupa las ventas por día para el rango especificado.
     * @param {Array<Object>} enRango - Array de órdenes filtradas por fecha.
     * @param {string|number} rango - El número de días (ej: 7, 30).
     * @returns {Array<Object>} Un array de { fecha, pedidos, ingresos } por cada día en el rango.
     */
    calcularVentasPorDia: function(enRango, rango) {
      // Lógica extraída del useMemo 'ventasPorDia' 
      const map = new Map();
      (enRango || []).forEach(o => {
        // Requerimos la función toDateKey que también está en este objeto
        const k = window.AdminReportesLogic.toDateKey(o.fecha);
        const prev = map.get(k) || { fecha: k, pedidos: 0, ingresos: 0 };
        if (o.estado === 'pagado') {
          prev.pedidos += 1;
          prev.ingresos += Number(o.total) || 0;
        }
        map.set(k, prev);
      });

      // Generar últimos N días aunque estén en 0
      const arr = [];
      const numRango = Number(rango) || 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = numRango - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        // Requerimos la función toDateKey que también está en este objeto
        const k = window.AdminReportesLogic.toDateKey(d.toISOString());
        arr.push(map.get(k) || { fecha: k, pedidos: 0, ingresos: 0 });
      }
      return arr;
    },

    /**
     * Calcula el top 10 de productos más vendidos.
     * @param {Array<Object>} enRango - Array de órdenes filtradas por fecha.
     * @returns {Array<Object>} Un array con el top 10 de productos { codigo, nombre, cantidad, ingresos }.
     */
    calcularTopProductos: function(enRango) {
      // Lógica extraída del useMemo 'topProductos' 
      const map = new Map();
      if (!Array.isArray(enRango)) {
        return [];
      }
      enRango.filter(o => o.estado === 'pagado').forEach(o => {
        (o.items || []).forEach(it => {
          const prev = map.get(it.codigo) || { codigo: it.codigo, nombre: it.nombre, cantidad: 0, ingresos: 0 };
          prev.cantidad += Number(it.cantidad) || 0;
          prev.ingresos += (Number(it.precio) || 0) * (Number(it.cantidad) || 1);
          map.set(it.codigo, prev);
        });
      });
      return Array.from(map.values()).sort((a, b) => b.cantidad - a.cantidad).slice(0, 10);
    },
    
    /**
     * Genera y descarga un archivo CSV.
     * (Esta función interactúa con el DOM y APIs del navegador).
     * @param {string} filename - El nombre del archivo (ej: 'reporte.csv').
     * @param {Array<Object>} rows - Un array de objetos a exportar.
     */
    exportCSV: function(filename, rows) {
      // Definición original del componente 
      // Función interna para procesar y escapar comillas en una fila
      const process = (r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',');
      
      const headers = Object.keys(rows[0] || {}).join(',');
      const csvData = rows.map(r => process(Object.values(r)));
      
      const csv = [headers, ...csvData].join('\r\n');
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },

    /**
     * Handler para exportar órdenes. Prepara los datos y llama a exportCSV.
     * @param {Array<Object>} enRango - Array de órdenes filtradas.
     * @param {string|number} rango - El rango de días seleccionado (ej: 30).
     */
    exportarOrdenes: function(enRango, rango) {
      // Lógica extraída del handler 'exportarOrdenes' 
      const rows = (enRango || []).map(o => ({
        id: o.id,
        codigo: o.codigo,
        nro: o.nro,
        fecha: o.fecha,
        estado: o.estado,
        total: o.total,
        cliente: o.cliente?.correo || ''
      }));
      
      // Llama a la otra función de este mismo objeto
      window.AdminReportesLogic.exportCSV(`ordenes_${rango}d.csv`, rows);
    }

  };
})();