/**
 * Archivo: Registro.logic.spec.js  
 * Pruebas unitarias con Jasmine para la lógica de validación 
 * del componente de Registro.
 */

describe('RegistroLogic', function() {

  // Se accede a la lógica desde el objeto window  
  var logic = window.RegistroLogic;

  // Test 1: Caso de registro exitoso (entrada válida) 
  it('debe validar un registro exitoso sin descuentos ni mensajes especiales', function() {
    // Comentario: Prueba un usuario estándar sin condiciones especiales.  
    var datos = {
      nombre: 'Usuario Valido',
      email: 'test@mail.com',
      edad: '30',
      clave1: 'password123',
      clave2: 'password123',
      codigo: '',
      fechaNacimiento: '1990-01-01'
    };
    var mockDate = new Date('2025-10-27'); // Fecha cualquiera que no es cumpleaños
    
    var resultado = logic.validarRegistro(datos, mockDate);
    
    expect(resultado.exito).toBe(true);
    expect(resultado.errores.length).toBe(0);
    expect(resultado.descuento).toBe('');
    expect(resultado.correo).toBe('');
    expect(resultado.edadNum).toBe(30);
  });

  // Test 2: Caso de registro con múltiples errores (entrada incorrecta/nula) 
  it('debe devolver una lista de errores para datos inválidos', function() {
    // Comentario: Prueba múltiples validaciones fallidas a la vez.  
    var datos = {
      nombre: ' ', // Error: vacío
      email: 'mail-invalido', // Error: sin @
      edad: '0', // Error: edad <= 0
      clave1: '123', // Error: menos de 6 caracteres
      clave2: 'abc' // Error: no coinciden
    };
    var mockDate = new Date('2025-10-27');
    
    var resultado = logic.validarRegistro(datos, mockDate);
    
    expect(resultado.exito).toBe(false);
    expect(resultado.errores.length).toBe(5);
    // Verificar que los mensajes de error específicos estén presentes
    expect(resultado.errores).toContain('El nombre no puede estar vacío.');
    expect(resultado.errores).toContain('Ingrese una edad válida.');
    expect(resultado.errores).toContain('La contraseña debe tener al menos 6 caracteres.');
    expect(resultado.errores).toContain('Las contraseñas no coinciden.');
    expect(resultado.errores).toContain('El correo electrónico no es válido.');
  });

  // Test 3: Caso borde - Descuento por edad (>= 50) 
  it('debe aplicar descuento del 50% para edad >= 50', function() {
    // Comentario: Prueba la lógica de descuento por edad.  
    var datos = {
      nombre: 'Usuario Senior',
      email: 'senior@mail.com',
      edad: '50', // Caso borde: 50 exacto
      clave1: 'password123',
      clave2: 'password123',
      codigo: ''
    };
    var mockDate = new Date('2025-10-27');
    
    var resultado = logic.validarRegistro(datos, mockDate);
    
    expect(resultado.exito).toBe(true);
    expect(resultado.descuento).toContain('50% de descuento');
  });

  // Test 4: Caso borde - Descuento por código "FELICES50"
  it('debe aplicar descuento del 10% por código FELICES50 (insensible a mayúsculas)', function() {
    // Comentario: Prueba la lógica del código de descuento.  
    var datos = {
      nombre: 'Usuario Con Codigo',
      email: 'codigo@mail.com',
      edad: '25',
      clave1: 'password123',
      clave2: 'password123',
      codigo: 'felices50' // Prueba con minúsculas
    };
    var mockDate = new Date('2025-10-27');
    
    var resultado = logic.validarRegistro(datos, mockDate);
    
    expect(resultado.exito).toBe(true);
    expect(resultado.descuento).toContain('10% de descuento de por vida');
  });

  // Test 5: Caso borde - Lógica de estudiante Duoc (Sin cumpleaños)
  it('debe dar bienvenida a estudiante de Duoc (@duocuc.cl)', function() {
    // Comentario: Prueba el email @duocuc.cl cuando NO es su cumpleaños.  
    var datos = {
      nombre: 'Estudiante Duoc',
      email: 'estudiante@duocuc.cl',
      edad: '20',
      clave1: 'password123',
      clave2: 'password123',
      fechaNacimiento: '2000-05-10'
    };
    // Mock: 27 de Octubre. Cumpleaños: 10 de Mayo.
    var mockDate = new Date('2025-10-27T12:00:00Z');
    
    var resultado = logic.validarRegistro(datos, mockDate);
    
    expect(resultado.exito).toBe(true);
    expect(resultado.correo).toContain('Bienvenido, estudiante de Duoc UC');
    expect(resultado.correo).not.toContain('Feliz cumpleaños');
  });

  // Test 6: Caso borde - Lógica de estudiante Duoc (EN su cumpleaños)
  it('debe felicitar al estudiante de Duoc en su cumpleaños', function() {
    // Comentario: Prueba el email @duocuc.cl cuando SÍ es su cumpleaños.  
    var datos = {
      nombre: 'Estudiante Cumple',
      email: 'estudiante.feliz@duocuc.cl',
      edad: '21',
      clave1: 'password123',
      clave2: 'password123',
      fechaNacimiento: '2004-10-27' // Cumpleaños hoy
    };
    // Mock: 27 de Octubre. Cumpleaños: 27 de Octubre.
    var mockDate = new Date('2025-10-27T12:00:00Z');
    
    var resultado = logic.validarRegistro(datos, mockDate);
    
    expect(resultado.exito).toBe(true);
    expect(resultado.correo).toContain('¡Feliz cumpleaños!');
    expect(resultado.correo).toContain('tienes una torta gratis');
  });
    
  // Test 7: Caso borde - Lógica de profesor Duoc
  it('debe dar bienvenida a profesor de Duoc (@profesor.duoc.cl)', function() {
    // Comentario: Prueba el email @profesor.duoc.cl.  
    var datos = {
      nombre: 'Profesor Duoc',
      email: 'profesor@profesor.duoc.cl',
      edad: '45',
      clave1: 'password123',
      clave2: 'password123'
    };
    var mockDate = new Date('2025-10-27');
    
    var resultado = logic.validarRegistro(datos, mockDate);
    
    expect(resultado.exito).toBe(true);
    expect(resultado.correo).toContain('Bienvenido, profesor de Duoc UC');
  });

});