// =================================================================
// Lógica Pura para el Componente: Admin
// Ubicación: src/utils/Admin.logic.js
// =================================================================

// Asegura que el namespace exista para evitar errores de redeclaración  
window.AdminLogic = window.AdminLogic || {};

/**
 * Formatea un número como moneda local (CLP) sin decimales.
 * @param {number | string} n - El número a formatear.
 * @returns {string} - El número formateado como moneda (ej: $1.234).
 */
window.AdminLogic.CLP = (n) => {
  // Manejo de valores nulos, indefinidos o no numéricos
  const number = Number(n);
  if (isNaN(number)) {
    // Retorna un valor predeterminado o un indicador de error
    return '$0'; 
  }
  return number.toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  });
}; 
/**
 * Actualiza las estadísticas del dashboard obteniendo datos de los servicios
 * y actualizando el estado de React a través de los setters proporcionados.
 * @param {object} services - Objeto con instancias de los services.
 * @param {object} services.orderService - Servicio de pedidos.
 * @param {object} services.productService - Servicio de productos.
 * @param {object} services.userService - Servicio de usuarios.
 * @param {object} setters - Objeto con las funciones setState de React.
 * @param {function} setters.setIsRefreshing - Setter para el estado 'isRefreshing'.
 * @param {function} setters.setStats - Setter para el estado 'stats'.
 * @param {function} setters.setLastUpdated - Setter para el estado 'lastUpdated'.
 */
window.AdminLogic.refreshStats = async (services, setters) => {
  // Extraer servicios y setters para claridad
  const { orderService, productService, userService } = services;
  const { setIsRefreshing, setStats, setLastUpdated } = setters; 

  if (!orderService || !productService || !userService || !setIsRefreshing || !setStats || !setLastUpdated) {
    console.error("AdminLogic.refreshStats: Faltan servicios o setters requeridos.");
    return;
  }

  setters.setIsRefreshing(true);

  // Pequeño delay para feedback visual 
  await new Promise(r => setTimeout(r, 150));

  try {
    // Intenta ejecutar dedupe si existe 
    if (typeof orderService.dedupe === 'function') {
      orderService.dedupe();
    }
  } catch (e) {
    console.warn("Error ejecutando orderService.dedupe():", e);
  }

  // Manejo defensivo: asegura que 'getAll' retorne un array o usa uno vacío
  const productsList = (productService.getAll && productService.getAll()) || [];
  const usersList = (userService.getAll && userService.getAll()) || [];
  const ordersList = (orderService.getAll && orderService.getAll()) || [];

  const products = productsList.length;
  const users = usersList.length;
  const orders = ordersList.length;

  // Cálculo de ingresos, asegurando que el estado sea 'pagado' y 'total' sea un número 
  const revenue = ordersList
    .filter(o => o && o.estado === 'pagado')
    .reduce((s, o) => s + (Number(o.total) || 0), 0);

  // Actualiza el estado en el componente React
  setters.setStats({ products, users, orders, revenue });
  setters.setLastUpdated(new Date());
  setters.setIsRefreshing(false);
};