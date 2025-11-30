document.addEventListener("DOMContentLoaded", async () => {
  // Importar api dinámicamente
  let api;
  try {
    api = (await import('../services/api.js')).default;
  } catch (err) {
    console.error('Error importando api', err);
  }

  // Verificar si hay un token válido
  const token = api?.getToken?.();
  const loggedIn = !!token;
  
  const loginLink = document.getElementById("loginLink");
  const registerLink = document.getElementById("registerLink");
  const logoutLink = document.getElementById("logoutLink");
  const cartLink = document.getElementById("cartLink");
  const userInfo = document.getElementById("userInfo");
  const userName = document.getElementById("userEmail");

  if (loggedIn) {
    // Usuario logueado - obtener info del usuario desde backend
    try {
      const user = await api.me();
      const displayName = user?.nombre || user?.username || user?.email || 'Usuario';
      
      if (userName) userName.textContent = displayName;
      if (loginLink) loginLink.style.display = "none";
      if (registerLink) registerLink.style.display = "none";
      if (logoutLink) logoutLink.style.display = "block";
      if (cartLink) cartLink.style.display = "block";
      if (userInfo) userInfo.style.display = "block";
    } catch (err) {
      // Token inválido - comportarse como no logueado
      console.error('Error obteniendo info usuario', err);
      if (loginLink) loginLink.style.display = "block";
      if (registerLink) registerLink.style.display = "block";
      if (logoutLink) logoutLink.style.display = "none";
      if (cartLink) cartLink.style.display = "none";
      if (userInfo) userInfo.style.display = "none";
    }
  } else {
    // No logueado
    if (loginLink) loginLink.style.display = "block";
    if (registerLink) registerLink.style.display = "block";
    if (logoutLink) logoutLink.style.display = "none";
    if (cartLink) cartLink.style.display = "none";
    if (userInfo) userInfo.style.display = "none";
  }

  // Lógica para cerrar sesión
  document.getElementById("logoutLink")?.addEventListener("click", async () => {
    // Eliminar solo el token (api.js maneja esto)
    if (api?.logout) {
      await api.logout();
    } else {
      api?.setToken?.(null);
    }
    
    window.location.href = "login.html";
  });
});
