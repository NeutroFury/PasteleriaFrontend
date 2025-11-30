// =================================================================
// Lógica Pura para el Componente: Productos
// Ubicación: /src/utils/Productos.logic.js
// =================================================================

// Se ancla al objeto window para disponibilidad global en la app y en las pruebas (Karma/Jasmine)
window.ProductosLogic = {
  /**
   * Resuelve la ruta de una imagen, prefijándola con la PUBLIC_URL si es relativa.
   * Maneja URLs absolutas, data-URIs y rutas relativas.
   * @param {string} src - La ruta de la imagen original.
   * @param {string} publicUrl - El valor de process.env.PUBLIC_URL.
   * @returns {string} La ruta de la imagen resuelta.
   */

  resolveImg: function (src, publicUrl) {
    if (!src) return '';
    // Si ya es una URL absoluta (http, https) o un data URI (data:), no hacer nada.
    if (/^https?:\/\//i.test(src) || /^data:/i.test(src)) return src;

    // Limpia barras inclinadas al inicio de la ruta relativa
    const s = String(src).replace(/^\/+/, '');
    // Limpia barras inclinadas al final de la PUBLIC_URL
    const prefix = (publicUrl || '').replace(/\/$/, '');
    
    return `${prefix}/${s}` || `/${s}`;
  },

  /**
   * Formatea un número como moneda chilena (CLP).
   * @param {number} n - El número a formatear.
   * @returns {string} El número formateado como CLP (ej: $10.000).
   */
  CLP: function (n) {
    const num = Number(n) || 0;
    return num.toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    });
  },

  /**
   * Calcula el precio final de un producto aplicando un descuento (si existe).
   * @param {object} p - El objeto producto, debe tener { precio: number, descuento: number }.
   * @returns {number} El precio final (base o con descuento aplicado).
   */
  precioConDescuento: function (p) {
    if (!p) return 0;
    const base = Number(p.precio) || 0;
    const d = Number(p.descuento) || 0;
    // Si el descuento es > 0, aplica el cálculo; de lo contrario, devuelve el precio base.
    return d > 0 ? Math.round(base * (1 - d / 100)) : base;
  },

  /**
   * Lógica para agregar un producto al carrito (LEGACY - no usar).
   * Esta función es solo para retrocompatibilidad con tests antiguos.
   * Los componentes modernos deben usar api.addToCartByProductId() directamente.
   * @deprecated Usar api.addToCartByProductId() en su lugar
   * @param {string} codigo - El código del producto a agregar.
   * @param {Array} productos - El listado completo de productos.
   */
  agregarAlCarrito: function (codigo, productos) {
    console.warn('⚠️ agregarAlCarrito es legacy - usar api.addToCartByProductId()');
    return 'legacy_method_deprecated';
  }
};