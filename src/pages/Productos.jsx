import { useState, useEffect } from "react";
import productService from "../data/productService";
import api from "../services/api";
import "../utils/Productos.logic.js";

export default function Productos() {
  const resolveImg = (src) => window.ProductosLogic.resolveImg(src, process.env.PUBLIC_URL);
  const [productos, setProductos] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");

  // Cargar productos desde servicio (usa cache + backend)
  useEffect(() => {
    const load = async () => {
      // Forzar recarga desde backend para asegurar que tenemos los IDs
      const productos = await productService.reload();
      setProductos(productos);
    };
    load();
    
    const onUpdated = () => {
      // Cuando hay cambios, actualizar desde la caché (ya sincronizada)
      setProductos(productService.getAll());
    };
    window.addEventListener('productos-updated', onUpdated);
    return () => {
      window.removeEventListener('productos-updated', onUpdated);
    };
  }, []);

  const CLP = (n) => window.ProductosLogic.CLP(n);
  const precioConDescuento = (p) => window.ProductosLogic.precioConDescuento(p);
  
  const agregarAlCarrito = async (p) => {
    const token = api.getToken();
    
    if (!token) {
      alert('⚠️ Debes iniciar sesión para agregar productos');
      window.location.href = '/login';
      return;
    }

    try {
      console.log('🛒 Producto seleccionado:', p);
      console.log('🛒 ID del producto:', p.id, 'tipo:', typeof p.id);
      console.log('🛒 Código del producto:', p.codigo);
      
      // El backend REQUIERE un Long (número entero)
      // Asegurarse de que el ID sea numérico
      let productId = p.id;
      
      if (!productId) {
        console.error('❌ El producto no tiene ID numérico:', p);
        throw new Error('El producto no tiene un ID válido. Recarga la página.');
      }
      
      // Convertir a número si es string
      if (typeof productId === 'string') {
        productId = parseInt(productId, 10);
      }
      
      // Validar que sea un número válido
      if (isNaN(productId) || productId <= 0) {
        console.error('❌ ID de producto inválido:', productId);
        throw new Error('ID de producto inválido');
      }
      
      console.log('🛒 Agregando al carrito con productId:', productId, 'tipo:', typeof productId);
      
      try {
        await api.addToCartByProductId(productId, 1);
      } catch (parseError) {
        // Si hay error de parseo pero la petición fue exitosa (200), ignorarlo
        if (parseError.message?.includes('JSON') || parseError.message?.includes('parse')) {
          console.warn('⚠️ Error parseando respuesta pero petición exitosa');
        } else {
          throw parseError;
        }
      }
      
      // Forzar recarga del carrito desde el backend
      console.log('🔄 Recargando carrito...');
      window.dispatchEvent(new Event('carrito-changed'));
      alert(`✅ ${p.nombre} agregado al carrito`);
    } catch (err) {
      console.error('❌ Error completo:', err);
      console.error('❌ Status:', err.status);
      console.error('❌ Message:', err.message);
      console.error('❌ Data:', err.data);
      
      // Mostrar mensaje de error más específico
      let errorMsg = '❌ No se pudo agregar al carrito';
      if (err.message) {
        errorMsg += ': ' + err.message;
      }
      if (err.status === 404) {
        errorMsg = '❌ Producto no encontrado en el servidor';
      } else if (err.status === 401) {
        errorMsg = '❌ Tu sesión ha expirado. Por favor, inicia sesión nuevamente';
        setTimeout(() => window.location.href = '/login', 1500);
      } else if (err.status === 400) {
        errorMsg = '❌ Datos incorrectos. Verifica que el producto sea válido.';
      }
      
      alert(errorMsg);
    }
  };

  // Obtener categorías únicas - manejar si categoria es objeto o string
  const categorias = ["Todas", ...new Set((productos || []).map(p => {
    // Si categoria es un objeto, extraer el nombre
    if (typeof p.categoria === 'object' && p.categoria !== null) {
      return p.categoria.nombre || p.categoria.name || 'Sin categoría';
    }
    // Si es string, usarlo directamente
    return p.categoria || 'Sin categoría';
  }))];

  // Filtrar productos por categoría
  const productosFiltrados = categoriaSeleccionada === "Todas" 
    ? productos 
    : productos.filter(p => {
        const catName = typeof p.categoria === 'object' && p.categoria !== null
          ? (p.categoria.nombre || p.categoria.name || 'Sin categoría')
          : (p.categoria || 'Sin categoría');
        return catName === categoriaSeleccionada;
      });

  return (
    <main>
      <h1
        style={{
          textAlign: "center",
          margin: "1.5rem 0",
          color: "#7c3a2d",
          fontFamily: '"Pacifico", cursive',
        }}
      >
        Catálogo de Productos
      </h1>

      {/* Filtro de categorías */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        margin: "1rem 0",
        gap: "10px"
      }}>
        {categorias.map(categoria => (
          <button
            key={categoria}
            onClick={() => setCategoriaSeleccionada(categoria)}
            style={{
              background: categoriaSeleccionada === categoria ? "#7c3a2d" : "#d16a8a",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "8px 16px",
              cursor: "pointer",
              transition: "background-color 0.3s"
            }}
          >
            {categoria}
          </button>
        ))}
      </div>

      {/* Grid de productos */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "16px",
          padding: "1rem",
        }}
      >
        {productosFiltrados.map((p) => (
          <div
            key={p.codigo}
            className="card-sombra"
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div className="catalog-thumb">
              <img
                src={resolveImg(p.img)}
                alt={p.nombre}
                loading="lazy"
              />
            </div>
            <div style={{ padding: "10px 12px" }}>
              <h3 style={{ color: "#7c3a2d", margin: "0 0 6px" }}>{p.nombre}</h3>
              <p style={{ color: "#7c3a2d", opacity: ".9", marginBottom: "10px" }}>
                {p.descripcion}
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {/* Precio con posible descuento */}
                {p.descuento ? (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ textDecoration: "line-through", opacity: 0.6, color: "#7c3a2d" }}>
                      {CLP(p.precio)}
                    </span>
                    <strong style={{ color: "#7c3a2d" }}>{CLP(precioConDescuento(p))}</strong>
                  </div>
                ) : (
                  <strong style={{ color: "#7c3a2d" }}>{CLP(p.precio)}</strong>
                )}
                <button
                  onClick={() => agregarAlCarrito(p)}
                  className="btn-agregar"
                >
                  Agregar
                </button>
              </div>
              {p.descuento ? (
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 6,
                    background: "#ff6b6b",
                    color: "#fff",
                    borderRadius: 8,
                    padding: "2px 8px",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Oferta -{p.descuento}%
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
