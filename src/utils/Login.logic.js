/**
 * 🧾 Archivo de lógica pura para el componente Login.
 * Ubicación sugerida: src/utils/Login.logic.js  
 * * Este archivo debe ser importado en el componente React antes de su uso .
 */

import api from '../services/api';

// Evitar redeclaración
if (!window.LoginLogic) window.LoginLogic = {};

window.LoginLogic.handleLoginSubmit = async function (
  e,
  email,
  password,
  location,
  navigate,
  setMsg
) {
  e.preventDefault();
  setMsg('');

  try {
    console.log('🔐 Intentando login con:', { email });
    const res = await api.login(email, password);
    console.log('✅ Login exitoso:', res);
    
    // backend devuelve token - el token se guarda automáticamente en api.js
    
    // Obtener información del usuario autenticado
    if (res?.token) {
      try {
        console.log('📋 Obteniendo información del usuario...');
        const userInfo = await api.me();
        console.log('✅ Info del usuario obtenida:', userInfo);
        
        if (userInfo) {
          localStorage.setItem('userName', userInfo.nombre || userInfo.username || userInfo.name || '');
          localStorage.setItem('userEmail', userInfo.email || email);
          localStorage.setItem('isLoggedIn', 'true');
          
          // Guardar el rol del usuario
          const userRole = userInfo.rol || userInfo.role || '';
          const authorities = userInfo.authorities || [];
          
          // Verificar si es admin (solo ROLE_ADMIN)
          const isAdmin = 
            userRole === 'ROLE_ADMIN' ||
            String(userRole).toUpperCase() === 'ROLE_ADMIN' ||
            authorities.some(auth => 
              auth?.authority === 'ROLE_ADMIN'
            );
          
          localStorage.setItem('userRole', userRole);
          localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
          
          console.log('🔑 Rol del usuario:', userRole, '| Es admin:', isAdmin);
          console.log('📋 Authorities:', authorities);
        }
      } catch (meError) {
        console.error('⚠️ Error obteniendo info del usuario:', meError);
        // Si no se puede obtener info del usuario, usar el email del login
        localStorage.setItem('userEmail', email);
        localStorage.setItem('isLoggedIn', 'true');
      }
    }
    
    // Disparar evento para notificar cambios de autenticación
    window.dispatchEvent(new Event('auth-changed'));
    
    const to = location.state?.from || '/';
    navigate(to);
  } catch (err) {
    console.error('❌ Error en login:', err);
    
    // Mostrar mensaje de error más específico
    let errorMsg = 'Error autenticando';
    
    if (err.status === 401) {
      errorMsg = 'Email o contraseña incorrectos';
    } else if (err.status === 403) {
      errorMsg = 'Acceso denegado';
    } else if (err.status === 500) {
      errorMsg = 'Error en el servidor. Verifica que el backend esté funcionando correctamente';
    } else if (err.message) {
      errorMsg = err.message;
    }
    
    setMsg(errorMsg);
  }
};
