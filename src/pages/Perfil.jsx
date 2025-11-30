import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../utils/Perfil.logic.js";

export default function Perfil() {
  const navigate = useNavigate();
  const [isLogged, setIsLogged] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const logged = localStorage.getItem('isLoggedIn') === 'true';
    const name = localStorage.getItem('userName') || '';
    const email = localStorage.getItem('userEmail') || '';
    setIsLogged(logged);
    setUserName(name);
    setUserEmail(email);

    if (!logged) {
      // Si no está logueado, redirigir a login y recordar origen
      navigate('/login', { state: { from: '/perfil' } });
    }
  }, [navigate]);

  if (!isLogged) {
    return null; // Evita parpadeo mientras redirige
  }

    const handleEdit = () => window.PerfilLogic.handleEdit();

  return (
    <main>
      <section className="perfil-container">
        <h2>Mi Perfil</h2>
        <div className="perfil-card">
          <div className="perfil-row"><strong>Nombre:</strong> <span>{userName}</span></div>
          <div className="perfil-row"><strong>Correo:</strong> <span>{userEmail}</span></div>
        </div>

        <div className="perfil-actions">
          <button className="colorBoton1" onClick={handleEdit}>Editar datos</button>
          <button className="btn-header" onClick={() => navigate('/carrito')}>Ir al carrito</button>
        </div>
      </section>
    </main>
  );
}
