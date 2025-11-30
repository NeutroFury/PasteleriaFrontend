/* ================================================================== */
/* Lógica Pura para el Componente Carrito                             */
/* (Generado automáticamente para Jasmine + Karma)                    */
/* ================================================================== */
/*   */

// Asignar al objeto window para ser accesible por los tests y el componente  
window.CarritoLogic = {

  /**
   * Resuelve la URL de una imagen, prefijando PUBLIC_URL si es necesario.
   *  
   * @param {string} src - La ruta de la imagen desde los datos.
   * @param {string} publicUrl - El valor de process.env.PUBLIC_URL.
   * @returns {string} - La ruta completa y resuelta de la imagen.
   */
  resolveImg: function (src, publicUrl) {
    if (!src) return '';
    if (/^https?:\/\//i.test(src) || /^data:/i.test(src)) return src;
    const s = String(src).replace(/^\/+/, '');
    const prefix = (publicUrl || '').replace(/\/$/, '');
    return `${prefix}/${s}` || `/${s}`;
  },

  /**
   * Formatea un número como moneda chilena (CLP) sin decimales.
   *  
   * @param {number|string} n - El número a formatear.
   * @returns {string} - El número formateado como string (ej: "$ 1.000").
   */
  CLP: function (n) {
    return Number(n).toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    });
  },

  /**
   * Calcula el precio final de un producto aplicando un descuento si existe.
   *  
   * @param {object} p - El producto (debe tener .precio y .descuento).
   * @returns {number} - El precio final redondeado.
   */
  precioConDescuento: function (p) {
    if (!p) return 0;
    const base = Number(p.precio) || 0;
    const d = Number(p.descuento) || 0;
    return d > 0 ? Math.round(base * (1 - d / 100)) : base;
  },

  /**
   * Calcula el subtotal de un item del carrito (precio * cantidad).
   *  
   * @param {object} it - El item del carrito (debe tener .precio y .cantidad).
   * @returns {number} - El subtotal.
   */
  calcularSubtotal: function (it) {
    if (!it) return 0;
    return (Number(it.precio) || 0) * (Number(it.cantidad) || 1);
  },

  /**
   * Calcula el monto total del carrito sumando subtotales.
   *  
   * @param {Array} carrito - El array de items del carrito.
   * @returns {number} - El total.
   */
  calcularTotal: function (carrito) {
    if (!Array.isArray(carrito)) return 0;
    return carrito.reduce(
      (sum, it) => sum + (Number(it.precio) || 0) * (Number(it.cantidad) || 1),
      0
    );
  },

  /**
   * Lógica para incrementar la cantidad de un item (máx 5).
   * Devuelve un nuevo array de carrito.
   *  
   * @param {Array} carrito - El estado actual del carrito.
   * @param {string} codigo - El código del producto a incrementar.
   * @returns {Array} - El nuevo estado del carrito.
   */
  logic_incrementar: function (carrito, codigo) {
    if (!Array.isArray(carrito)) return [];
    return carrito.map((it) =>
      it.codigo === codigo && (Number(it.cantidad) || 1) < 5
        ? { ...it, cantidad: (Number(it.cantidad) || 1) + 1 }
        : it
    );
  },

  /**
   * Lógica para decrementar la cantidad de un item (mín 1).
   * Devuelve un nuevo array de carrito.
   *  
   * @param {Array} carrito - El estado actual del carrito.
   * @param {string} codigo - El código del producto a decrementar.
   * @returns {Array} - El nuevo estado del carrito.
   */
  logic_decrementar: function (carrito, codigo) {
    if (!Array.isArray(carrito)) return [];
    // Se mantiene la lógica original del componente: Math.max(1, ...)
    return carrito
      .map((it) =>
        it.codigo === codigo
          ? { ...it, cantidad: Math.max(1, (Number(it.cantidad) || 1) - 1) }
          : it
      )
      .filter((it) => (Number(it.cantidad) || 1) > 0);
  },

  /**
   * Lógica para eliminar un item del carrito por su código.
   * Devuelve un nuevo array de carrito.
   *  
   * @param {Array} carrito - El estado actual del carrito.
   * @param {string} codigo - El código del producto a eliminar.
   * @returns {Array} - El nuevo estado del carrito.
   */
  logic_eliminar: function (carrito, codigo) {
    if (!Array.isArray(carrito)) return [];
    return carrito.filter((it) => it.codigo !== codigo);
  },

  /**
   * Lógica para limpiar el carrito.
   * Devuelve un array vacío.
   *  
   * @returns {Array} - Array vacío.
   */
  logic_limpiar: function () {
    return [];
  },

  /**
   * Lógica para agregar un producto desde el listado al carrito.
   * Si ya existe, incrementa cantidad (máx 5). Si no, lo añade.
   * Actualiza el precio si ha cambiado (ej. por descuento).
   * Devuelve un nuevo array de carrito.
   *  
   * @param {Array} carrito - El estado actual del carrito.
   * @param {object} p - El producto a agregar (del catálogo).
   * @param {function} precioConDescuentoFn - La función para calcular el precio (se pasa por inyección).
   * @returns {Array} - El nuevo estado del carrito.
   */
  logic_agregarDesdeListado: function (carrito, p, precioConDescuentoFn) {
    if (!p || !p.codigo) return Array.isArray(carrito) ? carrito : [];
    
    let nuevo = Array.isArray(carrito) ? [...carrito] : [];
    const existe = nuevo.find((x) => x.codigo === p.codigo);
    
    // Usar la función de precio proveída
    const pf = precioConDescuentoFn(p);

    if (existe) {
      if ((Number(existe.cantidad) || 1) >= 5) return nuevo; // No hacer nada si ya está al máximo
      
      // Asegurar precio vigente
      if (Number(existe.precio) !== pf) {
        existe.precio = pf;
      }
      existe.cantidad = (Number(existe.cantidad) || 1) + 1;
    } else {
      nuevo.push({
        codigo: p.codigo,
        nombre: p.nombre,
        precio: pf,
        img: p.img,
        categoria: p.categoria,
        cantidad: 1,
      });
    }
    return nuevo;
  }
};