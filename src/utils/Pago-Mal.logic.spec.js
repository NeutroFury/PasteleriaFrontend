/**
 * 🧾 PagoMal.logic.spec.js
 * Pruebas Jasmine para la lógica de PagoMal.

 */

describe('PagoMal.logic.js', function () {

  // No usar destructuración para compatibilidad con Karma  

  // --- Pruebas para formatCLP ---
  //  
  describe('window.PagoMalLogic.formatCLP', function () {

    /**
     * Test (Entrada Válida): Debe formatear un número estándar.
     *  
     */
    it('debe formatear un número estándar como moneda CLP', function () {
      var result = window.PagoMalLogic.formatCLP(123456);
      expect(result).toBe('$123.456');
    });

    /**
     * Test (Entrada Nula/Incorrecta): Debe manejar valores nulos o no numéricos.
     *  
     */
    it('debe manejar valores nulos o no numéricos y devolver $0', function () {
      var resultNull = window.PagoMalLogic.formatCLP(null);
      expect(resultNull).toBe('$0');
      var resultNaN = window.PagoMalLogic.formatCLP('texto aleatorio');
      expect(resultNaN).toBe('$0');
      var resultUndef = window.PagoMalLogic.formatCLP(undefined);
      expect(resultUndef).toBe('$0');
    });

    /**
     * Test (Caso Borde): Debe formatear correctamente el número 0.
     *  
     */
    it('debe formatear correctamente el número 0', function () {
      var result = window.PagoMalLogic.formatCLP(0);
      expect(result).toBe('$0');
    });
  });

  // --- Pruebas para calculateTotal ---
  //  
  describe('window.PagoMalLogic.calculateTotal', function () {

    var mockOrder = {
      items: [
        { precio: 1000, cantidad: 2 }, // 2000
        { precio: 500, cantidad: 1 },  // 500
        { precio: '300', cantidad: '3' } // 900 (maneja strings)
      ]
    };

    /**
     * Test (Entrada Válida): Debe sumar correctamente los items.
     *  
     */
    it('debe sumar correctamente los items de la orden', function () {
      var total = window.PagoMalLogic.calculateTotal(mockOrder);
      expect(total).toBe(3400); // 2000 + 500 + 900
    });

    /**
     * Test (Entrada Nula/Incorrecta): Debe devolver 0 si la orden es nula o no tiene items.
     *  
     */
    it('debe devolver 0 si la orden es nula, undefined o no tiene array de items', function () {
      var totalNull = window.PagoMalLogic.calculateTotal(null);
      expect(totalNull).toBe(0);
      var totalEmpty = window.PagoMalLogic.calculateTotal({ items: [] });
      expect(totalEmpty).toBe(0);
      var totalInvalid = window.PagoMalLogic.calculateTotal({});
      expect(totalInvalid).toBe(0);
    });

    /**
     * Test (Caso Borde): Debe manejar items con precio o cantidad 0 o inválidos.
     *  
     */
    it('debe manejar items con precio o cantidad 0 o inválidos', function () {
      var orderBorde = {
        items: [
          { precio: 1000, cantidad: 2 }, // 2000
          { precio: 500, cantidad: 0 },  // 0
          { precio: 'texto', cantidad: 3 } // 0
        ]
      };
      var total = window.PagoMalLogic.calculateTotal(orderBorde);
      expect(total).toBe(2000);
    });
  });

  // --- Pruebas para processFailedOrder ---
  //  
  describe('window.PagoMalLogic.processFailedOrder', function () {

    var mockDateNow = 1678886400000; // Fecha fija: 15/03/2023 10:20:00
    var mockStorageData;
    var saveCallbackSpy;

    // Mock base de la orden
    beforeEach(function () {
      mockStorageData = JSON.stringify({
        items: [{ id: 1, nombre: 'Producto 1', precio: 100, cantidad: 1 }],
        cliente: { nombre: 'Cliente' }
      });
      // Spy para el callback de guardado
      saveCallbackSpy = jasmine.createSpy('saveOrderCallback');
    });

    /**
     * Test (Entrada Válida): Debe procesar orden, generar códigos y llamar al callback.
     *  
     */
    it('debe procesar la orden, generar códigos faltantes y llamar al callback', function () {
      var result = window.PagoMalLogic.processFailedOrder(mockStorageData, mockDateNow, saveCallbackSpy);

      expect(result.status).toBe('success');
      expect(result.orden).toBeDefined();
      expect(result.orden.items.length).toBe(1);
      // Verifica generación de códigos 
      expect(result.orden.codigo).toBe('ORDER00000'); // .slice(-5) de 1678886400000
      expect(result.orden.nro).toBe('#20230000'); // Año 2023 + .slice(-4)
      // Verifica que el guardado fue llamado 
      expect(saveCallbackSpy).toHaveBeenCalledWith('fallido');
    });

    /**
     * Test (Entrada Nula/Incorrecta): Debe redirigir si no hay data o la data es inválida.
     *  
     */
    it('debe devolver status "redirect_cart" si la data es nula, JSON inválido o sin items', function () {
      // Nulo
      var resultNull = window.PagoMalLogic.processFailedOrder(null, mockDateNow, saveCallbackSpy);
      expect(resultNull.status).toBe('redirect_cart');
      
      // JSON inválido
      var resultInvalid = window.PagoMalLogic.processFailedOrder('{json_invalido', mockDateNow, saveCallbackSpy);
      expect(resultInvalid.status).toBe('redirect_cart');

      // Sin items
      var noItems = JSON.stringify({ cliente: {}, items: [] });
      var resultNoItems = window.PagoMalLogic.processFailedOrder(noItems, mockDateNow, saveCallbackSpy);
      expect(resultNoItems.status).toBe('redirect_cart');
      
      // Callback no debe ser llamado si falla la validación
      expect(saveCallbackSpy).not.toHaveBeenCalled();
    });

    /**
     * Test (Caso Borde): Debe mantener los códigos existentes si la orden ya los tiene.
     *  
     */
    it('debe mantener los códigos existentes si ya están presentes', function () {
      var dataConCodigos = JSON.stringify({
        items: [{ id: 1 }],
        codigo: 'CODIGO-EXISTENTE',
        nro: '#NRO-EXISTENTE'
      });
      var result = window.PagoMalLogic.processFailedOrder(dataConCodigos, mockDateNow, saveCallbackSpy);

      expect(result.status).toBe('success');
      expect(result.orden.codigo).toBe('CODIGO-EXISTENTE');
      expect(result.orden.nro).toBe('#NRO-EXISTENTE');
      expect(saveCallbackSpy).toHaveBeenCalledWith('fallido');
    });
  });

  // --- Pruebas para handleRetryPayment ---
  //  
  describe('window.PagoMalLogic.handleRetryPayment', function () {

    var navigateSpy;

    beforeEach(function () {
      // Crear un Spy para simular la función navigate
      navigateSpy = jasmine.createSpy('navigateCallback');
    });

    /**
     * Test (Entrada Válida): Debe llamar al callback de navegación con la ruta /checkout.
     *  
     */
    it('debe llamar al callback de navegación con la ruta "/checkout"', function () {
      window.PagoMalLogic.handleRetryPayment(navigateSpy);
      expect(navigateSpy).toHaveBeenCalledWith('/checkout');
    });

    /**
     * Test (Entrada Nula/Incorrecta): No debe fallar si el callback es nulo.
     *  
     */
    it('no debe lanzar error si el callback es nulo o undefined', function () {
        // Se espera que esta llamada no lance una excepción
        expect(function() {
            window.PagoMalLogic.handleRetryPayment(null);
        }).not.toThrow();
        expect(navigateSpy).not.toHaveBeenCalled();
    });

    /**
     * Test (Caso Borde): No debe fallar si el callback no es una función.
     *  
     */
    it('no debe lanzar error si el callback no es una función', function () {
        expect(function() {
            window.PagoMalLogic.handleRetryPayment('soy-un-string');
        }).not.toThrow();
        expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

});