// ============================================
// SISTEMA DE LOGIN - PASTELERÍA MIL SABORES
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  // Obtener elementos del formulario de login
  const formLogin = document.getElementById("formLogin");
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-clave");
  const errorMsg = document.getElementById("error-msg");

  // Manejar el envío del formulario
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault(); // Evitar recarga de página

    // Obtener valores del formulario
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Obtener usuarios registrados del localStorage
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    // Buscar usuario con email y contraseña correctos
    const usuario = usuarios.find(u => u.email === email && u.password === password);

    if (usuario) {
      // Login exitoso: crear sesión y redirigir al home
      localStorage.setItem("loggedIn", JSON.stringify({ nombre: usuario.nombre, email: usuario.email }));
      window.location.href = "index.html";
    } else {
      // Login fallido: mostrar mensaje de error
      errorMsg.style.display = "block";
    }
  });

  // Si ya está logueado, redirigir al home
  const loggedIn = JSON.parse(localStorage.getItem("loggedIn"));
  if (loggedIn) {
    window.location.href = "index.html";
  }
});
