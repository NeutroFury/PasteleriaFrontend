// =================================================================
// 2️⃣  Checkout.logic.spec.js (Tests Jasmine)
// Archivo de pruebas unitarias para la lógica de Checkout.
// =================================================================

describe('Checkout.logic.js', function () {
    
    // Asegurarse de que la lógica esté cargada en 'window'
    // (Karma.conf.js debe incluir el archivo .logic.js)
    beforeAll(function () {
        if (!window.CheckoutLogic) {
            // Esta advertencia aparecerá si el archivo .logic.js no se cargó
            console.error("ADVERTENCIA: Checkout.logic.js no se cargó en 'window'.");
        }
    });

    // ----------------------------------------
    // Pruebas para: CLP  
    // ----------------------------------------
    describe('CLP', function () {
        
        /**
         * Prueba de entrada válida (número estándar).
         */
        it('debería formatear un número estándar a CLP', function () {
            var resultado = window.CheckoutLogic.CLP(10000);
            expect(resultado).toBe('$10.000');
        });

        /**
         * Prueba de entrada inválida (null/undefined).
         */
        it('debería manejar valores nulos o indefinidos, resultando en $0', function () {
            var resultadoNull = window.CheckoutLogic.CLP(null);
            var resultadoUndef = window.CheckoutLogic.CLP(undefined);
            expect(resultadoNull).toBe('$0');
            expect(resultadoUndef).toBe('$0');
        });

        /**
         * Prueba de caso borde (string numérico y cero) .
         */
        it('debería formatear un string numérico y el número 0', function () {
            var resultadoString = window.CheckoutLogic.CLP('5000');
            var resultadoCero = window.CheckoutLogic.CLP(0);
            expect(resultadoString).toBe('$5.000');
            expect(resultadoCero).toBe('$0');
        });
    });

    // ----------------------------------------
    // Pruebas para: calcularTotal
    // ----------------------------------------
    describe('calcularTotal', function () {

        /**
         * Prueba de entrada válida (carrito con items).
         */
        it('debería sumar correctamente los subtotales del carrito', function () {
            var carrito = [
                { precio: 100, cantidad: 2 }, // 200
                { precio: 50, cantidad: 1 },  // 50
            ];
            var total = window.CheckoutLogic.calcularTotal(carrito);
            expect(total).toBe(250);
        });

        /**
         * Prueba de entrada inválida (null, undefined, o no array) .
         */
        it('debería devolver 0 si el carrito es nulo, indefinido o no es un array', function () {
            var totalNull = window.CheckoutLogic.calcularTotal(null);
            var totalUndef = window.CheckoutLogic.calcularTotal(undefined);
            var totalObj = window.CheckoutLogic.calcularTotal({ a: 1 });
            expect(totalNull).toBe(0);
            expect(totalUndef).toBe(0);
            expect(totalObj).toBe(0);
        });

        /**
         * Prueba de caso borde (carrito vacío o items con datos inválidos).
         */
        it('debería devolver 0 si el carrito está vacío o los items tienen datos inválidos', function () {
            var carritoVacio = [];
            var carritoInvalido = [
                { precio: 'abc', cantidad: 2 }, // (0 * 2) = 0
                { precio: 100, cantidad: 'xyz' } // (100 * 1) = 100 (cantidad NaN se vuelve 1)
            ];
            var totalVacio = window.CheckoutLogic.calcularTotal(carritoVacio);
            var totalInvalido = window.CheckoutLogic.calcularTotal(carritoInvalido);
            
            expect(totalVacio).toBe(0);
            expect(totalInvalido).toBe(100);
        });
    });

    // ----------------------------------------
    // Pruebas para: validateFields
    // ----------------------------------------
    describe('validateFields', function () {
        // Objeto base válido para las pruebas
        var baseForm = {
            nombre: 'Pablo',
            apellidos: 'Rivas',
            correo: 'test@test.com',
            calle: 'Av. Siempre Viva 742',
            region: 'Metropolitana',
            comuna: 'Santiago',
        };

        /**
         * Prueba de entrada válida (formulario completo).
         */
        it('debería devolver un objeto de errores vacío si todos los campos son válidos', function () {
            var errores = window.CheckoutLogic.validateFields(baseForm);
            // Se usa 'expect(Object.keys(errores).length).toBe(0)'
            expect(Object.keys(errores).length).toBe(0);
        });

        /**
         * Prueba de entrada inválida (campos requeridos faltantes o vacíos).
         */
        it('debería devolver errores para campos requeridos faltantes o vacíos (null, undefined, "")', function () {
            var formInvalido = {
                nombre: '  ', // Espacios en blanco
                apellidos: null,
                correo: 'test@test.com',
                calle: undefined,
                region: '',
                comuna: 'Santiago', // Válido
            };
            var errores = window.CheckoutLogic.validateFields(formInvalido);
            expect(errores.nombre).toBe('Campo obligatorio');
            expect(errores.apellidos).toBe('Campo obligatorio');
            expect(errores.calle).toBe('Campo obligatorio');
            expect(errores.region).toBe('Campo obligatorio');
            expect(errores.comuna).toBeUndefined(); // Este estaba presente
        });

        /**
         * Prueba de caso borde (correo inválido).
         */
        it('debería devolver un error específico para un correo inválido', function () {
            var formCorreoInv1 = { ...baseForm, correo: 'esto-no-es-un-correo' };
            var formCorreoInv2 = { ...baseForm, correo: 'test@test' }; // Sin .com
            
            var errores1 = window.CheckoutLogic.validateFields(formCorreoInv1);
            var errores2 = window.CheckoutLogic.validateFields(formCorreoInv2);
            
            expect(errores1.correo).toBe('Correo inválido');
            expect(errores2.correo).toBe('Correo inválido');
        });
    });

    // ----------------------------------------
    // Pruebas para: cargarCarrito (Mockeando localStorage)
    // ----------------------------------------
    describe('cargarCarrito', function () {
        var mockLocalStorageGet;
        var mockSetCarrito;

        beforeEach(function() {
            // Mock de localStorage.getItem
            mockLocalStorageGet = spyOn(localStorage, 'getItem');
            // Spy para setCarrito
            mockSetCarrito = jasmine.createSpy('setCarrito');
        });

        /**
         * Prueba de entrada válida (localStorage tiene un carrito válido).
         */
        it('debería cargar y parsear un carrito válido desde localStorage', function () {
            var carritoGuardado = JSON.stringify([{ id: 1, nombre: 'Torta' }]);
            mockLocalStorageGet.and.returnValue(carritoGuardado);
            
            window.CheckoutLogic.cargarCarrito(mockSetCarrito);
            
            expect(localStorage.getItem).toHaveBeenCalledWith('carrito');
            expect(mockSetCarrito).toHaveBeenCalledWith([{ id: 1, nombre: 'Torta' }]);
        });

        /**
         * Prueba de entrada inválida (localStorage tiene JSON malformado) .
         */
        it('debería establecer un carrito vacío si localStorage tiene JSON malformado', function () {
            mockLocalStorageGet.and.returnValue('{esto-no-es-json');
            
            window.CheckoutLogic.cargarCarrito(mockSetCarrito);
            
            expect(localStorage.getItem).toHaveBeenCalledWith('carrito');
            expect(mockSetCarrito).toHaveBeenCalledWith([]);
        });

        /**
         * Prueba de caso borde (localStorage está vacío o el item no es array).
         */
        it('debería establecer un carrito vacío si localStorage está vacío o el item no es un array', function () {
            // Caso 1: Vacío (null)
            mockLocalStorageGet.and.returnValue(null);
            window.CheckoutLogic.cargarCarrito(mockSetCarrito);
            expect(mockSetCarrito).toHaveBeenCalledWith([]);

            // Caso 2: No es array (es un objeto)
            mockLocalStorageGet.and.returnValue(JSON.stringify({ a: 1 }));
            window.CheckoutLogic.cargarCarrito(mockSetCarrito);
            expect(mockSetCarrito).toHaveBeenCalledWith([]);
        });
    });

    // ----------------------------------------
    // Pruebas para: pagar (Mockeando todo)
    // ----------------------------------------
    describe('pagar', function () {
        var mockEvent;
        var mockNavigate;
        var mockLocalStorageSet;
        var mockDispatchEvent;
        var baseForm;
        var baseCarrito;
        var baseTotal;

        beforeEach(function() {
            // Mock del evento
            mockEvent = {
                preventDefault: jasmine.createSpy('preventDefault')
            };
            // Mock de navigate
            mockNavigate = jasmine.createSpy('navigate');
            // Mock de localStorage.setItem
            mockLocalStorageSet = spyOn(localStorage, 'setItem').and.callFake(function() {});
            // Mock de window.dispatchEvent
            mockDispatchEvent = spyOn(window, 'dispatchEvent').and.callFake(function() {});

            // Datos base
            baseForm = {
                nombre: 'Test', apellidos: 'User', correo: 'test@test.com',
                calle: '123', region: 'RM', comuna: 'STGO'
            };
            baseCarrito = [{ id: 1, precio: 100, cantidad: 1 }];
            baseTotal = 100;
        });
        
        /**
         * Prueba de entrada válida (formulario completo, pago exitoso).
         */
        it('debería navegar a /pago-bien, limpiar carrito y disparar evento si el pago es exitoso', function () {
            window.CheckoutLogic.pagar(mockEvent, baseForm, baseCarrito, baseTotal, mockNavigate);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            // Verifica que se guardó la orden
            expect(localStorage.setItem).toHaveBeenCalledWith(jasmine.stringMatching('ultima_orden'), jasmine.any(String));
            // Verifica que se limpió el carrito
            expect(localStorage.setItem).toHaveBeenCalledWith('carrito', '[]');
            expect(mockDispatchEvent).toHaveBeenCalledWith(jasmine.any(Event));
            expect(mockNavigate).toHaveBeenCalledWith('/pago-bien');
        });
        
        /**
         * Prueba de entrada inválida (formulario incompleto).
         */
        it('debería navegar a /pago-mal si la validación falla (campo vacío)', function () {
            var formInvalido = { ...baseForm, nombre: '' }; // Falla la validación
            
            window.CheckoutLogic.pagar(mockEvent, formInvalido, baseCarrito, baseTotal, mockNavigate);
            
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            // Verifica que se guardó la orden (aunque tenga error)
            expect(localStorage.setItem).toHaveBeenCalledWith(jasmine.stringMatching('ultima_orden'), jasmine.any(String));
            // Verifica la navegación a error
            expect(mockNavigate).toHaveBeenCalledWith('/pago-mal');
            
            // Importante: No debe haber limpiado el carrito
            expect(localStorage.setItem).not.toHaveBeenCalledWith('carrito', '[]');
            expect(mockDispatchEvent).not.toHaveBeenCalled();
        });

        /**
         * Prueba de caso borde (correo inválido).
         */
        it('debería navegar a /pago-mal si el correo es inválido', function () {
            var formCorreoInvalido = { ...baseForm, correo: 'bad-email' };
            
            window.CheckoutLogic.pagar(mockEvent, formCorreoInvalido, baseCarrito, baseTotal, mockNavigate);
            
            expect(mockNavigate).toHaveBeenCalledWith('/pago-mal');
            // No debe limpiar el carrito
            expect(localStorage.setItem).not.toHaveBeenCalledWith('carrito', '[]');
        });
    });

    // (No se testean 'actualizar' y 'onBlur' con mocks complejos
    // porque solo llaman a setters de React. Probar que la lógica
    // interna de (f) => ... funciona es responsabilidad de React.
    // Solo necesitamos saber que la lógica de negocio (pagar, validar) funciona).
});