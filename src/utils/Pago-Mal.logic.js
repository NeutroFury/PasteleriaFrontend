/**
 * 🧾 PagoMal.logic.js
 * Lógica pura y funciones extraídas del componente PagoMal.
 * Namespace: window.PagoMalLogic
 * 
 */

// Inicializa el namespace en window para evitar errores de redeclaración  
window.PagoMalLogic = window.PagoMalLogic || {};

/**
 * Formatea un número como moneda chilena (CLP).
 * @param {number|string} n - El número a formatear.
 * @returns {string} - El número formateado como string CLP (ej: $1.234).
 *  
 */
window.PagoMalLogic.formatCLP = function (n) {
  const number = Number(n);
  if (isNaN(number)) {
    // Devuelve un valor predeterminado si no es un número
    return "$0";
  }
  return number.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });
};

/**
 * Calcula el total de la orden sumando los subtotales de los items.
 * @param {object | null} orden - El objeto de la orden.
 * @returns {number} - El total calculado.
 *  
 */
window.PagoMalLogic.calculateTotal = function (orden) {
  if (!orden || !Array.isArray(orden.items)) {
    return 0;
  }
  // Suma los subtotales, asegurando que precio y cantidad sean números válidos
  return orden.items.reduce((s, it) => {
    const precio = Number(it.precio);
    const cantidad = Number(it.cantidad);
    // Solo suma si ambos son números válidos y cantidad > 0
    if (!isNaN(precio) && !isNaN(cantidad) && cantidad > 0) {
      return s + precio * cantidad;
    }
    return s;
  }, 0);
};

/**
 * Procesa la orden fallida desde los datos crudos (simulando localStorage).
 * Esta función valida la orden, genera códigos si faltan y ejecuta un callback de guardado.
 * Está diseñada para ser testeable, separando los efectos secundarios.
 * @param {string | null} rawStorageData - El string JSON de 'ultima_orden'.
 * @param {number} dateNow - El valor de Date.now() (para mocking de fechas).
 * @param {function} saveOrderCallback - Callback que simula orderService.saveFromUltimaOrden.
 * @returns {object} - Un objeto con { status: 'success' | 'redirect_cart', orden: (object | null) }.
 *  
 */
window.PagoMalLogic.processFailedOrder = function (rawStorageData, dateNow, saveOrderCallback) {
  try {
    const o = rawStorageData ? JSON.parse(rawStorageData) : null;

    // Valida que la orden exista y tenga items 
    if (!o || !Array.isArray(o.items) || o.items.length === 0) {
      return { status: 'redirect_cart', orden: null }; // Indica que se debe redirigir
    }

    // Genera código si no existe 
    if (!o.codigo) {
      o.codigo = `ORDER${String(dateNow).slice(-5)}`;
    }

    // Genera número de orden si no existe 
    if (!o.nro) {
      // Usa el año actual de la fecha simulada
      const year = new Date(dateNow).getFullYear();
      o.nro = `#${year}${String(dateNow).slice(-4)}`;
    }

    // Ejecutar el efecto secundario (guardado) a través del callback 
    try {
      if (saveOrderCallback && typeof saveOrderCallback === 'function') {
        saveOrderCallback("fallido");
      }
    } catch (e) {
      // Se ignora el error de guardado, como en el componente original
    }

    return { status: 'success', orden: o };

  } catch (e) {
    // Si hay error de parseo JSON u otro, redirige 
    return { status: 'redirect_cart', orden: null };
  }
};

/**
 * Maneja la acción de reintentar el pago.
 * @param {function} navigateCallback - El callback de navegación (simula 'navigate').
 */
window.PagoMalLogic.handleRetryPayment = function (navigateCallback) {
  if (navigateCallback && typeof navigateCallback === 'function') {
    navigateCallback("/checkout");
  }
};