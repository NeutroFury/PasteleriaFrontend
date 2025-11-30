// --------------------------------------------------
// Lógica Pura para el Componente: Ofertas
// --------------------------------------------------

// Evita la redeclaración si el script se carga varias veces  
window.OfertasLogic = window.OfertasLogic || {};

/**
 * Resuelve la ruta de una imagen, añadiendo el PUBLIC_URL si es necesario.
 * Maneja URLs absolutas (http, https) y data-uris.
 * @param {string} src - La ruta de la imagen original.
 * @returns {string} - La ruta de la imagen resuelta.
 */
window.OfertasLogic.resolveImg = function (src) {
  if (!src) return '';
  // Si ya es una URL absoluta o data URI, la retorna tal cual.
  if (/^https?:\/\//i.test(src) || /^data:/i.test(src)) return src;

  // Limpia slashes al inicio
  const s = String(src).replace(/^\/+/, '');
  // Obtiene el PUBLIC_URL y limpia slashes al final
  const prefix = (process.env.PUBLIC_URL || '').replace(/\/$/, '');

  return `${prefix}/${s}` || `/${s}`;
};

/**
 * Formatea un número como moneda Chilena (CLP) sin decimales.
 * @param {number|string} n - El número a formatear.
 * @returns {string} - El número formateado como CLP (ej: $1.234).
 */
window.OfertasLogic.CLP = function (n) {
  var num = Number(n);
  // Maneja NaN, null, undefined
  if (isNaN(num) || n == null) {
    return '$0';
  }
  return num.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });
};

/**
 * Calcula el precio final de un producto aplicando un descuento.
 * @param {object} p - El producto (debe tener .precio y .descuento).
 * @returns {number} - El precio con el descuento aplicado.
 */
window.OfertasLogic.precioConDescuento = function (p) {
  if (!p) return 0;
  const base = Number(p.precio) || 0;
  const d = Number(p.descuento) || 0;
  // Retorna el precio base si el descuento es 0 o negativo
  return d > 0 ? Math.round(base * (1 - d / 100)) : base;
};

/**
 * Lógica para agregar un producto al carrito (LEGACY - no usar).
 * Esta función es solo para retrocompatibilidad con tests antiguos.
 * Los componentes modernos deben usar api.addToCartByProductId() directamente.
 * @deprecated Usar api.addToCartByProductId() en su lugar
 * @param {*} codigoOrProduct - El código o producto.
 * @param {Array} ofertas - El listado actual de ofertas.
 * @returns {string} - Código de resultado para testing.
 */
window.OfertasLogic.agregarAlCarrito = function (codigoOrProduct, ofertas) {
  console.warn('⚠️ agregarAlCarrito es legacy - usar api.addToCartByProductId()');
  return 'legacy_method_deprecated';
};