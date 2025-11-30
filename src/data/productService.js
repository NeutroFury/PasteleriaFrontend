// Servicio de productos con cache en memoria y sincronización con backend
// NO usa localStorage - todo se obtiene del backend
// Fuente inicial: src/data/catalogo.js

import catalogo from "./catalogo";
import api from "../services/api";
import { createProduct, updateProduct, deleteProduct } from "../services/productService";

// Este service reemplaza la persistencia en localStorage por una cache en memoria
// que se sincroniza automáticamente con el backend mediante refreshFromBackend().
// y sincroniza en background con el backend. Mantiene la API sincrónica
// para no romper componentes que usan productService.getAll() directamente.

let cache = null;

function mapBackendToFrontend(p) {
  if (!p) return null;
  
  // Normalizar categoría - SIEMPRE debe ser un string simple
  let categoria = 'Otros';
  if (p.categoria) {
    if (typeof p.categoria === 'string') {
      categoria = p.categoria;
    } else if (typeof p.categoria === 'object' && p.categoria !== null) {
      // Si viene como objeto del backend, extraer solo el nombre
      categoria = p.categoria.nombre || p.categoria.name || 'Sin categoría';
    }
  } else if (p.category) {
    // Manejar nombre alternativo
    if (typeof p.category === 'string') {
      categoria = p.category;
    } else if (typeof p.category === 'object' && p.category !== null) {
      categoria = p.category.nombre || p.category.name || 'Sin categoría';
    }
  }
  
  // Asegurar que el ID sea un número válido (el backend requiere Long)
  const numericId = p.id ? (typeof p.id === 'number' ? p.id : parseInt(p.id, 10)) : null;
  
  return {
    id: numericId,
    codigo: p.codigo ?? (numericId ? String(numericId) : ""),
    categoria: categoria,
    nombre: p.nombre || p.name || p.codigo || 'Sin nombre',
    precio: Number(p.precio ?? p.price ?? 0),
    descripcion: p.descripcion || p.description || '',
    img: p.img || p.image || p.imagenUrl || '',
    descuento: Number(p.descuento ?? p.discount ?? 0),
    stock: Number(p.stock ?? 0),
    estado: p.estado || (Number(p.stock ?? 0) > 0 ? 'disponible' : 'agotado'),
    productId: numericId, // Agregar también productId por compatibilidad
    raw: p,
  };
}

function seedCache() {
  if (cache && Array.isArray(cache) && cache.length) return cache;
  cache = (catalogo || []).map((p) => ({
    codigo: p.codigo,
    categoria: p.categoria,
    nombre: p.nombre,
    precio: Number(p.precio) || 0,
    descripcion: p.descripcion || "",
    img: p.img || "",
    descuento: p.descuento ?? 0,
    stock: 10,
    estado: "disponible",
  }));
  return cache;
}

async function refreshFromBackend() {
  try {
    let data = await api.getProducts();
    // Aceptar distintas formas de respuesta: array directo o objetos con 'content' / 'data' / 'products'
    let arr = null;
    if (Array.isArray(data)) arr = data;
    else if (!data) arr = null;
    else if (Array.isArray(data.content)) arr = data.content;
    else if (Array.isArray(data.data)) arr = data.data;
    else if (Array.isArray(data.products)) arr = data.products;
    else if (data._embedded && typeof data._embedded === 'object') {
      const k = Object.keys(data._embedded).find((x) => Array.isArray(data._embedded[x]));
      if (k) arr = data._embedded[k];
    }
    if (!Array.isArray(arr)) return;
    const mapped = arr.map(mapBackendToFrontend);
    
    // Solo actualizar caché y disparar evento si hay cambios reales
    const hasChanges = !cache || cache.length !== mapped.length;
    cache = mapped;
    
    // Solo disparar evento si hubo cambios (evita bucles innecesarios)
    if (hasChanges) {
      try { window.dispatchEvent(new Event('productos-updated')); } catch (e) {}
    }
  } catch (e) {
    // Silencioso: si no hay backend disponible, dejamos la cache (semilla)
    // console.warn('No se pudo sincronizar productos con backend:', e);
  }
}

