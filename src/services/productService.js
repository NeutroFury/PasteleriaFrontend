// src/services/productService.js
import axios from "axios";
import api from "./api";

// Base URL del backend; usa la variable de entorno si existe (ej: REACT_APP_API_BASE)
// Por defecto apunta a Laragon: http://localhost:8080/api
const API_ROOT = process.env.REACT_APP_API_BASE || "http://localhost:8080/api";
const API_BASE = `${API_ROOT}/productos`;
/**
* Obtiene todos los productos desde el backend (GET)
*/
export async function getProducts() {
	const res = await axios.get(API_BASE);
	const data = res.data;
	const contentType = (res.headers && (res.headers['content-type'] || res.headers['Content-Type'])) || '';
	// Si el backend respondió HTML (p. ej. la página Swagger UI) avisamos claramente
	if (typeof contentType === 'string' && contentType.includes('text/html')) {
		console.error('productService.getProducts: la URL configurada apunta a una página HTML (p.ej. Swagger UI):', API_BASE);
		throw new Error('La URL de la API devuelve HTML (Swagger UI). Ajusta `API_BASE` al endpoint REST que devuelve JSON.');
	}

		// Normalizar diversas formas de respuesta comunes y devolver siempre un array
		let arr = null;
		if (Array.isArray(data)) arr = data;
		else if (!data) arr = [];
		else if (Array.isArray(data.content)) arr = data.content;
		else if (Array.isArray(data.data)) arr = data.data;
		else if (Array.isArray(data.products)) arr = data.products;
		else if (Array.isArray(data.items)) arr = data.items;
		else if (Array.isArray(data.results)) arr = data.results;
		else if (data._embedded && typeof data._embedded === 'object') {
			const k = Object.keys(data._embedded).find((x) => Array.isArray(data._embedded[x]));
			if (k) arr = data._embedded[k];
		}
		// Buscar la primera propiedad que sea un array
		if (!arr && typeof data === 'object') {
			arr = Object.values(data).find((v) => Array.isArray(v));
		}

		if (!Array.isArray(arr)) {
			console.warn('productService.getProducts: respuesta inesperada del endpoint:', data);
			throw new Error('Respuesta inesperada del endpoint de productos. Revisa la API o ajusta `API_BASE`.');
		}

		// Mapear la forma del backend (spanish fields) a la forma esperada por el frontend
		const mapped = arr.map((p) => ({
			id: p.id,
			name: p.nombre || p.name || p.codigo || '',
			price: (p.precio ?? p.price) || 0,
			category:
				(p.categoria && (p.categoria.nombre || p.categoria.name)) || p.categoria || p.category || '',
			img: p.imagenUrl || p.img || p.image || '',
			codigo: p.codigo || null,
			raw: p,
		}));
		return mapped;
}
/**
* Crea un nuevo producto (POST)
*/
export async function createProduct(product) {
	try {
		const token = api.getToken();
		const headers = token ? { Authorization: `Bearer ${token}` } : {};
		
		// Mapear campos del frontend (español e inglés mixto) al backend (español)
		const payload = {
			nombre: product.nombre || product.name || '',
			precio: product.precio !== undefined ? product.precio : product.price,
			descripcion: product.descripcion || product.description || "",
			codigo: product.codigo || undefined,
			imagenUrl: product.img || product.image || product.imagenUrl || undefined,
			descuento: product.descuento !== undefined ? product.descuento : (product.discount || 0),
			stock: product.stock !== undefined ? product.stock : 0,
			estado: product.estado || product.status || 'disponible',
			// categoria: solo enviar el ID de la categoría existente
			categoria: (() => {
				const cat = product.categoria || product.category;
				if (!cat) return undefined;
				// Si ya tiene un ID, enviarlo directamente
				if (typeof cat === 'object' && cat !== null && cat.id) {
					return { id: cat.id };
				}
				// Si es un string, necesitamos buscar el ID - por ahora retornamos null
				// El backend debería rechazar esto, pero es mejor que enviar objeto sin ID
				console.warn('⚠️ Categoría sin ID, el backend puede rechazar esto:', cat);
				return undefined;
			})()
		};
		
		const res = await axios.post(API_BASE, payload, { headers });
		return res.data;
	} catch (err) {
		if (err.response && err.response.status === 403) throw new Error('Acceso denegado: necesitas permisos de administrador');
		throw err;
	}
}
/**
* Actualiza un producto existente (PUT)
*/
export async function updateProduct(id, product) {
	try {
		const token = api.getToken();
		const headers = token ? { Authorization: `Bearer ${token}` } : {};
		
		console.log('🔧 updateProduct - ID:', id);
		console.log('🔧 updateProduct - Product recibido:', product);
		
		// Mapear campos del frontend (español e inglés mixto) al backend (español)
		const payload = {
			nombre: product.nombre || product.name || '',
			precio: product.precio !== undefined ? product.precio : product.price,
			descripcion: product.descripcion || product.description || "",
			codigo: product.codigo || undefined,
			imagenUrl: product.img || product.image || product.imagenUrl || undefined,
			descuento: product.descuento !== undefined ? product.descuento : (product.discount || 0),
			stock: product.stock !== undefined ? product.stock : 0,
			estado: product.estado || product.status || 'disponible',
			// categoria: el backend espera el ID de la categoría, no el objeto completo
			// Si la categoría es un objeto con id, enviar solo el id
			// Si es un string, intentar encontrar el id o enviarlo como null
			categoria: (() => {
				const cat = product.categoria || product.category;
				if (!cat) return null;
				
				// Si es un objeto con id, enviar el objeto con solo el id
				if (typeof cat === 'object' && cat !== null && cat.id) {
					return { id: cat.id };
				}
				
				// Si es un string, no podemos enviar la categoría porque no tenemos el ID
				// El backend necesita el ID, así que dejamos null
				console.warn('⚠️ Categoría es un string sin ID, enviando null. El backend necesita el ID de la categoría.');
				return null;
			})()
		};
		
		console.log('📤 updateProduct - Payload a enviar:', payload);
		console.log('📤 updateProduct - URL:', `${API_BASE}/${id}`);
		
		const res = await axios.put(`${API_BASE}/${id}`, payload, { headers });
		
		console.log('✅ updateProduct - Respuesta:', res.data);
		return res.data;
	} catch (err) {
		console.error('❌ updateProduct - Error:', err);
		console.error('❌ updateProduct - Error response:', err.response?.data);
		console.error('❌ updateProduct - Error status:', err.response?.status);
		
		if (err.response && err.response.status === 403) throw new Error('Acceso denegado: necesitas permisos de administrador');
		if (err.response && err.response.status === 400) {
			const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Datos inválidos';
			throw new Error(`Error 400: ${errorMsg}`);
		}
		throw err;
	}
}
/**
* Elimina un producto por su ID (DELETE)
*/
export async function deleteProduct(id) {
	try {
		const token = api.getToken();
		const headers = token ? { Authorization: `Bearer ${token}` } : {};
		await axios.delete(`${API_BASE}/${id}`, { headers });
	} catch (err) {
		if (err.response && err.response.status === 403) throw new Error('Acceso denegado: necesitas permisos de administrador');
		throw err;
	}
}