// Archivo: src/utils/AdminProductosCriticos.logic.js
// Lógica pura para el componente AdminProductosCriticos
// NOTA: Este archivo debe ser importado en el componente React.

(function() {
  // Evita la redeclaración si la ventana ya tiene esta lógica
  if (window.AdminProductosCriticosLogic) {
    return;
  }

  /**
   * Contenedor para la lógica del componente AdminProductosCriticos.
   */
  window.AdminProductosCriticosLogic = {

    /**
     * Formatea un número a la moneda CLP (Peso Chileno). 
     * @param {number|string} n - El número a formatear.
     * @returns {string} El número formateado como moneda CLP.
     */
    CLP: function(n) {
      var num = Number(n);
      // Maneja NaN, null, undefined
      if (isNaN(num) || n == null) {
        return '$0';
      }
      return num.toLocaleString('es-CL', { 
        style: 'currency', 
        currency: 'CLP', 
        maximumFractionDigits: 0 
      });
    },

    /**
     * Resuelve la ruta de una imagen, prefijando el PUBLIC_URL si es necesario. 
     * Maneja URLs absolutas, data-uris y rutas relativas.
     * @param {string} src - La ruta de la imagen original.
     * @param {string} [publicUrl] - El valor de process.env.PUBLIC_URL.
     * @returns {string} La ruta de la imagen resuelta.
     */
    resolveImg: function(src, publicUrl) {
      if (!src) return '';
      
      // Si es una URL completa (http/https) o data-uri, devolverla tal cual.
      if (/^https?:\/\//i.test(src) || /^data:/i.test(src)) {
        return src;
      }
      
      const s = String(src).replace(/^\/+/, ''); // Eliminar slashes al inicio
      const prefix = (publicUrl || '').replace(/\/$/, ''); // Obtener prefix y quitar slash al final
      
      return `${prefix}/${s}` || `/${s}`;
    },

    /**
     * Filtra la lista de productos para encontrar los "críticos". 
     * (Lógica extraída del hook useMemo).
     * @param {Array<Object>} items - La lista completa de productos.
     * @param {number} umbral - El umbral de stock bajo.
     * @param {boolean} soloAgotados - Si es true, solo muestra productos 'agotado'.
     * @param {string} q - El término de búsqueda (código o nombre).
     * @returns {Array<Object>} La lista de productos filtrados.
     */
    filterCriticos: function(items, umbral, soloAgotados, q) {
      const text = (q || '').toLowerCase().trim();
      
      return (items || []).filter(p => {
        // 1. Validar búsqueda de texto
        const matchQ = !text || 
                       (p.nombre && p.nombre.toLowerCase().includes(text)) || 
                       (p.codigo && p.codigo.toLowerCase().includes(text));
        
        // 2. Validar stock bajo
        const lowStock = (Number(p.stock) || 0) <= Number(umbral);
        
        // 3. Validar estado agotado
        const agotado = p.estado === 'agotado';
        
        // 4. Determinar si mostrar (dependiendo de soloAgotados)
        const flag = soloAgotados ? agotado : (lowStock || agotado);
        
        return matchQ && flag;
      });
    },

    /**
     * Lógica para añadir stock a un producto. 
     * Actualiza el producto usando el servicio, pero NO recarga el estado del componente.
     * @param {string} codigo - El código del producto.
     * @param {number} delta - La cantidad de stock a añadir (+1, +5).
     * @param {Object} productService - La instancia del servicio de productos (debe ser inyectado).
     * @returns {boolean} True si la actualización fue exitosa, false si no se encontró el producto.
     */
    addStockLogic: function(codigo, delta, productService) {
      if (!productService) {
        console.error('productService no fue proporcionado a addStockLogic');
        return false;
      }
      const p = productService.getById(codigo);
      if (!p) return false;

      // Calcula el nuevo stock, asegurando que no sea menor a 0
      const nuevo = Math.max(0, (Number(p.stock) || 0) + Number(delta));
      
      // Si el stock es > 0 y el estado era 'agotado', cambiarlo a 'disponible'
      const estado = (nuevo > 0 && p.estado === 'agotado') ? 'disponible' : p.estado;

      productService.update(codigo, { stock: nuevo, estado });
      return true;
    },

    /**
     * Lógica para marcar el estado de un producto. 
     * Actualiza el producto usando el servicio, pero NO recarga el estado del componente.
     * @param {string} codigo - El código del producto.
     * @param {string} estado - El nuevo estado ('agotado' o 'disponible').
     * @param {Object} productService - La instancia del servicio de productos (debe ser inyectado).
     * @returns {boolean} True si la actualización fue exitosa, false si el servicio no fue proporcionado.
     */
    marcarLogic: function(codigo, estado, productService) {
      if (!productService) {
        console.error('productService no fue proporcionado a marcarLogic');
        return false;
      }
      productService.update(codigo, { estado });
      return true;
    }

  };
})();