export const productService = {
  // Retorna la lista actual (sincrónica). NO sincroniza automáticamente.
  getAll() {
    if (!cache) seedCache();
    return cache;
  },

  // Fuerza recarga desde backend y retorna la promesa con la lista actualizada
  async reload() {
    await refreshFromBackend();
    return cache;
  },

  // Busca en cache; si no existe intenta obtener del backend por id/codigo
  async getById(codigo) {
    if (!cache) seedCache();
    const found = cache.find((x) => String(x.codigo) === String(codigo) || String(x.id) === String(codigo));
    if (found) return found;
    // intentar backend por id
    try {
      const remote = await api.getProductById(codigo);
      const mapped = mapBackendToFrontend(remote);
      if (mapped) {
        cache = cache || [];
        // Reemplazar o añadir
        const idx = cache.findIndex((x) => String(x.codigo) === String(mapped.codigo) || String(x.id) === String(mapped.id));
        if (idx === -1) cache.push(mapped);
        else cache[idx] = mapped;
        try { window.dispatchEvent(new Event('productos-updated')); } catch (e) {}
      }
      return mapped;
    } catch (e) {
      return null;
    }
  },

  // Crea en backend y actualiza cache con la respuesta
  async create(producto) {
    // validar mínimamente
    if (!producto) throw new Error('Producto inválido');
    // mapear al payload esperado por el backend y delegar
    try {
      const res = await createProduct(producto);
      const mapped = mapBackendToFrontend(res || producto);
      cache = cache || [];
      cache.push(mapped);
      try { window.dispatchEvent(new Event('productos-updated')); } catch (e) {}
      return mapped;
    } catch (e) {
      // Propagar error para que la UI lo muestre
      throw e;
    }
  },

  // Actualiza en backend y en cache
  async update(codigo, cambios) {
    if (!codigo) throw new Error('Falta codigo para actualizar');
    // Intentar localizar id en cache
    if (!cache) seedCache();
    const idx = cache.findIndex((x) => String(x.codigo) === String(codigo) || String(x.id) === String(codigo));
    const target = idx !== -1 ? cache[idx] : null;
    
    if (!target) {
      throw new Error('Producto no encontrado en cache');
    }
    
    const id = target?.id || codigo;
    
    // Normalizar la categoría - SIEMPRE debe ser un string simple
    let categoriaNormalizada = '';
    const cat = cambios.categoria !== undefined ? cambios.categoria : target.categoria;
    if (cat) {
      if (typeof cat === 'string') {
        categoriaNormalizada = cat;
      } else if (typeof cat === 'object' && cat !== null) {
        // Si viene como objeto, extraer solo el nombre
        categoriaNormalizada = cat.nombre || cat.name || '';
      }
    }
    
    // Construir el payload completo del producto con categoría normalizada
    const payload = {
      ...target,
      ...cambios,
      categoria: categoriaNormalizada
    };
    
    try {
      const res = await updateProduct(id, payload);
      const mapped = mapBackendToFrontend(res || payload);
      if (idx !== -1) cache[idx] = mapped;
      else cache.push(mapped);
      try { window.dispatchEvent(new Event('productos-updated')); } catch (e) {}
      return mapped;
    } catch (e) {
      console.error('Error actualizando producto:', e);
      throw e;
    }
  },

  // Elimina en backend y en cache
  async remove(codigo) {
    if (!codigo) return false;
    if (!cache) seedCache();
    const idx = cache.findIndex((x) => String(x.codigo) === String(codigo) || String(x.id) === String(codigo));
    const target = idx !== -1 ? cache[idx] : null;
    const id = target?.id || codigo;
    try {
      await deleteProduct(id);
      if (idx !== -1) cache.splice(idx, 1);
      try { window.dispatchEvent(new Event('productos-updated')); } catch (e) {}
      return true;
    } catch (e) {
      // No realizar eliminación local como fallback: propagar error para que la UI lo maneje
      throw e;
    }
  },

  // Filtrado simple sobre la cache (sincrónico)
  query({ search = "", category = "", status = "" } = {}) {
    const q = String(search).toLowerCase().trim();
    const items = this.getAll();
    return items.filter((p) => {
      const okSearch = !q ||
        String(p.codigo || '').toLowerCase().includes(q) ||
        String(p.nombre || '').toLowerCase().includes(q) ||
        String(p.descripcion || '').toLowerCase().includes(q);
      const okCategory = !category || p.categoria === category;
      const okStatus = !status || p.estado === status;
      return okSearch && okCategory && okStatus;
    });
  },
};

export default productService;
