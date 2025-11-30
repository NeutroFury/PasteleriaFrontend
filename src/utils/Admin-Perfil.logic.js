/**
 * Lógica pura para el componente AdminPerfil.
 * Namespace: window.AdminPerfilLogic
 */

// Inicializa el namespace de forma segura para evitar redeclaraciones
window.AdminPerfilLogic = window.AdminPerfilLogic || {};

/**
 * Obtiene los datos del perfil del administrador desde localStorage.
 * Si no se encuentran valores, retorna valores por defecto ('Admin' y '').
 * @returns {object} Un objeto con las claves 'name' y 'email'.
 */
window.AdminPerfilLogic.getProfileData = function() {
  // Lógica de obtención de datos 
  const name = localStorage.getItem('userName') || 'Admin';
  const email = localStorage.getItem('userEmail') || '';
  return { name, email };
};

/**
 * Manejador para el evento onClick del botón 'Editar'.
 * Muestra una alerta temporal de funcionalidad pendiente. 
 */
window.AdminPerfilLogic.handleEditClick = function() {
  alert('Edición de perfil pendiente');
};