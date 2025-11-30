// =================================================================
// Pruebas Unitarias (Jasmine) para: ProductosLogic
// Ubicación: /src/utils/Productos.logic.spec.js
// =================================================================


describe('ProductosLogic', function () {

  // Asegurarse de que la lógica esté cargada
  beforeAll(function () {
    // En un entorno Karma/Jasmine real, Productos.logic.js debe estar
    // incluido en la sección 'files' del karma.conf.js
    expect(window.ProductosLogic).toBeDefined();
  });

  // Pruebas para resolveImg
  describe('resolveImg', function () {
    
    /**
     * Prueba caso válido: ruta relativa
     */

    it('should prefix relative paths with publicUrl', function () {
      const publicUrl = 'http://localhost:3000';
      const result = window.ProductosLogic.resolveImg('img/torta.jpg', publicUrl);
      expect(result).toBe('http://localhost:3000/img/torta.jpg');
    });

    /**
     * Prueba caso válido: URL absoluta (https)
     */
    
    it('should return absolute https URLs as-is', function () {
      const url = 'https://example.com/img.png';
      const result = window.ProductosLogic.resolveImg(url, 'http://localhost');
      expect(result).toBe(url);
    });

    /**
     * Prueba caso nulo/incorrecto: src es nulo
     */

    it('should return empty string for null or undefined src', function () {
      expect(window.ProductosLogic.resolveImg(null, 'http://localhost')).toBe('');
      expect(window.ProductosLogic.resolveImg(undefined, 'http://localhost')).toBe('');
    });

    /**
     * Prueba caso borde: data URI
     */
   
    it('should return data URIs as-is', function () {
      const dataUri = 'data:image/png;base64,iVBORw...';
      const result = window.ProductosLogic.resolveImg(dataUri, 'http://localhost');
      expect(result).toBe(dataUri);
    });
  });

  // Pruebas para CLP
  describe('CLP', function () {
    
    /**
     * Prueba caso válido: número estándar
     */

    it('should format 10000 as "$10.000"', function () {
      expect(window.ProductosLogic.CLP(10000)).toBe('$10.000');
    });

    /**
     * Prueba caso nulo/incorrecto: input no numérico
     */

    it('should format non-numeric input as "$0"', function () {
      expect(window.ProductosLogic.CLP(null)).toBe('$0');
      expect(window.ProductosLogic.CLP(undefined)).toBe('$0');
      expect(window.ProductosLogic.CLP('texto')).toBe('$0');
    });

    /**
     * Prueba caso borde: cero
     */

    it('should format 0 as "$0"', function () {
      expect(window.ProductosLogic.CLP(0)).toBe('$0');
    });
  });

  // Pruebas para precioConDescuento
  describe('precioConDescuento', function () {
    const productoBase = { precio: 10000, descuento: 0 };
    
    /**
     * Prueba caso válido: con descuento
     */

    it('should apply a 20% discount correctly', function () {
      const p = { precio: 10000, descuento: 20 }; // 10000 * (1 - 0.20) = 8000
      expect(window.ProductosLogic.precioConDescuento(p)).toBe(8000);
    });
    
    /**
     * Prueba caso nulo/incorrecto: producto nulo
     */

    it('should return 0 if product is null or undefined', function () {
      expect(window.ProductosLogic.precioConDescuento(null)).toBe(0);
      expect(window.ProductosLogic.precioConDescuento(undefined)).toBe(0);
    });

    /**
     * Prueba caso borde: sin descuento (descuento 0 o nulo)
     */
    it('should return base price if discount is 0 or null', function () {
      const p1 = { precio: 10000, descuento: 0 };
      const p2 = { precio: 10000, descuento: null };
      expect(window.ProductosLogic.precioConDescuento(p1)).toBe(10000);
      expect(window.ProductosLogic.precioConDescuento(p2)).toBe(10000);
    });
  });

  // Pruebas para agregarAlCarrito
  describe('agregarAlCarrito', function () {
    
    // Mocks para las dependencias globales (localStorage, window, alert)
    var mockStorage;
    var mockAlert;
    var mockDispatchEvent;
    
    // Lista de productos simulada (el estado que pasaría el componente)
    const mockProductos = [
      { codigo: 'p1', nombre: 'Torta', precio: 10000, descuento: 0 },
      { codigo: 'p2', nombre: 'Kuchen', precio: 5000, descuento: 10 }, // Precio final 4500
      { codigo: 'p3', nombre: 'Galletas', precio: 100, cantidad: 5 }
    ];

    // Configuración de Mocks antes de cada test 'it()'
    beforeEach(function () {
      // Flag para desactivar redirecciones reales en lógica durante tests
      window.__TEST_ENV__ = true;
      // Mock de localStorage
      mockStorage = {};
      spyOn(localStorage, 'getItem').and.callFake(function (key) {
        return mockStorage[key] || null;
      });
      spyOn(localStorage, 'setItem').and.callFake(function (key, value) {
        mockStorage[key] = String(value);
      });

      // Nota: no es necesario mockear window.location; se usa el flag __TEST_ENV__.

      // Mock de alert
      mockAlert = jasmine.createSpy('alert');
      spyOn(window, 'alert').and.callFake(mockAlert);
      
      // Mock de dispatchEvent
      mockDispatchEvent = jasmine.createSpy('dispatchEvent');
      spyOn(window, 'dispatchEvent').and.callFake(mockDispatchEvent);

      // Simular usuario logueado por defecto
      mockStorage['isLoggedIn'] = 'true';
      mockStorage['carrito'] = '[]';
    });

  // Limpieza del flag de test
  afterEach(function () { delete window.__TEST_ENV__; });

    /**
     * Prueba caso nulo/incorrecto: Usuario no logueado
     */
    it('should redirect to /login if user is not logged in', function () {
      mockStorage['isLoggedIn'] = 'false'; // Simular no logueado
      
      var result = window.ProductosLogic.agregarAlCarrito('p1', mockProductos);
      expect(result).toBe('redirect_login');
      expect(localStorage.setItem).not.toHaveBeenCalledWith(
        jasmine.stringMatching('carrito'), 
        jasmine.anything()
      );
    });

    /**
     * Prueba caso válido: Agregar un producto nuevo al carrito
     */
    it('should add a new product to an empty cart', function () {
      window.ProductosLogic.agregarAlCarrito('p2', mockProductos); // Producto con descuento
      
      const carrito = JSON.parse(mockStorage['carrito']);
      expect(carrito.length).toBe(1);
      expect(carrito[0].codigo).toBe('p2');
      expect(carrito[0].cantidad).toBe(1);
      expect(carrito[0].precio).toBe(4500); // Verifica que usó el precio con descuento
      expect(mockDispatchEvent).toHaveBeenCalled();
    });

    /**
     * Prueba caso válido: Incrementar cantidad de producto existente
     */
    it('should increment quantity of an existing product', function () {
      // Estado inicial: ya tiene 1 'p1'
      mockStorage['carrito'] = JSON.stringify([
        { codigo: 'p1', nombre: 'Torta', precio: 10000, cantidad: 1 }
      ]);

      window.ProductosLogic.agregarAlCarrito('p1', mockProductos);
      
      const carrito = JSON.parse(mockStorage['carrito']);
      expect(carrito.length).toBe(1);
      expect(carrito[0].cantidad).toBe(2);
      expect(carrito[0].precio).toBe(10000);
      expect(mockDispatchEvent).toHaveBeenCalled();
    });
    
    /**
     * Prueba caso borde: Límite de 5 unidades
     */
    it('should show alert and not add product if quantity reaches 5', function () {
      // Estado inicial: ya tiene 5 'p1'
      mockStorage['carrito'] = JSON.stringify([
        { codigo: 'p1', nombre: 'Torta', precio: 10000, cantidad: 5 }
      ]);

      window.ProductosLogic.agregarAlCarrito('p1', mockProductos);
      
      const carrito = JSON.parse(mockStorage['carrito']);
      expect(carrito[0].cantidad).toBe(5); // Sigue en 5
      expect(mockAlert).toHaveBeenCalledWith(
        jasmine.stringMatching('No puedes agregar más de 5 unidades')
      );
      expect(mockDispatchEvent).not.toHaveBeenCalled(); // No se debe disparar el evento si falla
    });
  });
});