import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '../services/api';

/**
 * Componente para proteger rutas que requieren autenticación
 * y opcionalmente verificar roles específicos
 */
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userInfo = await api.me();
        
        setIsAuth(true);
        
        // Verificar si el usuario tiene rol de admin
        // El backend devuelve authorities: [{ authority: "ROLE_ADMIN" }] (formato Spring Security)
        const authorities = userInfo?.authorities || [];
        const userRoles = userInfo?.roles || [];
        const userRole = userInfo?.rol || userInfo?.role || '';
        
        // Verificar en authorities (formato Spring Security)
        const hasAdminInAuthorities = authorities.some(
          auth => auth?.authority === 'ROLE_ADMIN'
        );
        
        // Verificar en roles array
        const hasAdminInRoles = userRoles.includes('ROLE_ADMIN');
        
        // Verificar en rol simple
        const hasAdminInRole = 
          userRole === 'ROLE_ADMIN' ||
          String(userRole).toUpperCase() === 'ROLE_ADMIN';
        
        const hasAdminRole = hasAdminInAuthorities || hasAdminInRoles || hasAdminInRole;
        
        console.log('🔍 Verificando rol admin:', {
          userRole,
          authorities,
          hasAdminInAuthorities,
          hasAdminInRoles,
          hasAdminInRole,
          hasAdminRole
        });
        
        setIsAdmin(hasAdminRole);
        
      } catch (error) {
        console.error('❌ Error verificando autenticación:', error);
        setIsAuth(false);
        setIsAdmin(false);
        
        // Si el token es inválido, limpiarlo
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('isLoggedIn');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f9f4f0'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#7c3a2d', marginBottom: '1rem' }}>Verificando acceso...</h2>
          <p style={{ color: '#6c757d' }}>Por favor espera</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Si requiere admin pero no lo es, mostrar acceso denegado
  if (requireAdmin && !isAdmin) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f9f4f0'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          maxWidth: '500px'
        }}>
          <h2 style={{ color: '#c82333', marginBottom: '1rem' }}>⛔ Acceso Denegado</h2>
          <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
            No tienes permisos de administrador para acceder a esta sección.
          </p>
          <a href="/" style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: '#7c3a2d',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 600
          }}>
            Volver al Inicio
          </a>
        </div>
      </div>
    );
  }

  // Todo bien, renderizar el componente hijo
  return children;
}
