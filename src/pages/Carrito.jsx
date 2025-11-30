import React, { useEffect, useState } from "react";
import {  NavLink } from "react-router-dom";
import catalogo from "../data/catalogo";
import api from "../services/api";
import "../styles/style.css";
import "../utils/Carrito.logic";

export default function Carrito() {
  const [carrito, setCarrito] = useState([]);
  const [productos, setProductos] = useState([]);

  // Cargar carrito
  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const serverCart = await api.getCart();
          console.log('🛒 Carrito recibido del servidor:', serverCart);
          
          const items = serverCart?.items || [];
          
          if (items.length > 0) {
            // El backend devuelve CarritoItemDTO con campos directos, no anidados
            const normalized = items.map(item => ({
              codigo: String(item.productoId || ''),
              nombre: item.productoNombre || 'Sin nombre',
              precio: Number(item.productoPrecio || 0),
              img: item.productoImagen || '',
              cantidad: Number(item.cantidad || 1),
              productId: item.productoId,
              itemId: item.id
            }));
            
            console.log('🛒 Items normalizados:', normalized);
            setCarrito(normalized);
            localStorage.setItem("carrito", JSON.stringify(normalized));
            return;
          }
        } catch (error) {
          console.error('❌ Error cargando carrito:', error);
          // Fallback a carrito local
        }
      }
      
      try {
        const raw = localStorage.getItem("carrito");
        const arr = raw ? JSON.parse(raw) : [];
        if (Array.isArray(arr) && arr.length > 0) {
          setCarrito(arr);
        }
      } catch {
        setCarrito([]);
      }
    };
    load();
    
    const onStorage = (e) => {
      if (e.key === 'carrito') {
        load();
      }
    };
    
    const onCarritoChanged = () => {
      console.log('🔔 Carrito.jsx: Evento carrito-changed recibido');
      load();
    };
    
    window.addEventListener("storage", onStorage);
    window.addEventListener("carrito-changed", onCarritoChanged);
    
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("carrito-changed", onCarritoChanged);
    };
  }, []);

  // Cargar productos (solo para mostrar en la lista)
  useEffect(() => {
    const loadProductos = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const backendProducts = await api.getProducts();
          
          if (Array.isArray(backendProducts) && backendProducts.length > 0) {
            const mapped = backendProducts.map(p => ({
              id: p.id,
              codigo: p.codigo || String(p.id),
              categoria: p.categoria?.nombre || p.categoria || 'Otros',
              nombre: p.nombre,
              precio: Number(p.precio),
              descripcion: p.descripcion || '',
              img: p.imagenUrl || p.img || '',
              descuento: Number(p.descuento || 0)
            }));
            setProductos(mapped);
            localStorage.setItem("productos", JSON.stringify(mapped));
            return;
          }
        } catch (err) {
          // Fallback a catálogo local
        }
      }
      
      setProductos(catalogo);
      localStorage.setItem("productos", JSON.stringify(catalogo));
    };
    
    loadProductos();
  }, []);

  // Usar funciones de la lógica pura
  const resolveImg = (src) => window.CarritoLogic.resolveImg(src, process.env.PUBLIC_URL);
  const CLP = (n) => window.CarritoLogic.CLP(n);
  const precioConDescuento = (p) => window.CarritoLogic.precioConDescuento(p);

  const guardar = (nuevo) => {
    setCarrito(nuevo);
    localStorage.setItem("carrito", JSON.stringify(nuevo));
  };
  // Helper to resolve backend productId from local item or codigo
  const resolveProductId = async (itemOrCodigo) => {
    try {
      if (!itemOrCodigo) return null;
      const maybe = typeof itemOrCodigo === 'string' ? itemOrCodigo : (itemOrCodigo.codigo || itemOrCodigo.id || itemOrCodigo.productId);
      if (!maybe) return null;
      if (typeof maybe === 'number') return maybe;
      if (/^[0-9]+$/.test(String(maybe))) return Number(maybe);
      // try productService lookup (uses localStorage and may fetch remote)
      const prodService = (await import('../data/productService')).default;
      const prod = await prodService.getById(maybe).catch(() => null);
      if (prod && prod.id) return prod.id;
      return null;
    } catch {
      return null;
    }
  };

  const incrementar = async (codigo) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const item = carrito.find(it => it.codigo === codigo);
        const productId = item?.productId;
        
        if (productId && typeof productId === 'number' && !isNaN(productId)) {
          await api.addToCartByProductId(productId, 1);
          
          const serverCart = await api.getCart();
          const items = serverCart?.items || [];
          const normalized = items.map(item => ({
            codigo: String(item.productoId || ''),
            nombre: item.productoNombre || 'Sin nombre',
            precio: Number(item.productoPrecio || 0),
            img: item.productoImagen || '',
            cantidad: Number(item.cantidad || 1),
            productId: item.productoId,
            itemId: item.id
          }));
          guardar(normalized);
          return;
        }
      } catch (err) {
        // Usar lógica local en caso de error
      }
    }
    
    const nuevoCarrito = window.CarritoLogic.logic_incrementar(carrito, codigo);
    guardar(nuevoCarrito);
  };

  const decrementar = async (codigo) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const item = carrito.find(it => it.codigo === codigo);
        const productId = item?.productId;
        const current = Number(item?.cantidad || 1);
        
        if (productId && typeof productId === 'number' && !isNaN(productId)) {
          if (current - 1 <= 0) {
            await api.removeFromCartByProductId(productId);
          } else {
            await api.addToCartByProductId(productId, -1);
          }
          
          const serverCart = await api.getCart();
          const items = serverCart?.items || [];
          const normalized = items.map(item => ({
            codigo: String(item.productoId || ''),
            nombre: item.productoNombre || 'Sin nombre',
            precio: Number(item.productoPrecio || 0),
            img: item.productoImagen || '',
            cantidad: Number(item.cantidad || 1),
            productId: item.productoId,
            itemId: item.id
          }));
          guardar(normalized);
          return;
        }
      } catch (err) {
        // Usar lógica local en caso de error
      }
    }
    
    const nuevoCarrito = window.CarritoLogic.logic_decrementar(carrito, codigo);
    guardar(nuevoCarrito);
  };

  const eliminar = async (codigo) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const item = carrito.find(it => it.codigo === codigo);
        const productId = item?.productId;
        
        if (productId && typeof productId === 'number' && !isNaN(productId)) {
          await api.removeFromCartByProductId(productId);
          
          const serverCart = await api.getCart();
          const items = serverCart?.items || [];
          const normalized = items.map(item => ({
            codigo: String(item.productoId || ''),
            nombre: item.productoNombre || 'Sin nombre',
            precio: Number(item.productoPrecio || 0),
            img: item.productoImagen || '',
            cantidad: Number(item.cantidad || 1),
            productId: item.productoId,
            itemId: item.id
          }));
          guardar(normalized);
          return;
        }
      } catch (err) {
        // Usar lógica local en caso de error
      }
    }
    
    const nuevoCarrito = window.CarritoLogic.logic_eliminar(carrito, codigo);
    guardar(nuevoCarrito);
  };

  const limpiar = async () => {
    if (!window.confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      return;
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await api.clearCart();
        guardar([]);
        alert('Carrito limpiado correctamente');
        return;
      } catch (err) {
        console.error('Error al limpiar carrito del backend:', err);
      }
    }
    guardar(window.CarritoLogic.logic_limpiar());
    alert('Carrito limpiado correctamente');
  };
  
  const agregarDesdeListado = async (p) => {
    try {
      if (!window.CarritoLogic) {
        alert('Error: La lógica del carrito no está cargada');
        return;
      }
      
      if (!Array.isArray(carrito)) {
        setCarrito([]);
        return;
      }
      
      const nuevoCarrito = window.CarritoLogic.logic_agregarDesdeListado(
        carrito,
        p,
        window.CarritoLogic.precioConDescuento
      );
      
      if (!Array.isArray(nuevoCarrito)) {
        return;
      }
      
      guardar(nuevoCarrito);
      
      const token = localStorage.getItem('token');
      if (token && p.id && typeof p.id === 'number' && !isNaN(p.id)) {
        try {
          await api.addToCartByProductId(p.id, 1);
        } catch (err) {
          // Producto agregado al carrito local exitosamente
        }
      }
    } catch (error) {
      alert('Error al agregar producto: ' + error.message);
    }
  };

  const total = window.CarritoLogic.calcularTotal(carrito);

  return (
    <main>
      <div className="carrito-layout">
        {/* Lista de productos */}
        <section className="carrito-left">
          <h2 className="estiloEncabezado">Lista de productos</h2>
          <div className="card product-cardlist">
            <div className="product-grid">
              {(productos || []).map((p) => (
                <article key={p.codigo} className="product-card">
                  <div className="product-thumb">
                    {p.img ? (
                      <img src={resolveImg(p.img)} alt={p.nombre} />
                    ) : (
                      <span>400 x 300</span>
                    )}
                  </div>
                  <div className="product-title">{p.nombre}</div>
                  <div className="product-price">
                    {p.descuento ? (
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ textDecoration: "line-through", opacity: 0.6 }}>
                          {CLP(p.precio)}
                        </span>
                        <strong>{CLP(precioConDescuento(p))}</strong>
                      </div>
                    ) : (
                      <strong>{CLP(p.precio)}</strong>
                    )}
                  </div>
                  <button 
                    className="btn-agregar" 
                    onClick={() => agregarDesdeListado(p)}
                  >
                    Añadir
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Carrito */}
        <section className="carrito-right">
          <h2 className="estiloEncabezado">Carrito de Compras</h2>

          {carrito.length === 0 ? (
            <div className="card empty-cart">
              <p>Tu carrito está vacío.</p>
              <NavLink to="/productos" className="btn-principal" style={{ marginTop: 8 }}>
                Ver productos
              </NavLink>
            </div>
          ) : (
            <div className="cart-card card">
              <div className="cart-scroll">
                <table className="cart-table">
                  <thead>
                    <tr>
                      <th>Imagen</th>
                      <th>Nombre</th>
                      <th>Precio</th>
                      <th>Cantidad</th>
                      <th>Subtotal</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrito.map((it) => {
                      const subtotal = window.CarritoLogic.calcularSubtotal(it);
                      return (
                        <tr key={it.codigo}>
                          <td><img className="thumb" src={it.img} alt={it.nombre} /></td>
                          <td style={{ color: "#7c3a2d", fontWeight: 600 }}>{it.nombre}</td>
                          <td>{CLP(it.precio)}</td>
                          <td>
                            <div className="qty-controls">
                              <button
                                className="cart-qty-btn is-minus"
                                onClick={() => decrementar(it.codigo)}
                                aria-label={`Disminuir cantidad de ${it.nombre}`}
                                disabled={(Number(it.cantidad) || 1) <= 1}
                              >
                                -
                              </button>
                              <span>{it.cantidad}</span>
                              <button
                                className="cart-qty-btn is-plus"
                                onClick={() => incrementar(it.codigo)}
                                aria-label={`Aumentar cantidad de ${it.nombre}`}
                                disabled={(Number(it.cantidad) || 1) >= 5}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td style={{ fontWeight: 700 }}>{CLP(subtotal)}</td>
                          <td>
                            <button className="colorBoton1" onClick={() => eliminar(it.codigo)}>
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="cart-totalbar">
                <div>
                  <strong>Total: </strong>
                  <span className="total">{CLP(total)}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="cart-clean-btn" onClick={limpiar}>Limpiar</button>
                  <NavLink to="/checkout" className="btn-compra">
                    Comprar ahora
                  </NavLink>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}