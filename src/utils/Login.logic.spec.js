/**
 * 🧪 Archivo de pruebas Jasmine + Karma para Login.logic.js  
 * Ejecutar con: npm run test:karma  
 */

describe('Login.logic.js', function () {
  
  // Acceder a la lógica sin destructuración
  var logic = window.LoginLogic;

  // --- Declaración de Mocks ---
  var mockNavigate;
  var mockSetMsg;
  var mockLocation;
  var mockEvent;
  var mockLocalStorage;

  // --- Configuración (beforeEach) ---
  beforeEach(function () {
    // 💬   Mock de las dependencias (hooks de React, evento, etc.)
    mockNavigate = jasmine.createSpy('navigate');
    mockSetMsg = jasmine.createSpy('setMsg');
    
    mockEvent = {
      preventDefault: jasmine.createSpy('preventDefault'),
    };

    // Mock de location (para redirigir)
    mockLocation = {
      state: null, // Caso base: redirige a '/'
    };

    // 💬   Mockear localStorage para aislar la prueba
    mockLocalStorage = {
      getItem: (key) => mockLocalStorage[key] || null,
      setItem: (key, value) => (mockLocalStorage[key] = value),
      clear: () => (mockLocalStorage = {}),
    };
    
    // Espiar el localStorage real y reemplazarlo por el mock
    spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
    spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
    spyOn(window, 'dispatchEvent'); // Espiar el evento global

    // Limpieza antes de cada test
    mockLocalStorage.clear();
    mockNavigate.calls.reset();
    mockSetMsg.calls.reset();
    mockEvent.preventDefault.calls.reset();
    window.dispatchEvent.calls.reset();
  });

  // --- Pruebas para handleLoginSubmit ---
  describe('handleLoginSubmit', function () {
    
    var usuariosPrueba = [
      { email: 'test@test.com', password: '123', nombre: 'UsuarioTest' },
      { email: 'user@domain.com', password: 'abc', nombre: 'User' },
    ];

    /**
     * 💬  
     * Test 1 (Entrada Válida):  
     * Debe loguear al usuario si las credenciales son correctas y redirigir a '/'.
     */
    it('Test 1: debe loguear al usuario y redirigir al inicio (/)', function () {
      // Setup: Guardar usuarios de prueba en el mock de localStorage
      localStorage.setItem('usuarios', JSON.stringify(usuariosPrueba));

      // Ejecutar la lógica  
      logic.handleLoginSubmit(
        mockEvent,
        'test@test.com', // Email correcto
        '123',           // Password correcto
        mockLocation,    // location.state es null
        mockNavigate,
        mockSetMsg
      );

      // Verificaciones
      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
      expect(mockSetMsg).toHaveBeenCalledWith(''); // Limpia mensajes al inicio
      expect(mockSetMsg).not.toHaveBeenCalledWith('Correo o contraseña incorrectos.');
      expect(localStorage.setItem).toHaveBeenCalledWith('isLoggedIn', 'true');
      expect(localStorage.setItem).toHaveBeenCalledWith('userName', 'UsuarioTest');
      expect(localStorage.setItem).toHaveBeenCalledWith('userEmail', 'test@test.com');
      expect(window.dispatchEvent).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/'); // Redirige a '/'
    });

    /**
     * 💬  
     * Test 2 (Entrada Incorrecta):  
     * Debe mostrar un mensaje de error si la contraseña es incorrecta.
     */
    it('Test 2: debe mostrar error si la contraseña es incorrecta', function () {
      // Setup
      localStorage.setItem('usuarios', JSON.stringify(usuariosPrueba));

      // Ejecutar la lógica
      logic.handleLoginSubmit(
        mockEvent,
        'test@test.com',
        'PASSWORD_INCORRECTA', // Password incorrecto
        mockLocation,
        mockNavigate,
        mockSetMsg
      );

      // Verificaciones
      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
      expect(mockSetMsg).toHaveBeenCalledWith('Correo o contraseña incorrectos.');
      expect(localStorage.setItem).not.toHaveBeenCalledWith('isLoggedIn', 'true'); // No debe loguearse
      expect(mockNavigate).not.toHaveBeenCalled(); // No debe redirigir
    });

    /**
     * 💬  
     * Test 3 (Caso Borde):  
     * Debe redirigir a la ruta previa (location.state.from) si existe.
     */
    it('Test 3: debe redirigir a la ruta "from" si existe en location.state', function () {
      // Setup
      localStorage.setItem('usuarios', JSON.stringify(usuariosPrueba));
      mockLocation.state = { from: '/perfil' }; // Definir ruta previa

      // Ejecutar la lógica
      logic.handleLoginSubmit(
        mockEvent,
        'user@domain.com',
        'abc',
        mockLocation, // location.state tiene 'from'
        mockNavigate,
        mockSetMsg
      );

      // Verificaciones
      expect(mockNavigate).toHaveBeenCalledWith('/perfil'); // Debe redirigir a la ruta previa
    });

    /**
     * 💬  
     * Test 4 (Caso Borde - Lógica original):  
     * Debe permitir el login si no hay usuarios en localStorage (modo prueba).
     */
    it('Test 4: debe permitir login de prueba si localStorage de usuarios está vacío', function () {
      // Setup: No se añaden usuarios al localStorage (está vacío por el beforeEach)

      // Ejecutar la lógica
      logic.handleLoginSubmit(
        mockEvent,
        'nuevo@usuario.com', // Email de prueba
        'pass123',
        mockLocation,
        mockNavigate,
        mockSetMsg
      );

      // Verificaciones
      expect(mockSetMsg).not.toHaveBeenCalledWith('Correo o contraseña incorrectos.');
      expect(localStorage.setItem).toHaveBeenCalledWith('isLoggedIn', 'true');
      //  Verifica que tome el nombre del email
      expect(localStorage.setItem).toHaveBeenCalledWith('userName', 'nuevo'); 
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});