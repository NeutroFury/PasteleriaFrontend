import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/style.css';
import userService from '../data/userService';

// Importar la lógica externa directamente
import '../utils/Admin-Usuarios.logic.js';

// Fallback para formatear fechas
const fmtDate = (iso) => {
  if (window.AdminUsuariosLogic && window.AdminUsuariosLogic.fmtDate) {
    return window.AdminUsuariosLogic.fmtDate(iso);
  }
  // Fallback si la lógica no está cargada
  try { return new Date(iso).toLocaleString('es-CL'); } catch { return iso || ''; }
};

function StatusPill({ estado }) {
  const cls = estado === 'activo' ? 'status-badge status-active' : 'status-badge status-inactive';
  return <span className={cls} style={{ textTransform: 'capitalize' }}>{estado}</span>;
}

function UserForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(() => initial || {
    nombre: '', email: '', password: '', rol: 'cliente', estado: 'activo', telefono: ''
  });
  const isEdit = !!initial;
  const change = (e) => {
    const { name, value } = e.target;
    setF((prev) => ({ ...prev, [name]: value }));
  };
  const submit = (e) => {
    e.preventDefault();
    if (!f.email || !f.nombre) { 
      alert('Nombre y Email son obligatorios'); 
      return; 
    }
    if (!isEdit && (!f.password || f.password.trim() === '')) {
      alert('La contraseña es obligatoria para crear un nuevo usuario');
      return;
    }
    onSave(f);
  };
  return (
    <form onSubmit={submit} className="admin-form">
      <h2 style={{ marginTop: 0, marginBottom: 12 }}>{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <div>
          <label>Nombre</label>
          <input name="nombre" value={f.nombre} onChange={change} required />
        </div>
        <div>
          <label>Email</label>
          <input type="email" name="email" value={f.email} onChange={change} required />
        </div>
        <div>
          <label>Contraseña {!isEdit && <span style={{ color: 'red' }}>*</span>}</label>
          <input 
            type="password" 
            name="password" 
            value={f.password} 
            onChange={change} 
            placeholder={isEdit ? '(dejar vacío si no desea cambiarla)' : 'Ingrese contraseña'} 
            required={!isEdit}
          />
        </div>
        <div>
          <label>Rol</label>
          <select name="rol" value={f.rol} onChange={change}>
            <option value="cliente">cliente</option>
            <option value="ROLE_ADMIN">ROLE_ADMIN</option>
          </select>
        </div>
        <div>
          <label>Estado</label>
          <select name="estado" value={f.estado} onChange={change}>
            <option value="activo">activo</option>
            <option value="inactivo">inactivo</option>
          </select>
        </div>
        <div>
          <label>Teléfono</label>
          <input name="telefono" value={f.telefono} onChange={change} />
        </div>
      </div>
      <div className="admin-actions" style={{ marginTop: 4 }}>
        <button type="submit" className="admin-btn">{isEdit ? 'Guardar cambios' : 'Crear usuario'}</button>
        <button type="button" onClick={onCancel} className="admin-btn-secondary">Cancelar</button>
      </div>
    </form>
  );
}

