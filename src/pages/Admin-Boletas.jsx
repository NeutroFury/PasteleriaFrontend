import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/style.css';
import orderService from '../data/orderService';
import '../utils/Admin-Boletas.logic.js';


export default function AdminBoletas() {
  // --- Estados (Se mantienen igual) ---
  const [orders, setOrders] = useState([]);
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('');
  const [page, setPage] = useState(1);
  const [visible, setVisible] = useState(false);
  const [ordenSel, setOrdenSel] = useState(null);
  const [toast, setToast] = useState(null); // { text, kind }
  const pageSize = 10;

  // --- 1. Definir la lógica (con fallback defensivo para evitar crashes si no cargó) ---
  const logic = useMemo(() => {
    const w = typeof window !== 'undefined' ? window : {};
    const L = w.AdminBoletasLogic || {};
    return {
      // Fallbacks mínimos por si la lógica global no está disponible aún
      CLP: (n) => Number(n).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }),
      badge: (s) => (
        <span style={{
          background: s === 'pagado' ? '#e9ffe8' : s === 'fallido' ? '#fff5f5' : s === 'anulado' ? '#f5f5f5' : '#f5f5f5',
          color: s === 'pagado' ? '#0f5d1d' : s === 'fallido' ? '#9b2c2c' : '#4a4a4a',
          padding: '4px 8px',
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 700,
          textTransform: 'capitalize'
        }}>{s}</span>
      ),
      showToast: (setToast, win, text, kind = 'info') => {
        if (!setToast || !win) return;
        setToast({ text, kind });
        try {
          win.clearTimeout(win.__toastTimer);
          win.__toastTimer = win.setTimeout(() => setToast(null), 2600);
        } catch {}
      },
      load: (svc, setOrdersFn) => {
        if (!svc || !setOrdersFn) return;
        try { svc.dedupe && svc.dedupe(); } catch {}
        try { svc.purgeExamples && svc.purgeExamples(); } catch {}
        try { setOrdersFn(svc.getAll ? svc.getAll() : []); } catch { setOrdersFn([]); }
      },
      verBoleta: (ls, o, setOrdenSelFn, setVisibleFn) => {
        try { ls && ls.setItem && ls.setItem('ultima_orden', JSON.stringify(o)); } catch {}
        setOrdenSelFn && setOrdenSelFn(o || null);
        setVisibleFn && setVisibleFn(true);
      },
      cerrarBoleta: (setVisibleFn, setOrdenSelFn) => {
        setVisibleFn && setVisibleFn(false);
        setOrdenSelFn && setOrdenSelFn(null);
      },
      enviarEmail: (ordenSel, CLP_func, win) => {
        if (!ordenSel || !CLP_func || !win) return;
        const total = (ordenSel.items || []).reduce((s, it) => s + (Number(it.precio) || 0) * (Number(it.cantidad) || 1), 0);
        const to = ordenSel?.cliente?.correo || '';
        const subject = encodeURIComponent(`Boleta de compra ${ordenSel.codigo || ordenSel.id}`);
        const cuerpoTexto = [
          `Hola ${ordenSel?.cliente?.nombre || ''},`,
          '',
          `Adjuntamos el detalle de tu compra ${ordenSel.codigo || ordenSel.id}.`,
          '',
          ...(ordenSel.items || []).map((it) => `• ${it.nombre} x${it.cantidad} = ${CLP_func((Number(it.precio) || 0) * (Number(it.cantidad) || 1))}`),
          '',
          `Total pagado: ${CLP_func(total)}`,
        ].join('\r\n');
        const cuerpo = encodeURIComponent(cuerpoTexto);
        try { win.location.href = `mailto:${to}?subject=${subject}&body=${cuerpo}`; } catch {}
      },
      anular: (win, svc, loadFn, toastFn, o) => {
        if (!win || !svc || !loadFn || !toastFn || !o) return;
        if (!win.confirm || win.confirm('¿Anular esta boleta?')) {
          try { svc.update && svc.update(o.id, { estado: 'anulado' }); } catch {}
          try { loadFn(); } catch {}
          try { toastFn('Boleta anulada', 'info'); } catch {}
        }
      },
      depurar: (svc, loadFn, toastFn) => {
        if (!svc || !loadFn || !toastFn) return;
        let res = null;
        try { res = svc.dedupe ? svc.dedupe() : null; } catch {}
        try { loadFn(); } catch {}
        try {
          const removed = res && typeof res.removed === 'number' ? res.removed : 0;
          toastFn(`Depuración completa. Eliminados ${removed} duplicados.`, 'success');
        } catch {}
      },
      abrirPestanaBoleta: (ls, win, o) => {
        try { ls && ls.setItem && ls.setItem('ultima_orden', JSON.stringify(o)); } catch {}
        try { win && win.open && win.open('/pago-bien', '_blank'); } catch {}
      },
      // Sobrescribe con la lógica real si está presente
      ...L
    };
  }, []);

  // Render seguro del badge (evita depender de la implementación global)
  const renderBadge = (s) => (
    <span style={{
      background: s === 'pagado' ? '#e9ffe8' : s === 'fallido' ? '#fff5f5' : s === 'anulado' ? '#f5f5f5' : '#f5f5f5',
      color: s === 'pagado' ? '#0f5d1d' : s === 'fallido' ? '#9b2c2c' : '#4a4a4a',
      padding: '4px 8px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      textTransform: 'capitalize'
    }}>{s}</span>
  );

  // --- 2. Hooks (Modificados para usar 'logic') ---
  useEffect(() => {
    // Se llama a la lógica externa si está disponible
    if (logic && typeof logic.load === 'function') {
      logic.load(orderService, setOrders);
    }
  }, [logic]);

  // (Estos se mantienen igual, son lógica de renderizado)
  const filtered = useMemo(() => {
    const text = q.toLowerCase().trim();
    return (orders || []).filter(o => {
      const okQ = !text ||
        (o.codigo || '').toLowerCase().includes(text) ||
        (o.nro || '').toLowerCase().includes(text) ||
        (o.cliente?.nombre || '').toLowerCase().includes(text) ||
        (o.cliente?.correo || '').toLowerCase().includes(text);
      const okE = !estado || o.estado === estado;
      return okQ && okE;
    });
  }, [orders, q, estado]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  useEffect(() => { setPage(1); }, [q, estado]);

  // --- 3. JSX (Modificado para usar 'logic') ---
  return (
    <div className="admin-container">
      <nav className="admin-sidebar">
        {/* ... (Sidebar se mantiene igual) ... */}
        <div className="admin-logo">
          <h2 style={{ margin: 0, fontFamily: "'Pacifico', cursive" }}>Pastelería Mil Sabores</h2>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.8 }}>Panel Administrador</p>
        </div>
        <ul className="admin-nav">
          <li><Link to="/admin">Dashboard</Link></li>
          <li><Link to="/admin-productos">Productos</Link></li>
          <li><Link to="/admin-productos-criticos">Críticos</Link></li>
          <li><Link to="/admin-usuarios">Usuarios</Link></li>
          <li><Link to="/admin-boletas" className="active">Boletas</Link></li>
          <li><Link to="/admin-reportes">Reportes</Link></li>
          <li><Link to="/admin-perfil">Perfil</Link></li>
        </ul>
      </nav>

      <main className="admin-content">
        <div className="admin-header">
          <div>
            <h1>Órdenes / Boletas</h1>
            <p>Listar, ver y anular boletas</p>
          </div>
          <div className="admin-actions">
            <Link to="/" className="btn-principal">🏠 Ir al Sitio</Link>
            {/* ✅ Botón DEPURAR corregido */}
            <button
              onClick={() => {
                const showToast_func = (text, kind) => logic.showToast(setToast, window, text, kind);
                const load_func = () => logic.load(orderService, setOrders);
                logic.depurar(orderService, load_func, showToast_func);
              }}
              className="admin-btn-secondary"
              style={{ marginLeft: 8 }}
            >
              Depurar duplicados
            </button>
          </div>
        </div>

        <div className="admin-filters">
          {/* ... (Filtros se mantienen igual) ... */}
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Buscar por código, nro, cliente o email" />
          <select value={estado} onChange={(e)=>setEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="pagado">Pagado</option>
            <option value="fallido">Fallido</option>
            <option value="anulado">Anulado</option>
          </select>
        </div>

        <div className="admin-table">
          <table>
            {/* ... (Thead se mantiene igual) ... */}
            <thead>
              <tr>
                <th>Código</th>
                <th>Nro</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#7c3a2d' }}>No hay boletas</td></tr>
              ) : paged.map(o => (
                <tr key={o.id}>
                  <td>{o.codigo}</td>
                  <td>{o.nro}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ color: '#7c3a2d' }}>{o.cliente?.nombre || 'Cliente'}</strong>
                      <small style={{ opacity: .8 }}>{o.cliente?.correo}</small>
                    </div>
                  </td>
                  {/* Badge renderizado localmente para evitar issues de ref en runtime */}
                  <td>{renderBadge(o.estado)}</td>
                  {/* ✅ Llamada a logic.CLP con fallback */}
                  <td>{logic && typeof logic.CLP === 'function' ? logic.CLP(o.total) : o.total}</td>
                  <td>{o.fecha ? new Date(o.fecha).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}</td>
                  <td>
                    <div className="admin-actions">
                      {/* ✅ Llamada a logic.verBoleta con fallback */}
                      <button className="admin-action-btn is-history" onClick={() => logic && typeof logic.verBoleta === 'function' ? logic.verBoleta(localStorage, o, setOrdenSel, setVisible) : setVisible(true)}>Mostrar boleta</button>
                      {/* ✅ Llamada a logic.abrirPestanaBoleta con fallback */}
                      <button className="admin-action-btn" onClick={() => logic && typeof logic.abrirPestanaBoleta === 'function' ? logic.abrirPestanaBoleta(localStorage, window, o) : null}>Abrir pestaña</button>
                      {o.estado !== 'anulado' && (
                        /* ✅ Llamada a logic.anular */
                        <button
                          className="admin-action-btn is-delete"
                          onClick={() => {
                            const showToast_func = (text, kind) => logic.showToast(setToast, window, text, kind);
                            const load_func = () => logic.load(orderService, setOrders);
                            logic && typeof logic.anular === 'function' && logic.anular(window, orderService, load_func, showToast_func, o);
                          }}
                        >
                          Anular
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="admin-pagination" style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', marginTop: 12 }}>
          {/* ... (Paginación se mantiene igual) ... */}
          <button className="admin-btn-secondary" disabled={currentPage<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Anterior</button>
          <span>Página {currentPage} de {totalPages}</span>
          <button className="admin-btn-secondary" disabled={currentPage>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Siguiente</button>
        </div>

        {/* --- Modal (Modificado para usar 'logic') --- */}
        {visible && !!ordenSel && (
          <div
            role="dialog"
            aria-modal="true"
            className="modal-backdrop"
            onClick={() => logic.cerrarBoleta(setVisible, setOrdenSel)}
          >
            <div className="card cart-card boleta-modal" onClick={(e) => e.stopPropagation()}>
              <div className="boleta-header">
                <h2 className="estiloEncabezado">Boleta {ordenSel.nro}</h2>
                <div className="boleta-actions">
                  <button className="btn-compra" onClick={() => window.print()}>Imprimir</button>
                  <button className="btn-compra" onClick={() => logic.enviarEmail(ordenSel, logic.CLP, window)}>Enviar email</button>
                  <button className="btn-compra" onClick={() => logic.cerrarBoleta(setVisible, setOrdenSel)}>Cerrar</button>
                </div>
              </div>

              {/* Fecha de la orden */}
              <div className="boleta-fecha-section">
                <p><strong>Fecha:</strong> {ordenSel.fecha ? new Date(ordenSel.fecha).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}</p>
              </div>

              {/* Items */}
              <div className="cart-scroll boleta-items">
                <table className="cart-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Precio</th>
                      <th>Cantidad</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(ordenSel.items || []).map(it => {
                      const sub = (Number(it.precio) || 0) * (Number(it.cantidad) || 1);
                      return (
                        <tr key={it.codigo || it.id}>
                          <td className="producto-nombre">{it.nombre}</td>
                          <td>{logic && typeof logic.CLP === 'function' ? logic.CLP(it.precio) : it.precio}</td>
                          <td>{it.cantidad}</td>
                          <td className="subtotal">{logic && typeof logic.CLP === 'function' ? logic.CLP(sub) : sub}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="boleta-total">
                <strong>Total: {logic && typeof logic.CLP === 'function' ? logic.CLP(ordenSel.total) : ordenSel.total}</strong>
              </div>
            </div>
          </div>
        )}

        {/* --- Toast (Se mantiene igual) --- */}
        {toast && (
          <div style={{ position: 'fixed', right: 16, bottom: 16, background: toast.kind === 'success' ? '#2e8b57' : toast.kind === 'info' ? '#7c3a2d' : '#9b2c2c', color: '#fff', padding: '10px 14px', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,.18)', zIndex: 60 }}>
            {toast.text}
          </div>
        )}
      </main>
    </div>
  );
}