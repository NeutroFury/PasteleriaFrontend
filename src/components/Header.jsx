import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Header() {
  const [isLogged, setIsLogged] = useState(false);
  const [userName, setUserName] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsLogged(true);
        try {
          const me = await api.me();
          
          console.log('📋 Respuesta completa de /me:', me);
          
          // Intentar obtener el nombre de diferentes campos
          let displayName = me?.nombre || me?.nombreCompleto || me?.name || me?.username || me?.nombreUsuario || localStorage.getItem('userName') || '';
          
          // Si el displayName es un email, extraer la parte antes del @
          if (displayName && displayName.includes('@')) {
            displayName = displayName.split('@')[0];
          }
          
          setUserName(displayName);
          
          // Verificar si es admin - buscar en todos los lugares posibles
          const authorities = me?.authorities || [];
          const userRole = me?.rol || me?.role || '';
          
          console.log('🔍 Datos para verificar admin:', {
            authorities,
            userRole,
            tipoAuthorities: typeof authorities,
            esArray: Array.isArray(authorities)
          });
          
          // Verificar en authorities (formato Spring Security)
          const hasAdminInAuthorities = Array.isArray(authorities) && authorities.some(
            auth => String(auth?.authority || '').toUpperCase() === 'ROLE_ADMIN'
          );
          
          // Verificar en rol simple
          const hasAdminInRole = String(userRole).toUpperCase() === 'ROLE_ADMIN';
          
          const hasAdminRole = hasAdminInAuthorities || hasAdminInRole;
          
          console.log('✅ Resultado verificación de Admin:', {
            hasAdminInAuthorities,
            hasAdminInRole,
            isAdmin: hasAdminRole
          });
          
          setIsAdmin(hasAdminRole);
        } catch (error) {
          console.error('❌ Error obteniendo datos del usuario:', error);
          let fallbackName = localStorage.getItem('userName') || '';
          
          // Si el fallback es un email, extraer la parte antes del @
          if (fallbackName && fallbackName.includes('@')) {
            fallbackName = fallbackName.split('@')[0];
          }
          
          setUserName(fallbackName);
          setIsAdmin(false);
        }
      } else {
        setIsLogged(localStorage.getItem('isLoggedIn') === 'true');
        let storedName = localStorage.getItem('userName') || '';
        
        // Si el nombre almacenado es un email, extraer la parte antes del @
        if (storedName && storedName.includes('@')) {
          storedName = storedName.split('@')[0];
        }
        
        setUserName(storedName);
        setIsAdmin(false);
      }
    };
    loadAuth();
    const onStorage = () => loadAuth();
    const onAuthChanged = () => loadAuth();
    window.addEventListener('storage', onStorage);
    window.addEventListener('auth-changed', onAuthChanged);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('auth-changed', onAuthChanged);
    };
  }, []);

  // Contador de productos en el carrito
  useEffect(() => {
    const loadCart = async () => {
      const token = localStorage.getItem('token');
      console.log('🔄 Header: Cargando carrito, token presente:', !!token);
      if (token) {
        try {
          const cart = await api.getCart();
          console.log('🔄 Header: Carrito recibido:', cart);
          
          // Manejar diferentes estructuras de respuesta
          if (cart && Array.isArray(cart.items)) {
            const total = cart.items.reduce((s, it) => s + (Number(it.cantidad || it.quantity || it.qty) || 0), 0);
            console.log('🔄 Header: Total items en carrito:', total);
            setCartCount(total);
            return;
          } else if (Array.isArray(cart)) {
            // Si cart es directamente un array
            const total = cart.reduce((s, it) => s + (Number(it.cantidad || it.quantity || it.qty) || 0), 0);
            console.log('🔄 Header: Total items en carrito (array directo):', total);
            setCartCount(total);
            return;
          }
          
          console.warn('⚠️ Estructura de carrito no reconocida:', cart);
          setCartCount(0);
        } catch (err) {
          console.error('❌ Header: Error cargando carrito:', err);
          // fallback to localStorage
        }
      }
      try {
        const raw = localStorage.getItem('carrito');
        const arr = raw ? JSON.parse(raw) : [];
        if (Array.isArray(arr)) {
          const total = arr.reduce((sum, it) => sum + (Number(it.cantidad) || 1), 0);
          setCartCount(total);
        } else {
          setCartCount(0);
        }
      } catch {
        setCartCount(0);
      }
    };
    loadCart();
    const onChanged = () => {
      console.log('🔔 Header: Evento carrito-changed recibido');
      loadCart();
    };
    window.addEventListener('carrito-changed', onChanged);
    window.addEventListener('storage', onChanged);
    return () => {
      window.removeEventListener('carrito-changed', onChanged);
      window.removeEventListener('storage', onChanged);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('auth-changed'));
  };

  return (
    <header>
      <div className="logo">
  <img src={`${(process.env.PUBLIC_URL || '').replace(/\/$/,'')}/img/Logo emprendimiento reposteria beige.png`} alt="Logo Pastelería" className="logo-img" />
        <h2 className="estiloEncabezado">Pastelería Mil Sabores</h2>
      </div>

      <nav>
        <ul className="lista">
          <li><NavLink to="/" end>Home</NavLink></li>
          <li><NavLink to="/productos">Productos</NavLink></li>
          <li><NavLink to="/ofertas">Ofertas</NavLink></li>
          <li><NavLink to="/nosotros">Nosotros</NavLink></li>
          <li><NavLink to="/contacto">Contacto</NavLink></li>
          <li><NavLink to="/blogs">Blog</NavLink></li>
          {isAdmin && <li><NavLink to="/admin">Admin</NavLink></li>}
        </ul>
      </nav>

      <nav>
        <ul className="login_register">
          {!isLogged ? (
            <>
              <li><NavLink to="/login">Iniciar sesión</NavLink></li>
              <li><NavLink to="/registro">Registrar usuario</NavLink></li>
            </>
          ) : (
            <>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ color: '#7c3a2d' }}>Bienvenido {userName}</span>
              </li>
              <li>
                <NavLink to="/carrito" className="cart" aria-label={`Carrito con ${cartCount} productos`}>
                  🛒 Carrito
                  <span className="cart-badge" aria-hidden="true">{cartCount}</span>
                </NavLink>
              </li>
              <li>
                <button onClick={handleLogout} className="btn-header">
                  Cerrar sesión
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
