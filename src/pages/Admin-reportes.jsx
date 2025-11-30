import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/style.css';
import orderService from '../data/orderService';

// 1. IMPORTAr LA LÓGICA EXTERNA
// (Ajusta la ruta si es necesario, ej: '../utils/AdminReportes.logic.js')
import '../utils/Admin-Reportes.logic.js';

// 2. SE ELIMINAN LAS FUNCIONES: CLP, toDateKey, exportCSV
// Ya no son necesarias aquí, viven en el archivo .logic.js

export default function AdminReportes() {
  const [orders, setOrders] = useState([]);
  const [rango, setRango] = useState('30'); // días

  const load = async () => {
    try {
      const list = await orderService.reload();
      setOrders(list || []);
    } catch (error) {
      console.error('Error cargando órdenes:', error);
      setOrders([]);
    }
  };
  
  useEffect(() => {
    load();
  }, []);  const desde = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() - Number(rango)); d.setHours(0,0,0,0); return d;
  }, [rango]);

  const enRango = useMemo(() => (orders||[]).filter(o => new Date(o.fecha) >= desde), [orders, desde]);

  // 3. SE ACTUALIZAN LOS useMemo PARA USAR LA LÓGICA EXTERNA
  const totales = useMemo(() => {
    // Llama a la lógica externa
    return window.AdminReportesLogic.calcularTotales(enRango);
  }, [enRango]);

  const ventasPorDia = useMemo(() => {
    // Llama a la lógica externa
    return window.AdminReportesLogic.calcularVentasPorDia(enRango, rango);
  }, [enRango, rango]);

  const topProductos = useMemo(() => {
    // Llama a la lógica externa
    return window.AdminReportesLogic.calcularTopProductos(enRango);
  }, [enRango]);

  // 4. SE ELIMINA LA FUNCIÓN 'exportarOrdenes'
   // Ahora se llama directamente desde el JSX

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
          <li><Link to="/admin-productos-criticos">Críticos</Link></li>
          <li><Link to="/admin-usuarios">Usuarios</Link></li>
          <li><Link to="/admin-boletas">Boletas</Link></li>
          <li><Link to="/admin-reportes" className="active">Reportes</Link></li>
          <li><Link to="/admin-perfil">Perfil</Link></li>
        </ul>
      </nav>

      <main className="admin-content">
        <div className="admin-content-inner">
          <div className="admin-header">
            <div>
              <h1>Reportes</h1>
              <p>Resumen de ventas y actividad</p>
            </div>
            <div className="admin-actions">
              {/* 5. SE ACTUALIZAN LOS HANDLERS Y LLAMADAS EN EL JSX */}
              <button className="admin-btn" onClick={() => window.AdminReportesLogic.exportarOrdenes(enRango, rango)}>Exportar CSV</button>
              <Link to="/" className="btn-principal">🏠 Ir al Sitio</Link>
            </div>
          </div>

          <div className="admin-filters">
          <label style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
            Rango
            <select value={rango} onChange={(e)=>setRango(e.target.value)}>
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
            </select>
          </label>
        </div>

        {/* KPIs */}
        <div className="admin-stats" style={{ marginTop: 8 }}>
          <div className="admin-stat-card"><h3>{totales.count}</h3><p>Pedidos totales</p></div>
          <div className="admin-stat-card"><h3>{window.AdminReportesLogic.CLP(totales.total)}</h3><p>Ingresos (todos)</p></div>
          <div className="admin-stat-card"><h3>{totales.pagado}</h3><p>Pagados</p></div>
          <div className="admin-stat-card"><h3>{totales.fallido}</h3><p>Fallidos</p></div>
        </div>

        {/* Ventas por día */}
        <div className="card-sombra" style={{ padding:16, borderRadius:14, marginBottom:16 }}>
          <h3 style={{ color:'#7c3a2d', marginBottom:8 }}>Ventas por día</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
            {ventasPorDia.map(d => (
              <div key={d.fecha} className="card" style={{ padding:12 }}>
                <strong style={{ color:'#7c3a2d' }}>{new Date(d.fecha).toLocaleDateString('es-CL')}</strong>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
                  <span>Pedidos:</span>
                  <b>{d.pedidos}</b>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                  <span>Ingresos:</span>
                  <b>{window.AdminReportesLogic.CLP(d.ingresos)}</b>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Top productos */}

        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th colSpan="4" style={{ textAlign:'left' }}>Top productos más vendidos</th>
              </tr>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Cantidad</th>
                <th>Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {topProductos.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign:'center', color:'#7c3a2d' }}>Sin ventas en el rango</td></tr>
              ) : topProductos.map(p => (
                <tr key={p.codigo}>
                  <td>{p.codigo}</td>
                  <td style={{ color:'#7c3a2d', fontWeight:600 }}>{p.nombre}</td>
                  <td>{p.cantidad}</td>
                  <td>{window.AdminReportesLogic.CLP(p.ingresos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      </main>
    </div>
  );

}