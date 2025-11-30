// ============================================
// SISTEMA DE REGISTRO - PASTELERÍA MIL SABORES
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  // Obtener elementos del formulario de registro
  const formRegistro = document.getElementById("formRegistro");
  const emailInput = document.getElementById("register-email");
  const passwordInput = document.getElementById("register-clave");
  const errorMsg = document.getElementById("error-msg");

  // Obtener todos los campos del formulario
  const nombreInput = document.getElementById("nombre");
  const edadInput = document.getElementById("edad");
  const clave1Input = document.getElementById("clave1");
  const clave2Input = document.getElementById("clave2");
  const codigoInput = document.getElementById("codigo");
  const fechaNacimientoInput = document.getElementById("fechaNacimiento");
  const mensajesDiv = document.getElementById("mensajes");

  // Obtener usuarios existentes del localStorage
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  // Manejar el envío del formulario de registro
  formRegistro.addEventListener("submit", (e) => {
    e.preventDefault(); // Evitar recarga de página

    // Obtener valores del formulario
    const nombre = nombreInput.value.trim();
    const email = emailInput.value.trim();
    const edad = parseInt(edadInput.value);
    const clave1 = clave1Input.value.trim();
    const clave2 = clave2Input.value.trim();
    const codigo = codigoInput.value.trim();
    const fechaNacimiento = fechaNacimientoInput.value;

    // Variables para manejar mensajes de respuesta
    let errores = [];
    let mensajeDescuento = "";
    let mensajeCorreo = "";

    // Validar nombre
    if (nombre === "") {
      errores.push("El nombre no puede estar vacío.");
    }

    // Validar email y aplicar lógica especial para Duoc UC
    if (!email.includes("@")) {
      errores.push("El correo electrónico no es válido.");
    } else if (email.endsWith("@duocuc.cl")) {
      // Lógica especial para estudiantes de Duoc UC
      if (fechaNacimiento) {
        let hoy = new Date();
        let [anio, mes, dia] = fechaNacimiento.split("-");
        if (hoy.getDate() === parseInt(dia, 10) && (hoy.getMonth() + 1) === parseInt(mes, 10)) {
          mensajeCorreo = `<div class="mi-alerta-exito">🎂 ¡Feliz cumpleaños! Como estudiante de Duoc, ¡tienes una torta gratis!</div>`;
        } else {
          mensajeCorreo = `<div class="mi-alerta-exito">✅ Bienvenido, estudiante de Duoc UC</div>`;
        }
      } else {
        mensajeCorreo = `<div class="mi-alerta-exito">✅ Bienvenido, estudiante de Duoc UC</div>`;
      }
    } else if (email.endsWith("@profesor.duoc.cl")) {
      // Lógica especial para profesores de Duoc UC
      mensajeCorreo = `<div class="mi-alerta-exito">✅ Bienvenido, profesor de Duoc UC</div>`;
    }

    // Validar edad y aplicar descuento para mayores de 50 años
    if (isNaN(edad) || edad <= 0) {
      errores.push("Ingrese una edad válida.");
    } else if (edad >= 50) {
      mensajeDescuento = `<div class="mi-alerta-descuento">Obtuviste un 50% de descuento</div>`;
    }

    // Validar contraseña (mínimo 6 caracteres)
    if (clave1.length < 6) {
      errores.push("La contraseña debe tener al menos 6 caracteres.");
    }

    // Confirmar que las contraseñas coincidan
    if (clave1 !== clave2) {
      errores.push("Las contraseñas no coinciden.");
    }

    // Limpiar mensajes anteriores
    mensajesDiv.innerHTML = "";

    // Validar código de descuento especial
    if (codigo.toUpperCase() === "FELICES50") {
      mensajeDescuento += `<div class="mi-alerta-descuento">¡Obtuviste un 10% de descuento de por vida!</div>`;
    }

    // Procesar el resultado del registro
    if (errores.length > 0) {
      // Mostrar errores de validación
      mensajesDiv.innerHTML = `<div class="mi-alerta-error"><ul><li>${errores.join(
        "</li><li>"
      )}</li></ul></div>`;
    } else {
      // Registro exitoso: mostrar mensajes de bienvenida y descuentos
      mensajesDiv.innerHTML = `${mensajeCorreo}${mensajeDescuento}<div class="mi-alerta-exito ">✅ Registro exitoso</div>`;

      // Guardar nuevo usuario en localStorage
      usuarios.push({ nombre, email, password: clave1 });
      localStorage.setItem("usuarios", JSON.stringify(usuarios));

      // Crear sesión automática para el usuario registrado
      localStorage.setItem("loggedIn", JSON.stringify({ nombre, email }));

      // Redirigir al login después de 15 segundos
      setTimeout(function () {
        window.location.href = "login.html";
      }, 3000);
    }
  });
});
