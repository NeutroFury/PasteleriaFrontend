// Archivo: src/utils/AdminProductosCriticos.logic.spec.js
// Pruebas Jasmine para la lógica de AdminProductosCriticos
// Asegúrate de importar 'AdminProductosCriticos.logic.js' en 'karma.conf.js' o en el test-runner.

describe('AdminProductosCriticosLogic', function() {

  // Accedemos a la lógica desde el objeto window 
  // No usar destructuración para compatibilidad 
  var logic = window.AdminProductosCriticosLogic;

  // --- Mocks ---
  // Mock del productService para las pruebas de addStock y marcar
  var mockProductService;
  var mockProduct;

  beforeEach(function() {
    // Inicializar el mock del producto
    mockProduct = {
      codigo: 'TORTA01',
      stock: 3,
      estado: 'disponible'
    };

    // Configurar el mock del servicio
    mockProductService = {
      getById: jasmine.createSpy('getById').and.callFake(function(codigo) {
        if (codigo === 'TORTA01') {
          return mockProduct;
        }
        return null;
      }),
      update: jasmine.createSpy('update')
    };
    
    // Resetear spies antes de cada test
    mockProductService.update.calls.reset();
    mockProductService.getById.calls.reset();
  });

  // --- Pruebas para CLP ---
  describe('CLP', function() {
    
    // Test 1: Entrada válida (número) 
    it('debe formatear un número correctamente', function() { 
      var result = logic.CLP(15000);
      // Usamos un regex para verificar el formato de moneda chileno (puede variar)
      expect(result).toMatch(/(\$|CLP)\s?15\.000/);
    });

    // Test 2: Entrada nula/incorrecta (null o string no numérico) 
    it('debe manejar entradas nulas o NaN como 0', function() { 
      var resultNaN = logic.CLP('texto');
      var resultNull = logic.CLP(null);
      expect(resultNaN).toMatch(/(\$|CLP)\s?0/);
      expect(resultNull).toMatch(/(\$|CLP)\s?0/);
    });

    // Test 3: Caso borde (cero) 
    it('debe formatear el cero correctamente', function() { 
      var result = logic.CLP(0);
      expect(result).toMatch(/(\$|CLP)\s?0/);
    });
  });

  // --- Pruebas para resolveImg ---
  describe('resolveImg', function() {

    var publicUrl = '/mi-pasteleria'; // Mock de process.env.PUBLIC_URL

    // Test 1: Entrada válida (ruta relativa) 
    it('debe prefijar PUBLIC_URL a rutas relativas', function() { 
      var result = logic.resolveImg('img/torta.jpg', publicUrl);
      expect(result).toBe('/mi-pasteleria/img/torta.jpg');
    });
    
    // Test 2: Caso borde (ruta relativa con slash al inicio)  
    it('debe manejar rutas relativas que inician con /', function() { 
      var result = logic.resolveImg('/img/torta.jpg', publicUrl);
      expect(result).toBe('/mi-pasteleria/img/torta.jpg');
    });

    // Test 3: Entrada nula/incorrecta (null o string vacío)  
    it('debe devolver un string vacío si la entrada es nula o vacía', function() { 
      expect(logic.resolveImg(null, publicUrl)).toBe('');
      expect(logic.resolveImg('', publicUrl)).toBe('');
    });

    // Test 4: Caso borde (URL absoluta o data URI)  
    it('debe devolver la URL absoluta o data URI sin modificar', function() { 
      var httpUrl = 'https://example.com/img.png';
      var dataUri = 'data:image/png;base64,abc...';
      expect(logic.resolveImg(httpUrl, publicUrl)).toBe(httpUrl);
      expect(logic.resolveImg(dataUri, publicUrl)).toBe(dataUri);
    });
  });

  // --- Pruebas para filterCriticos ---
  describe('filterCriticos', function() {

    var items = [
      { codigo: 'A1', nombre: 'Torta Chocolate', stock: 2, estado: 'disponible' },
      { codigo: 'B2', nombre: 'Kuchen Manzana', stock: 5, estado: 'disponible' },
      { codigo: 'C3', nombre: 'Pie Limón', stock: 0, estado: 'agotado' },
      { codigo: 'D4', nombre: 'Galletas Choc', stock: 10, estado: 'disponible' }
    ];
    var umbral = 3;

    // Test 1: Entrada válida (stock bajo, umbral 3)  
    it('debe filtrar por stock bajo (<= 3) o agotados', function() { 
      var result = logic.filterCriticos(items, umbral, false, '');
      expect(result.length).toBe(2);
      expect(result[0].codigo).toBe('A1'); // stock 2
      expect(result[1].codigo).toBe('C3'); // stock 0 (agotado)
    });

    // Test 2: Entrada válida (solo agotados)  
    it('debe filtrar solo productos agotados', function() { 
      var result = logic.filterCriticos(items, umbral, true, '');
      expect(result.length).toBe(1);
      expect(result[0].codigo).toBe('C3');
    });

    // Test 3: Entrada válida (búsqueda por texto)  
    it('debe filtrar por texto ("Choc") y criticidad', function() { 
      var result = logic.filterCriticos(items, umbral, false, 'Choc');
      expect(result.length).toBe(1);
      expect(result[0].codigo).toBe('A1'); // 'Torta Chocolate' (stock 2)
      // D4 'Galletas Choc' (stock 10) no es crítico, aunque coincide el texto
    });
    
    // Test 4: Caso borde (items nulos o vacíos)  
     it('debe manejar items nulos o vacíos', function() { 
      expect(logic.filterCriticos(null, umbral, false, '').length).toBe(0);
      expect(logic.filterCriticos([], umbral, false, '').length).toBe(0);
    });
  });

  // --- Pruebas para addStockLogic ---
  describe('addStockLogic', function() {

    // Test 1: Entrada válida (añadir stock)  
    it('debe llamar a update con el nuevo stock (3 + 5 = 8)', function() { 
      logic.addStockLogic('TORTA01', 5, mockProductService);
      expect(mockProductService.update).toHaveBeenCalledWith('TORTA01', { stock: 8, estado: 'disponible' });
    });

    // Test 2: Caso borde (stock negativo)  
    it('no debe permitir que el stock baje de 0 (3 - 10 = 0)', function() { 
      logic.addStockLogic('TORTA01', -10, mockProductService);
      expect(mockProductService.update).toHaveBeenCalledWith('TORTA01', { stock: 0, estado: 'disponible' });
    });
    
    // Test 3: Caso borde (cambiar de agotado a disponible)  
    it('debe cambiar estado de "agotado" a "disponible" si se añade stock', function() { 
      mockProduct.stock = 0;
      mockProduct.estado = 'agotado';
      logic.addStockLogic('TORTA01', 1, mockProductService);
      expect(mockProductService.update).toHaveBeenCalledWith('TORTA01', { stock: 1, estado: 'disponible' });
    });

    // Test 4: Entrada incorrecta (producto no encontrado)  
    it('no debe llamar a update si el producto no existe', function() { 
      logic.addStockLogic('CODIGO_FALSO', 5, mockProductService);
      expect(mockProductService.update).not.toHaveBeenCalled();
    });
  });
  
  // --- Pruebas para marcarLogic ---
  describe('marcarLogic', function() {
    
    // Test 1: Entrada válida (marcar agotado)  
    it('debe llamar a update con el estado "agotado"', function() { 
      logic.marcarLogic('TORTA01', 'agotado', mockProductService);
      expect(mockProductService.update).toHaveBeenCalledWith('TORTA01', { estado: 'agotado' });
    });
    
    // Test 2: Entrada válida (marcar disponible)  
    it('debe llamar a update con el estado "disponible"', function() { 
      logic.marcarLogic('TORTA01', 'disponible', mockProductService);
      expect(mockProductService.update).toHaveBeenCalledWith('TORTA01', { estado: 'disponible' });
    });
    
    // Test 3: Entrada incorrecta (servicio nulo)  
    it('no debe hacer nada si el servicio es nulo', function() { 
      // Suprimimos el console.error esperado para el test
      spyOn(console, 'error');
      logic.marcarLogic('TORTA01', 'agotado', null);
      expect(mockProductService.update).not.toHaveBeenCalled();
    });
  });

});