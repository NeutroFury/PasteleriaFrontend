/**
 * Pruebas Jasmine (Karma) para AdminPerfil.logic.js
 */
describe('AdminPerfil.logic', function() {

  // Referencia a la lógica bajo prueba, usando el namespace de window
  const logic = window.AdminPerfilLogic;

  // --- Pruebas para getProfileData ---
  describe('getProfileData', function() {

    // Mock de localStorage antes de cada prueba
    beforeEach(function() {
      // Configuramos un espía en localStorage.getItem
      // .and.callFake() nos permite simular su comportamiento
      spyOn(localStorage, 'getItem').and.callFake(function(key) {
        // Simulamos una base de datos de localStorage
        const store = {
          'userName': 'Usuario de Prueba',
          'userEmail': 'test@example.com'
        };
        // Retornamos el valor o null si no existe
        return store[key] || null;
      });
    });

    /**
     * Test 1: Entrada válida 
     * Verifica que la función retorna los datos correctos cuando
     * 'userName' y 'userEmail' existen en localStorage.
     */
    it('debería retornar el nombre y email desde localStorage si existen', function() {
      const data = logic.getProfileData();
      expect(data.name).toBe('Usuario de Prueba');
      expect(data.email).toBe('test@example.com');
      expect(localStorage.getItem).toHaveBeenCalledWith('userName');
      expect(localStorage.getItem).toHaveBeenCalledWith('userEmail');
    });

    /**
     * Test 2: Nula/Incorrecta 
     * Verifica que la función retorna los valores por defecto
     * ('Admin' y '') si localStorage no tiene las claves.
     */
    it('debería retornar valores por defecto si los datos no existen en localStorage', function() {
      // Sobrescribimos el mock para que siempre retorne null
      localStorage.getItem.and.returnValue(null);
      
      const data = logic.getProfileData();
      expect(data.name).toBe('Admin');
      expect(data.email).toBe('');
    });

    /**
     * Test 3: Caso Borde 
     * Verifica qué pasa si solo uno de los valores (userName) existe,
     * pero el otro (userEmail) es nulo.
     */
    it('debería retornar el nombre y un email vacío por defecto si solo existe el nombre', function() {
      // Sobrescribimos el mock para este caso borde
      localStorage.getItem.and.callFake(function(key) {
        if (key === 'userName') {
          return 'Solo Nombre';
        }
        return null; // userEmail será null
      });
      
      const data = logic.getProfileData();
      expect(data.name).toBe('Solo Nombre');
      expect(data.email).toBe('');
    });
  });

  // --- Pruebas para handleEditClick ---
  describe('handleEditClick', function() {

    // Mock de window.alert antes de cada prueba
    beforeEach(function() {
      spyOn(window, 'alert');
    });

    /**
     * Test 1: Llamada válida
     * Verifica que la función llama a window.alert con el
     * mensaje esperado.
     */
    it('debería llamar a window.alert con el mensaje correcto', function() {
      logic.handleEditClick();
      expect(window.alert).toHaveBeenCalledWith('Edición de perfil pendiente');
    });
  });

});