export default function AdminUsuarios() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [rol, setRol] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [histUser, setHistUser] = useState(null); // vista de historial (stub)
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const load = async () => {
    const data = await userService.reload();
    setItems(data || []);
  };
  useEffect(() => { load(); }, []);

  // Usar la lógica de filtrado del archivo externo
  const filtered = useMemo(() => {
    if (window.AdminUsuariosLogic && window.AdminUsuariosLogic.filterItems) {
      return window.AdminUsuariosLogic.filterItems(items, search, estado, rol);
    }
    // Fallback si la lógica externa no está disponible
    const q = String(search).toLowerCase().trim();
    return (items || []).filter((u) => {
      const okQ = !q || u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const okE = !estado || u.estado === estado;
      const okR = !rol || u.rol === rol;
      return okQ && okE && okR;
    });
  }, [items, search, estado, rol]);

  const totalPages = Math.max(1, Math.ceil((filtered.length || 0) / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  useEffect(() => { setPage(1); }, [search, estado, rol]);

  const createClick = () => { setEditing(null); setShowForm(true); };
  const editClick = (u) => { setEditing(u); setShowForm(true); };
  
  const deleteClick = async (u) => {
    const confirmMsg = `¿Estás seguro de eliminar al usuario "${u.nombre}"?\n\nEmail: ${u.email}\nRol: ${u.rol}\n\nEsta acción no se puede deshacer.`;
    if (window.confirm(confirmMsg)) {
      try {
        console.log('🗑️ Eliminando usuario:', u.id);
        await userService.remove(u.id);
        console.log('✅ Usuario eliminado exitosamente');
        alert(`Usuario "${u.nombre}" eliminado exitosamente`);
        await load();
      } catch (error) {
        console.error('❌ Error al eliminar usuario:', error);
        alert(error.message || 'Error al eliminar el usuario');
      }
    }
  };
  
  const toggleEstado = async (u) => {
    try {
      console.log('🔄 Cambiando estado del usuario:', u.id);
      await userService.toggleEstado(u.id);
      console.log('✅ Estado actualizado exitosamente');
      await load();
    } catch (error) {
      console.error('❌ Error al cambiar estado:', error);
      alert(error.message || 'Error al cambiar el estado del usuario');
    }
  };
  const onSave = async (data) => {
    try {
      console.log('💾 Guardando usuario:', data);
      if (editing) {
        const result = await userService.update(editing.id, data);
        console.log('✅ Usuario actualizado:', result);
        alert(`Usuario "${data.nombre}" actualizado exitosamente`);
      } else {
        const result = await userService.create(data);
        console.log('✅ Usuario creado:', result);
        alert(`Usuario "${data.nombre}" creado exitosamente`);
      }
      setShowForm(false); 
      setEditing(null); 
      await load();
    } catch (e) { 
      console.error('❌ Error al guardar usuario:', e);
      // Mostrar mensaje de error más específico
      let errorMsg = e.message || 'Error al guardar';
      if (e.message && e.message.includes('ya existe')) {
        errorMsg = 'El correo electrónico ya está registrado. Por favor usa otro correo.';
      } else if (e.status === 400) {
        errorMsg = e.message || 'Datos inválidos. Verifica los campos del formulario.';
      } else if (e.status === 401 || e.status === 403) {
        errorMsg = 'No tienes permisos para realizar esta acción.';
      } else if (e.status === 404) {
        errorMsg = 'Usuario no encontrado.';
      }
      alert(errorMsg);
    }
  };

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
          <li><Link to="/admin-usuarios" className="active">Usuarios</Link></li>
          <li><Link to="/admin-boletas">Boletas</Link></li>
          <li><Link to="/admin-reportes">Reportes</Link></li>
          <li><Link to="/admin-perfil">Perfil</Link></li>
        </ul>
      </nav>
      
      <main className="admin-content">
        <div className="admin-content-inner">
          <div className="admin-header">
            <div>
              <h1>Gestión de Usuarios</h1>
              <p>Administra los usuarios registrados en el sistema</p>
            </div>
            <div className="admin-actions">
              <button onClick={createClick} className="admin-btn">Nuevo Usuario</button>
              <Link to="/" className="btn-principal">🏠 Ir al Sitio</Link>
            </div>
          </div>

        {showForm && (
          <UserForm initial={editing} onSave={onSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
        )}

        {/* Filtros */}
        <div className="admin-filters">
          <input type="text" placeholder="Buscar usuarios..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
          <select value={rol} onChange={(e) => setRol(e.target.value)}>
            <option value="">Todos los tipos</option>
            <option value="cliente">Clientes</option>
            <option value="admin">Administradores</option>
          </select>
        </div>

        {/* Tabla */}
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#7c3a2d' }}>No hay usuarios</td></tr>
              ) : paged.map((u) => (
                <tr key={u.id}>
                  <td title={u.id}>{String(u.id).slice(-6)}</td>
                  <td>{u.nombre || ''}</td>
                  <td>{u.email || u.nombre_usuario || u.nombreUsuario || ''}</td>
                  <td style={{ textTransform: 'capitalize' }}>{u.rol || ''}</td>
                  <td><StatusPill estado={u.estado} /></td>
                  <td>
                    <div className="admin-actions">
                      <button type="button" className="admin-action-btn is-edit" onClick={() => editClick(u)}>Editar</button>
                      <button type="button" className="admin-action-btn is-toggle" onClick={() => toggleEstado(u)}>{u.estado === 'activo' ? 'Desactivar' : 'Activar'}</button>
                      <button type="button" className="admin-action-btn is-history" onClick={() => setHistUser(u)}>Historial</button>
                      <button type="button" className="admin-action-btn is-delete" onClick={() => deleteClick(u)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="admin-pagination" style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', marginTop: 12 }}>
          <button className="admin-btn-secondary" disabled={currentPage <= 1} onClick={() => setPage((p)=>Math.max(1,p-1))}>Anterior</button>
          <span>Página {currentPage} de {totalPages}</span>
          <button className="admin-btn-secondary" disabled={currentPage >= totalPages} onClick={() => setPage((p)=>Math.min(totalPages,p+1))}>Siguiente</button>
        </div>

        {/* Historial de compras (stub) */}
        {histUser && (
          <div className="card-sombra" style={{ marginTop: 16, padding: 16, borderRadius: 12, background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Historial de compras — {histUser.nombre} &lt;{histUser.email}&gt;</h3>
              <button className="admin-btn-secondary" onClick={() => setHistUser(null)}>Cerrar</button>
            </div>
            <p style={{ marginTop: 8, opacity: .8 }}>Aún no hay compras registradas para este usuario.</p>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}