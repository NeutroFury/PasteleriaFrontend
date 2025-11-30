// Servicio de usuarios: delega al backend cuando sea posible
import api from "../services/api";

let cache = null;

function seedCache() {
  if (cache && Array.isArray(cache) && cache.length) return cache;
  cache = [];
  return cache;
}

async function refreshFromBackend() {
  try {
    const data = await api.getUsers?.();
    if (Array.isArray(data)) {
      cache = data;
      console.log('✅ Usuarios cargados del backend:', data.length);
    }
  } catch (e) {
    console.warn('⚠️ No se pudieron cargar usuarios del backend:', e.message);
    // Si no hay cache previa, inicializar como array vacío
    if (!cache) cache = [];
  }
}

export const userService = {
  getAll() {
    if (!cache) seedCache();
    refreshFromBackend();
    return cache;
  },

  async reload() {
    await refreshFromBackend();
    return cache;
  },

  async getById(id) {
    if (!cache) seedCache();
    const f = cache.find((u) => String(u.id) === String(id));
    if (f) return f;
    try {
      const remote = await api.getUserById?.(id);
      if (remote) {
        cache = cache || [];
        cache.push(remote);
      }
      return remote;
    } catch (e) { return null; }
  },

  async create(user) {
    if (!user?.email) throw new Error("El usuario debe tener 'email'");
    if (!user?.nombre) throw new Error("El usuario debe tener 'nombre'");
    
    try {
      const res = await api.createUser?.(user);
      if (!res) {
        throw new Error('El backend no devolvió ningún usuario');
      }
      cache = cache || [];
      cache.push(res);
      console.log('✅ Usuario creado exitosamente:', res);
      return res;
    } catch (error) {
      console.error('❌ Error en userService.create:', error);
      throw error;
    }
  },

  async update(id, cambios) {
    const res = await api.updateUser?.(id, cambios);
    cache = cache || [];
    const idx = cache.findIndex((u) => String(u.id) === String(id));
    if (idx !== -1) cache[idx] = res;
    else cache.push(res);
    return res;
  },

  async remove(id) {
    console.log('🗑️ userService.remove - Eliminando usuario con id:', id);
    try {
      const result = await api.deleteUser?.(id);
      console.log('✅ Usuario eliminado del backend:', result);
      
      // Actualizar cache local
      cache = (cache || []).filter((u) => String(u.id) !== String(id));
      console.log('✅ Cache actualizado, usuarios restantes:', cache.length);
      
      return true;
    } catch (error) {
      console.error('❌ Error en userService.remove:', error);
      throw error;
    }
  },

  query({ search = "", estado = "", rol = "" } = {}) {
    const q = String(search).toLowerCase().trim();
    return (this.getAll() || []).filter((u) => {
      const okSearch = !q || u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const okEstado = !estado || u.estado === estado;
      const okRol = !rol || u.rol === rol;
      return okSearch && okEstado && okRol;
    });
  },

  async toggleEstado(id) {
    const u = await this.getById(id);
    if (!u) throw new Error("Usuario no encontrado");
    const nuevoEstado = u.estado === "activo" ? "inactivo" : "activo";
    return this.update(id, { estado: nuevoEstado });
  },
};

export default userService;
