/**
 * Archivo: Registro.logic.js
 * * Contiene la lógica de negocio pura para el componente de Registro.
 * Esta lógica está diseñada para ser testeable de forma aislada 
 * y se adjunta al objeto 'window' para ser accesible 
 * globalmente por el componente y las pruebas de Karma.  
 */

// Se adjunta a 'window' para evitar problemas de 'import' en Karma 
// y seguir los requisitos.  
window.RegistroLogic = {

  /**
   * Valida los datos de entrada del formulario de registro.
   * Esta función es lógica pura, separada de React. 
   * * @param {object} data - Objeto con los datos del formulario.
   * @param {string} data.nombre
   * @param {string} data.email
   * @param {string} data.edad - (viene como string del input)
   * @param {string} data.clave1
   * @param {string} data.clave2
   * @param {string} data.codigo - (Código de descuento opcional)
   * @param {string} data.fechaNacimiento - (YYYY-MM-DD, opcional)
   * @param {Date} today - La fecha actual (se inyecta para mockear en tests).
   * @returns {object} - Objeto con los resultados de la validación.
   */
  validarRegistro: function(data, today) {
    
    // Valores por defecto para evitar 'undefined'
    var nombre = data.nombre || "";
    var email = data.email || "";
    var edad = data.edad || "";
    var clave1 = data.clave1 || "";
    var clave2 = data.clave2 || "";
    var codigo = data.codigo || "";
    var fechaNacimiento = data.fechaNacimiento || "";
    
    // Si no se provee 'today' para testing, usar la fecha real.
    var hoy = today || new Date();
    
    // Inicializar resultados
    var newErrores = [];
    var newMensajeDescuento = "";
    var newMensajeCorreo = "";
    var registroExitoso = false;

    // --- Lógica de Validación (extraída del componente) --- 
    
    // 1. Validar nombre
    if (nombre.trim() === "") {
      newErrores.push("El nombre no puede estar vacío.");
    }

    // 2. Validar edad y aplicar descuento
    var edadNum = parseInt(edad, 10);
    if (isNaN(edadNum) || edadNum <= 0) {
      newErrores.push("Ingrese una edad válida.");
    } else if (edadNum >= 50) {
      newMensajeDescuento += '<div class="mi-alerta-descuento">Obtuviste un 50% de descuento</div>';
    }

    // 3. Validar contraseña (mínimo 6 caracteres)
    if (clave1.length < 6) {
      newErrores.push("La contraseña debe tener al menos 6 caracteres.");
    }

    // 4. Confirmar que las contraseñas coincidan
    if (clave1 !== clave2) {
      newErrores.push("Las contraseñas no coinciden.");
    }

    // 5. Validar email y lógica especial para Duoc UC
    if (!email.includes("@")) {
      newErrores.push("El correo electrónico no es válido.");
      
    } else if (email.endsWith("@duocuc.cl")) {
      // Lógica para estudiantes de Duoc
      if (fechaNacimiento) {
        // Aseguramos que la fecha se parsea correctamente (YYYY-MM-DD)
        var parts = fechaNacimiento.split("-");
        
        if (parts.length === 3) {
            // var anio = parseInt(parts[0], 10); // No se usa
            var mes = parseInt(parts[1], 10);
            var dia = parseInt(parts[2], 10);
            
            // Comparamos el día y el mes actual con el de nacimiento
            if (hoy.getDate() === dia && (hoy.getMonth() + 1) === mes) {
              newMensajeCorreo = '<div class="mi-alerta-exito"> 🎂  ¡Feliz cumpleaños! Como estudiante de Duoc, ¡tienes una torta gratis!</div>';
            } else {
              newMensajeCorreo = '<div class="mi-alerta-exito"> ✅  Bienvenido, estudiante de Duoc UC</div>';
            }
        } else {
            // Fallback si la fecha tiene un formato inesperado
             newMensajeCorreo = '<div class="mi-alerta-exito"> ✅  Bienvenido, estudiante de Duoc UC</div>';
        }
      } else {
        // Si es Duoc pero no ingresó fecha de nacimiento
        newMensajeCorreo = '<div class="mi-alerta-exito"> ✅  Bienvenido, estudiante de Duoc UC</div>';
      }
      
    } else if (email.endsWith("@profesor.duoc.cl")) {
      // Lógica para profesores de Duoc
      newMensajeCorreo = '<div class="mi-alerta-exito"> ✅  Bienvenido, profesor de Duoc UC</div>';
    }

    // 6. Validar código de descuento especial
    if (codigo.toUpperCase() === "FELICES50") {
      newMensajeDescuento += '<div class="mi-alerta-descuento">¡Obtuviste un 10% de descuento de por vida!</div>';
    }
    
    // --- Procesamiento de Resultados ---
    
    // Si no hubo errores, el registro es exitoso
    if (newErrores.length === 0) {
      registroExitoso = true;
    }

    // Devolver el estado de los mensajes y el éxito
    return {
      errores: newErrores,
      descuento: newMensajeDescuento,
      correo: newMensajeCorreo,
      exito: registroExitoso,
      // Devolvemos la edad procesada para que el componente la guarde
      edadNum: isNaN(edadNum) ? 0 : edadNum 
    };
  }
};