import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/style.css';
import productService from '../data/productService';
// 1. IMPORTAR EL ARCHIVO DE LÓGICA
import '../utils/Admin-Productos-Criticos.logic.js';

// 2. REEMPLAZAR CLP
const CLP = window.AdminProductosCriticosLogic.CLP;

export default function AdminProductosCriticos() {
  const [items, setItems] = useState([]);
  const [umbral, setUmbral] = useState(5);
  const [soloAgotados, setSoloAgotados] = useState(false);
  const [q, setQ] = useState('');

  // Las funciones de estado (load, useEffect) permanecen en el componente
  const load = () => setItems(productService.getAll() || []);
  useEffect(() => { load(); }, []);

  // 3. REEMPLAZAR LÓGICA DE useMemo
  const criticos = useMemo(() => {
    return window.AdminProductosCriticosLogic.filterCriticos(items, umbral, soloAgotados, q);
  }, [items, umbral, soloAgotados, q]);

  // 4. REEMPLAZAR LÓGICA DE addStock
  const addStock = (codigo, delta) => {
    window.AdminProductosCriticosLogic.addStockLogic(codigo, delta, productService);
    load(); // Se mantiene load() para actualizar el estado de React
  };

  // 5. REEMPLAZAR LÓGICA DE marcar
  const marcar = (codigo, estado) => {
    window.AdminProductosCriticosLogic.marcarLogic(codigo, estado, productService);
    load(); // Se mantiene load() para actualizar el estado de React
  };

  // 6. REEMPLAZAR LÓGICA DE resolveImg
  const resolveImg = (src) => {
    return window.AdminProductosCriticosLogic.resolveImg(src, process.env.PUBLIC_URL);
  };

  // El JSX del return no cambia en absoluto
  return (
    <div className="admin-container">
      <nav className="admin-sidebar">
        <div className="admin-logo">
          <h2 style={{ margin: 0, fontFamily: "'Pacifico', cursive" }}>Pastelería Mil Sabores</h2>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.8 }}>Panel Administrador</p>
        </div>
        <ul className="admin-nav">
          <li><Link to="/admin">Dashboard</Link></li>
          <li><Link to="/admin-productos">Productos</Link></li>
          <li><Link to="/admin-productos-criticos" className="active">Críticos</Link></li>
          <li><Link to="/admin-usuarios">Usuarios</Link></li>
          <li><Link to="/admin-boletas">Boletas</Link></li>
          <li><Link to="/admin-reportes">Reportes</Link></li>
          <li><Link to="/admin-perfil">Perfil</Link></li>
        </ul>
      </nav>

      <main className="admin-content">
        <div className="admin-header">
          <div>
            <h1>Productos críticos</h1>
            <p>Stock bajo o productos agotados</p>
          </div>
          <div className="admin-actions">
            <Link to="/admin-productos" className="admin-btn">Ir a Productos</Link>
            <Link to="/" className="btn-principal">🏠 Ir al Sitio</Link>
          </div>
        </div>

        <div className="admin-filters">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por código o nombre" />
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Umbral stock
            <input type="number" min="0" step="1" value={umbral} onChange={(e) => setUmbral(Number(e.target.value) || 0)} style={{ width: 120 }} />
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={soloAgotados} onChange={(e) => setSoloAgotados(e.target.checked)} />
            Solo agotados
          </label>
        </div>

        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {criticos.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: '#7c3a2d' }}>No hay productos críticos</td></tr>
              ) : criticos.map(p => (
                <tr key={p.codigo}>
                  <td>{p.codigo}</td>

                  <td>{p.img ? <img src={resolveImg(p.img)} alt={p.nombre} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} /> : <span style={{ opacity: .6 }}>Sin imagen</span>}</td>
                  <td style={{ color: '#7c3a2d', fontWeight: 600 }}>{p.nombre}</td>
                  <td>{p.categoria}</td>

                  <td>{CLP(p.descuento ? Math.round(Number(p.precio) * (1 - Number(p.descuento) / 100)) : p.precio)}</td>
                  <td style={{ fontWeight: 700, color: (p.stock || 0) === 0 ? '#c82333' : '#8a6d00' }}>{p.stock ?? 0}</td>
                  <td style={{ textTransform: 'capitalize' }}>{p.estado}</td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-action-btn is-edit" onClick={() => addStock(p.codigo, +1)}>+1</button>
                      <button className="admin-action-btn is-edit" onClick={() => addStock(p.codigo, +5)}>+5</button>
                      {p.stock > 0 && (
                        <button className="admin-action-btn is-toggle" onClick={() => marcar(p.codigo, 'agotado')}>Marcar agotado</button>
                      )}
                      {p.estado === 'agotado' && (
                        <button className="admin-action-btn is-toggle" onClick={() => marcar(p.codigo, 'disponible')}>Marcar disponible</button>
                      )}
                      <Link to="/admin-productos" className="admin-action-btn">Editar</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}