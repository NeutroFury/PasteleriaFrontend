// Servicio HTTP simple para comunicar el frontend con el backend
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080/api';

function getToken() {
  return localStorage.getItem('token') || null;
}

function setToken(t) {
  if (t) localStorage.setItem('token', t);
  else localStorage.removeItem('token');
}

async function request(method, path, body, auth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const tk = getToken();
    if (tk) headers['Authorization'] = `Bearer ${tk}`;
  }
  
  console.log(`🔵 Request: ${method} ${API_BASE}${path}`);
  
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  
  console.log(`🔵 Response status: ${res.status}`);
  
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error(`❌ Error response:`, text);
    
    // Intentar parsear como JSON
    let errorData;
    try {
      errorData = JSON.parse(text);
    } catch {
      errorData = { message: text || res.statusText };
    }
    
    const msg = errorData.message || text || res.statusText || 'Error desconocido';
    const err = new Error(msg);
    err.status = res.status;
    err.data = errorData;
    throw err;
  }
  if (res.status === 204) return null;
  
  // Intentar parsear la respuesta
  const text = await res.text();
  console.log('🔵 Response body (primeros 500 chars):', text.substring(0, 500));
  
  if (!text || text.trim() === '') {
    console.warn('⚠️ Respuesta vacía del servidor');
    return null;
  }
  
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('❌ Error parseando JSON:', err.message);
    
    // Si la petición fue POST a carrito/anadir, considerarlo exitoso aunque el JSON esté mal
    if (path.includes('/carrito/anadir') && method === 'POST') {
      console.warn('⚠️ JSON inválido pero petición al carrito fue exitosa (200)');
      return { success: true }; // Retornar algo para indicar éxito
    }
    
    // Para otros endpoints, retornar null
    return null;
  }
}

const api = {
  setToken,
  getToken,

  // Auth
  async login(email, password) {
    // El backend espera 'username' y 'password'
    const data = await request('POST', '/v1/auth/login', { 
      username: email,  // Cambiado de 'email' a 'username'
      password 
    }, false);
    if (data?.token) setToken(data.token);
    return data;
  },

  async register(payload) {
    return request('POST', '/v1/auth/registro', payload, false);
  },

  async me() {
    return request('GET', '/v1/auth/me', undefined, true);
  },

  // Products
  async getProducts() {
    return request('GET', '/productos', undefined, false);
  },

  async getProductById(id) {
    return request('GET', `/productos/${id}`, undefined, false);
  },

  async createProduct(payload) {
    return request('POST', '/productos', payload, true);
  },

  async updateProduct(id, payload) {
    return request('PUT', `/productos/${id}`, payload, true);
  },

  async deleteProduct(id) {
    return request('DELETE', `/productos/${id}`, undefined, true);
  },

  // Cart
  async getCart() {
    return request('GET', '/v1/carrito', undefined, true);
  },

  async addToCartByProductId(productId, qty = 1) {
    console.log('🔵 addToCartByProductId llamado con:', { productId, qty, tipo: typeof productId });
    const path = `/v1/carrito/anadir?productId=${encodeURIComponent(productId)}&qty=${encodeURIComponent(qty)}`;
    console.log('🔵 Path completo:', path);
    return request('POST', path, undefined, true);
  },

  async removeFromCartByProductId(productId) {
    const path = `/v1/carrito/remover?productId=${encodeURIComponent(productId)}`;
    return request('DELETE', path, undefined, true);
  },

  async clearCart() {
    return request('DELETE', '/v1/carrito/limpiar', undefined, true);
  },

  // Orders
  async checkout() {
    return request('POST', '/v1/ordenes/checkout', undefined, true);
  },

  async getOrders() {
    return request('GET', '/v1/ordenes', undefined, true);
  },

  async getOrderById(id) {
    return request('GET', `/v1/ordenes/${id}`, undefined, true);
  },

  async createOrder(payload) {
    return request('POST', '/v1/ordenes', payload, true);
  },

  async updateOrder(id, payload) {
    return request('PUT', `/v1/ordenes/${id}`, payload, true);
  },

  async deleteOrder(id) {
    return request('DELETE', `/v1/ordenes/${id}`, undefined, true);
  },

  // Optional user endpoints (if backend exposes them)
  async getUsers() {
    return request('GET', '/v1/auth/usuarios', undefined, true);
  },

  async getUserById(id) {
    return request('GET', `/v1/auth/usuarios/${id}`, undefined, true);
  },

  async createUser(payload) {
    // Mapear los campos del frontend a los del backend
    const backendPayload = {
      nombreUsuario: payload.email, // Usar el email como nombreUsuario
      contrasena: payload.password,
      nombre: payload.nombre,
      email: payload.email,
      telefono: payload.telefono || '',
      rol: payload.rol || 'cliente',
      estado: payload.estado || 'activo'
    };
    
    console.log('🔵 Creando usuario con datos:', backendPayload);
    return request('POST', '/v1/auth/admin/usuarios', backendPayload, true);
  },

  async updateUser(id, payload) {
    // Mapear los campos del frontend a los del backend
    const backendPayload = {
      nombreUsuario: payload.email || payload.nombreUsuario,
      nombre: payload.nombre,
      email: payload.email,
      telefono: payload.telefono || '',
      rol: payload.rol,
      estado: payload.estado
    };
    
    // Solo incluir contraseña si se proporcionó una nueva
    if (payload.password && payload.password.trim() !== '') {
      backendPayload.contrasena = payload.password;
    }
    
    console.log('🔵 Actualizando usuario con datos:', backendPayload);
    // Usar el endpoint de admin para editar usuarios
    return request('PUT', `/v1/auth/admin/usuarios/${id}`, backendPayload, true);
  },

  async deleteUser(id) {
    console.log('🔵 Eliminando usuario con id:', id);
    // Usar el endpoint de admin para eliminar usuarios
    return request('DELETE', `/v1/auth/admin/usuarios/${id}`, undefined, true);
  },
};

export default api;
