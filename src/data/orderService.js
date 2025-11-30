// Servicio de órdenes: delega al backend (no usa localStorage)
import api from "../services/api";

let cache = null;

function seedCache() {
  if (cache && Array.isArray(cache) && cache.length) return cache;
  cache = [];
  return cache;
}

async function refreshFromBackend() {
  try {
    const data = await api.getOrders();
    if (Array.isArray(data)) {
      // Normalizar las órdenes para asegurar que tengan fecha válida
      cache = data.map(orden => ({
        ...orden,
        fecha: orden.fecha || orden.createdAt || orden.created_at || new Date().toISOString()
      }));
      console.log('✅ Órdenes cargadas del backend:', cache.length);
    }
  } catch (e) {
    console.warn('⚠️ No se pudieron cargar órdenes del backend:', e.message);
    // Si no hay cache previa, inicializar como array vacío
    if (!cache) cache = [];
  }
}

export const orderService = {
  getAll() {
    if (!cache) seedCache();
    refreshFromBackend();
    return cache;
  },

  async reload() {
    await refreshFromBackend();
    return cache;
  },

  async create(order) {
    const res = await api.createOrder(order);
    // actualizar cache
    cache = cache || [];
    cache.unshift(res);
    return res;
  },

  async getById(id) {
    if (!cache) seedCache();
    const found = cache.find((o) => String(o.id) === String(id));
    if (found) return found;
    try {
      const remote = await api.getOrderById(id);
      if (remote) {
        cache = cache || [];
        cache.push(remote);
      }
      return remote;
    } catch (e) {
      return null;
    }
  },

  async update(id, cambios) {
    const res = await api.updateOrder(id, cambios);
    // sincronizar cache
    cache = cache || [];
    const idx = cache.findIndex((o) => String(o.id) === String(id));
    if (idx !== -1) cache[idx] = res;
    else cache.push(res);
    return res;
  },

  async remove(id) {
    await api.deleteOrder(id);
    cache = (cache || []).filter((o) => String(o.id) !== String(id));
    return true;
  },

  // operaciones auxiliares mantenidas como wrappers
  async saveFromUltimaOrden(estado = "pagado") {
    // En el backend se espera que exista un endpoint para crear órdenes desde la sesión
    // Si la app guarda la "ultima_orden" en otro lugar, esta función deberá adaptarse.
    // Por ahora devolvemos null para indicar que la operación no está soportada sin info.
    return null;
  },

  dedupe() {
    // Operación no aplicable en backend; noop
    return { before: (cache || []).length, after: (cache || []).length, removed: 0 };
  },
};

export default orderService;
