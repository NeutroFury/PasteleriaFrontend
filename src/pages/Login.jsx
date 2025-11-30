import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import "../utils/Login.logic.js";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

    const handleSubmit = (e) => {
      window.LoginLogic.handleLoginSubmit(e, email, password, location, navigate, setMsg);
  };

  return (
    <main>
      <div className="login-container">
        <h2>Iniciar Sesión</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              placeholder="email@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div id="mensajes">
            {msg && <div className="mi-alerta-error">{msg}</div>}
          </div>

          <button type="submit" className="colorBoton1">Ingresar</button>
        </form>
      </div>
    </main>
  );
}