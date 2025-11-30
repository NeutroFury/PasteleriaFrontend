import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/style.css';
import '../utils/Admin-Perfil.logic.js';

export default function AdminPerfil() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Este useEffect para las clases del body se mantiene igual
  useEffect(() => {
    // Ocultar header/footer por clase
    document.body.classList.add('no-layout');
    return () => { document.body.classList.remove('no-layout'); };
  }, []);

  // <-- 2. REEMPLAZAR EL USEEFFECT QUE OBTIENE LOS DATOS
  // Ahora llama a la función desde el objeto 'window'
  useEffect(() => {
    const profileData = window.AdminPerfilLogic.getProfileData();
    setName(profileData.name);
    setEmail(profileData.email);
  }, []);

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
          <li><Link to="/admin-reportes">Reportes</Link></li>
          <li><Link to="/admin-perfil" className="active">Perfil</Link></li>
        </ul>
      </nav>

      <main className="admin-content">
        <div className="admin-header">
          <div>
            <h1>Perfil del Administrador</h1>
            <p>Información básica de tu cuenta</p>
          </div>
          <div className="admin-actions">
            <Link to="/" className="btn-principal">🏠 Ir al Sitio</Link>
          </div>
        </div>

        <section className="perfil-admin">
          <div className="perfil-card" style={{
            background: '#fff',
            border: '1px solid #f0e2d8',
            borderRadius: 12,
            padding: '1.2rem',
            maxWidth: 520
          }}>
            <div style={{ display:'grid', gap:12 }}>
              <div><strong>Nombre:</strong> <span>{name}</span></div>
              <div><strong>Correo:</strong> <span>{email || '—'}</span></div>
            </div>
            <div className="admin-actions" style={{ marginTop: 16 }}>
              {/* <-- 3. REEMPLAZAR EL ONCLICK POR LA FUNCIÓN DE LÓGICA */}
              <button className="admin-btn" onClick={window.AdminPerfilLogic.handleEditClick}>Editar</button>
              <Link to="/admin" className="admin-btn-secondary">Volver al Dashboard</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}