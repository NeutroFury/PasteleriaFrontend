// =================================================================
// Pruebas Unitarias (Jasmine) para: AdminLogic
// Ubicación: src/utils/Admin.logic.spec.js
// =================================================================

describe('AdminLogic', function() {

  // Pruebas para la función de formato de moneda (CLP)  
  describe('CLP', function() {

    // Prueba de caso válido  
    it('debe formatear un número estándar correctamente', function() {
      const result = window.AdminLogic.CLP(1500000);
      expect(result).toBe('$1.500.000');
    });

    // Prueba de caso borde (cero)  
    it('debe formatear el número 0 correctamente', function() {
      const result = window.AdminLogic.CLP(0);
      expect(result).toBe('$0');
    });

    // Prueba de caso nulo/incorrecto (string no numérico)  
    it('debe manejar strings no numéricos y retornar $0', function() {
      const result = window.AdminLogic.CLP('hola');
      expect(result).toBe('$0');
    });

    // Prueba de caso nulo/incorrecto (null y undefined)  
    it('debe manejar null y undefined retornando $0', function() {
      const resultNull = window.AdminLogic.CLP(null);
      expect(resultNull).toBe('$0');
      const resultUndefined = window.AdminLogic.CLP(undefined);
      expect(resultUndefined).toBe('$0');
    });
  });

  // Pruebas para la función de actualización de estadísticas (refreshStats)  
  describe('refreshStats', function() {

    var mockServices;
    var mockSetters;

    // Configuración antes de cada prueba
    beforeEach(function() {
      // Mock de servicios
      mockServices = {
        productService: {
          getAll: jasmine.createSpy('getAllProducts').and.returnValue([{ id: 1 }, { id: 2 }]) // 2 productos
        },
        userService: {
          getAll: jasmine.createSpy('getAllUsers').and.returnValue([{ id: 'u1' }]) // 1 usuario
        },
        orderService: {
          getAll: jasmine.createSpy('getAllOrders').and.returnValue([
            { estado: 'pagado', total: 10000 },
            { estado: 'pagado', total: 5000 },
            { estado: 'pendiente', total: 20000 },
            { estado: 'pagado', total: 'texto' }, // total inválido
            { estado: 'pagado' } // total faltante
          ]), // 5 pedidos, 3 pagados (10k + 5k + 0 + 0)
          dedupe: jasmine.createSpy('dedupe')
        }
      };

      // Mock de setters de React
      mockSetters = {
        setIsRefreshing: jasmine.createSpy('setIsRefreshing'),
        setStats: jasmine.createSpy('setStats'),
        setLastUpdated: jasmine.createSpy('setLastUpdated')
      };
    });

    // Prueba de caso válido (async)  
    it('debe calcular estadísticas y llamar a setters correctamente', async function() {
      await window.AdminLogic.refreshStats(mockServices, mockSetters);

      // 1. Verifica llamadas a servicios
      expect(mockServices.productService.getAll).toHaveBeenCalled();
      expect(mockServices.userService.getAll).toHaveBeenCalled();
      expect(mockServices.orderService.getAll).toHaveBeenCalled();
      expect(mockServices.orderService.dedupe).toHaveBeenCalled();

      // 2. Verifica llamadas a setters de estado
      expect(mockSetters.setIsRefreshing).toHaveBeenCalledWith(true);
      
      // 3. Verifica el cálculo de estadísticas
      const expectedStats = {
        products: 2,
        users: 1,
        orders: 5,
        revenue: 15000 // (10000 + 5000 + 0 + 0)
      };
      expect(mockSetters.setStats).toHaveBeenCalledWith(expectedStats);

      // 4. Verifica setters de finalización
      expect(mockSetters.setLastUpdated).toHaveBeenCalled();
      expect(mockSetters.setIsRefreshing).toHaveBeenCalledWith(false);
    });

    // Prueba de caso borde (servicios retornan arrays vacíos)  
    it('debe manejar correctamente arrays vacíos de los servicios', async function() {
      mockServices.productService.getAll.and.returnValue([]);
      mockServices.userService.getAll.and.returnValue([]);
      mockServices.orderService.getAll.and.returnValue([]);

      await window.AdminLogic.refreshStats(mockServices, mockSetters);

      const expectedStats = {
        products: 0,
        users: 0,
        orders: 0,
        revenue: 0
      };
      expect(mockSetters.setStats).toHaveBeenCalledWith(expectedStats);
    });

    // Prueba de caso nulo/incorrecto (servicios retornan null)  
    it('debe manejar null o undefined de los servicios (manejado defensivamente)', async function() {
      mockServices.productService.getAll.and.returnValue(null); // Caso nulo
      mockServices.userService.getAll.and.returnValue(undefined); // Caso undefined
      mockServices.orderService.getAll.and.returnValue([]); // Caso normal

      await window.AdminLogic.refreshStats(mockServices, mockSetters);

      // La lógica defensiva (|| []) debe prevenir errores
      const expectedStats = {
        products: 0,
        users: 0,
        orders: 0,
        revenue: 0
      };
      expect(mockSetters.setStats).toHaveBeenCalledWith(expectedStats);
    });
  });
});