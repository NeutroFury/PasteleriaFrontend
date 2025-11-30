import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import "../utils/Registro.logic.js";

// ============================================
// SISTEMA DE REGISTRO - PASTELERÍA MIL SABORES (REACT)
// ============================================

export default function Registro() {
  // 1. Estados para todos los campos del formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [edad, setEdad] = useState('');
  const [clave1, setClave1] = useState('');
  const [clave2, setClave2] = useState('');
  const [codigo, setCodigo] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 2. Estado para manejar los mensajes de respuesta (errores, éxito, descuentos)
  const [mensajes, setMensajes] = useState({
    errores: [],
    descuento: '',
    correo: '',
    exito: false,
  });

  const navigate = useNavigate();

    // 3. Función principal para manejar el envío del formulario
    const handleSubmit = async (e) => {
      e.preventDefault();

      // Usar la lógica pura de validación
      const resultado = window.RegistroLogic.validarRegistro({
        nombre, email, edad, clave1, clave2, codigo, fechaNacimiento
      }, new Date());

      if (resultado.errores.length > 0) {
        // Si hay errores, actualizamos el estado de mensajes
        setMensajes({ 
          errores: resultado.errores, 
          descuento: resultado.descuento, 
          correo: resultado.correo, 
          exito: false 
        });
      } else {
        // Registro exitoso - enviar al backend
        setIsLoading(true);
        
        try {
          console.log('📝 Registrando usuario en el backend...');
          
          // Preparar payload según el formato del backend
          const payload = {
            nombre: nombre,          // Nombre completo del usuario
            nombreUsuario: email,    // Usar email como nombreUsuario
            contrasena: clave1,      // La contraseña ingresada
            rol: "cliente"           // Rol por defecto
          };
          
          console.log('📤 Enviando:', payload);
          
          // Llamar al endpoint de registro del backend
          const response = await api.register(payload);
          
          console.log('✅ Usuario registrado:', response);
          
          // Mostrar mensajes de éxito
          setMensajes({ 
            errores: [], 
            descuento: resultado.descuento, 
            correo: resultado.correo, 
            exito: true 
          });

          // Guardar también en localStorage como fallback (opcional)
          let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
          usuarios.push({ nombre, email, password: clave1, edad: resultado.edadNum, fechaNacimiento });
          localStorage.setItem("usuarios", JSON.stringify(usuarios));

          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            navigate("/login"); 
          }, 3000);
          
        } catch (error) {
          console.error('❌ Error al registrar:', error);
          
          let errorMsg = 'Error al registrar usuario';
          
          if (error.status === 400) {
            errorMsg = 'El usuario ya existe o los datos son inválidos';
          } else if (error.status === 500) {
            errorMsg = 'Error en el servidor';
          } else if (error.message) {
            errorMsg = error.message;
          }
          
          setMensajes({
            errores: [errorMsg],
            descuento: '',
            correo: '',
            exito: false
          });
        } finally {
          setIsLoading(false);
        }
      }
  };

  // --- Función para renderizar los mensajes de respuesta ---
  const renderMessages = () => {
    // Renderizar Errores
    if (mensajes.errores.length > 0) {
      return (
        <div className="mi-alerta-error">
          <ul>
            {mensajes.errores.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      );
    }

    // Renderizar Éxito, Correo y Descuentos (usando dangerouslySetInnerHTML para renderizar el HTML del JS original)
    if (mensajes.exito) {
      return (
        <>
          <div dangerouslySetInnerHTML={{ __html: mensajes.correo }} />
          <div dangerouslySetInnerHTML={{ __html: mensajes.descuento }} />
          <div className="mi-alerta-exito ">✅ Registro exitoso. Redirigiendo...</div>
        </>
      );
    }
    
    // Si no hay errores y no es éxito final, mostrar mensajes temporales de descuento/correo si existen
    if (mensajes.correo || mensajes.descuento) {
         return (
             <>
                {mensajes.correo && <div dangerouslySetInnerHTML={{ __html: mensajes.correo }} />}
                {mensajes.descuento && <div dangerouslySetInnerHTML={{ __html: mensajes.descuento }} />}
             </>
         );
    }
    
    return null;
  };

  return(
    <>
      <main>
        <div className="login-container">
          <h2>Registrar Usuario</h2>
          {/* 7. Asignar el manejador de envío al formulario */}
          <form id="formRegistro" onSubmit={handleSubmit}>
            
            {/* 8. Enlazar todos los inputs al estado */}
            <div className="form-group">
              <label htmlFor="nombre">Nombre completo</label>
              <input type="text" id="nombre" className="form-control" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="register-email">Correo electrónico</label>
              <input type="email" id="register-email" className="form-control" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="edad">Edad</label>
              <input type="number" id="edad" className="form-control" required value={edad} onChange={(e) => setEdad(e.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="clave1">Contraseña</label>
              <input type="password" id="clave1" className="form-control" required value={clave1} onChange={(e) => setClave1(e.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="clave2">Confirmar contraseña</label>
              <input type="password" id="clave2" className="form-control" required value={clave2} onChange={(e) => setClave2(e.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="codigo">Código de descuento (Opcional)</label>
              <input type="text" id="codigo" className="form-control" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="fechaNacimiento">Fecha de nacimiento (Opcional)</label>
              <input type="date" id="fechaNacimiento" className="form-control" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} />
            </div>

            <button type="submit" className="colorBoton1" disabled={isLoading}>
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>

          {/* 9. Mostrar los mensajes renderizados por la función renderMessages */}
          <div id="mensajes">
            {renderMessages()}
          </div>
        </div>
      </main>
    </>
  );
}