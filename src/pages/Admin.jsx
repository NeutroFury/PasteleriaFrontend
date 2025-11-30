import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/style.css';
import orderService from '../data/orderService';
import productService from '../data/productService';
import userService from '../data/userService';
import '../utils/Admin.logic.js';

export default function Admin() {
  const [stats, setStats] = useState({ products: 0, users: 0, orders: 0, revenue: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  useEffect(() => {
    // Añade clase al body para ocultar header/footer desde CSS
    document.body.classList.add('no-layout');
    return () => {
      document.body.classList.remove('no-layout');
    };
  }, []);

  // Usar la función CLP desde Admin.logic.js
  const CLP = window.AdminLogic.CLP;

  // Usar la función refreshStats desde Admin.logic.js
  const refreshStats = async () => {
    const services = { orderService, productService, userService };
    const setters = { setIsRefreshing, setStats, setLastUpdated };
    await window.AdminLogic.refreshStats(services, setters);
  };

  useEffect(() => { refreshStats(); }, []);

  return (
    <div className="admin-container">
      <nav className="admin-sidebar">
        <div className="admin-logo">
          <h2 style={{ margin: 0, fontFamily: "'Pacifico', cursive" }}>Pastelería Mil Sabores</h2>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.8 }}>Panel Administrador</p>
        </div>

        <ul className="admin-nav">
          <li><Link to="/admin" className="active">Dashboard</Link></li>
          <li><Link to="/admin-productos">Productos</Link></li>
          <li><Link to="/admin-productos-criticos">Críticos</Link></li>
          <li><Link to="/admin-usuarios">Usuarios</Link></li>
          <li><Link to="/admin-boletas">Boletas</Link></li>
          <li><Link to="/admin-reportes">Reportes</Link></li>
          <li><Link to="/admin-perfil">Perfil</Link></li>
        </ul>
      </nav>

      <main className="admin-content">
        <div className="admin-content-inner">
        <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <h1 style={{ margin: 0 }}>Dashboard</h1>
            {/* Botón de refresco compacto junto al título */}
            <button
              onClick={refreshStats}
              disabled={isRefreshing}
              title={isRefreshing ? 'Actualizando…' : 'Actualizar estadísticas'}
              aria-label="Actualizar estadísticas"
              style={{
                width: 34, height: 34, display:'inline-flex', alignItems:'center', justifyContent:'center',
                borderRadius: 999, border: '1px solid #e0c9bb', background:'#f3e9e1', color:'#7c3a2d', cursor: isRefreshing ? 'default' : 'pointer'
              }}>
              {isRefreshing ? '…' : '↻'}
            </button>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {lastUpdated && (
              <small style={{ color:'#7c3a2d', opacity:.8 }}>Actualizado: {new Date(lastUpdated).toLocaleTimeString('es-CL')}</small>
            )}
            <Link to="/" className="btn-principal">🏠 Ir al Sitio</Link>
          </div>
        </div>

        <div className="admin-stats">
          <div className="admin-stat-card">
            <h3 id="total-products">{stats.products}</h3>
            <p>Productos Totales</p>
          </div>
          <div className="admin-stat-card">
            <h3 id="total-users">{stats.users}</h3>
            <p>Usuarios Registrados</p>
          </div>
          <div className="admin-stat-card">
            <h3 id="total-orders">{stats.orders}</h3>
            <p>Pedidos Totales</p>
          </div>
          <div className="admin-stat-card">
            <h3 id="total-revenue">{CLP(stats.revenue)}</h3>
            <p>Ingresos Totales</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h3 style={{ color: '#7c3a2d', marginBottom: '1rem' }}>Bienvenido al Panel de Administración</h3>
          <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
            Desde aquí puedes gestionar productos, usuarios, pedidos y más.
            <br />Selecciona una opción del menú lateral para comenzar.
          </p>
        </div>
        </div>
      </main>
    </div>
  );
}
