/**
 * Pruebas unitarias con Jasmine para la lógica del componente PagoBien.
 * Se testean las funciones expuestas en window.PagoBienLogic.
 */
describe('PagoBien.logic.js', function () {

    // Comprueba que el script de lógica se haya cargado correctamente
    it('debe crear el namespace window.PagoBienLogic', function () {
        expect(window.PagoBienLogic).toBeDefined();
    });

    /**
     * Pruebas para la función CLP
     * [Comentario explicativo por test]
     */
    describe('window.PagoBienLogic.CLP', function () {

        // Test 1: Entrada válida (número)
        it('debe formatear un número válido a CLP', function () {
            var resultado = window.PagoBienLogic.CLP(25000);
            expect(resultado).toBe('$25.000');
        });

        // Test 2: Entrada nula/incorrecta (cero)
        it('debe formatear el número 0 correctamente', function () {
            var resultado = window.PagoBienLogic.CLP(0);
            expect(resultado).toBe('$0');
        });

        // Test 3: Caso borde (string numérico)
        it('debe formatear un string numérico válido', function () {
            var resultado = window.PagoBienLogic.CLP('123456');
            expect(resultado).toBe('$123.456');
        });

        // Test 4: Entrada inválida (no numérico)
        it('debe manejar strings no numéricos (NaN) devolviendo $0', function () {
            var resultado = window.PagoBienLogic.CLP('texto');
            expect(resultado).toBe('$0'); 
        });
    });

    /**
     * Pruebas para la función calcularTotal
     * [Comentario explicativo por test]
     */
    describe('window.PagoBienLogic.calcularTotal', function () {

        var ordenValida = {
            items: [
                { precio: 1000, cantidad: 2 }, // 2000
                { precio: 500, cantidad: 1 },  // 500
                { precio: '300', cantidad: '3' } // 900
            ]
        };

        // Test 1: Entrada válida
        it('debe calcular el total de una orden válida con items mixtos', function () {
            var total = window.PagoBienLogic.calcularTotal(ordenValida);
            expect(total).toBe(3400); // 2000 + 500 + 900
        });

        // Test 2: Entrada nula/incorrecta (orden nula o undefined)
        it('debe devolver 0 si la orden es nula o undefined', function () {
            expect(window.PagoBienLogic.calcularTotal(null)).toBe(0);
            expect(window.PagoBienLogic.calcularTotal(undefined)).toBe(0);
        });

        // Test 3: Caso borde (items vacíos)
        it('debe devolver 0 si la lista de items está vacía', function () {
            var ordenVacia = { items: [] };
            expect(window.PagoBienLogic.calcularTotal(ordenVacia)).toBe(0);
        });

        // Test 4: Caso borde (items con precio/cantidad inválidos)
        it('debe tratar precios/cantidades inválidos como 0 o 1 (default)', function () {
            var ordenInvalida = {
                items: [
                    { precio: 1000, cantidad: 1 }, // 1000
                    { precio: 'abc', cantidad: 1 }, // (Number('abc') || 0) * 1 = 0
                    { precio: 500, cantidad: 'xyz' } // 500 * (Number('xyz') || 1) = 500
                ]
            };
            expect(window.PagoBienLogic.calcularTotal(ordenInvalida)).toBe(1500);
        });
    });

    /**
     * Pruebas para la función imprimirPDF
     * [Comentario explicativo por test]
     */
    describe('window.PagoBienLogic.imprimirPDF', function () {
        
        var mockWindow;

        // Preparamos un mock de 'window' antes de cada test
        beforeEach(function () {
            // Creamos un 'spy' en la función 'print' para rastrear sus llamadas
            mockWindow = {
                print: jasmine.createSpy('print')
            };
        });

        // Test 1: Llamada válida
        it('debe llamar a window.print() exactamente una vez', function () {
            window.PagoBienLogic.imprimirPDF(mockWindow);
            expect(mockWindow.print).toHaveBeenCalledTimes(1);
        });

        // Test 2: Objeto window nulo
        it('no debe lanzar un error si el objeto window es nulo', function () {
            var fn = function() { window.PagoBienLogic.imprimirPDF(null); };
            // Verificamos que la función anónima NO lance una excepción
            expect(fn).not.toThrow();
        });

        // Test 3: Función print no existe
        it('no debe lanzar un error si window.print no es una función', function () {
            var invalidWindow = { print: 'esto-no-es-funcion' };
            var fn = function() { window.PagoBienLogic.imprimirPDF(invalidWindow); };
            expect(fn).not.toThrow();
            // Y verificamos que el spy original (de beforeEach) no fue llamado
            expect(mockWindow.print).not.toHaveBeenCalled(); 
        });
    });

    /**
     * Pruebas para la función enviarEmail
     * [Comentario explicativo por test]
     */
    describe('window.PagoBienLogic.enviarEmail', function () {

        var mockWindow;
        var mockCLP;
        var ordenMock;

        // Preparamos mocks
        beforeEach(function () {
            mockWindow = {
                location: { href: '' } // Objeto location debe ser modificable
            };
            // Mock simple de CLP para pruebas predecibles
            mockCLP = function (n) { return '$' + n; }; 
            ordenMock = {
                cliente: { correo: 'test@test.cl', nombre: 'Juan' },
                codigo: 'ABC12345',
                items: [
                    { nombre: 'Torta', precio: 1000, cantidad: 2 }
                ]
            };
        });

        // Test 1: Entrada válida
        it('debe generar un enlace mailto: correctamente formateado', function () {
            window.PagoBienLogic.enviarEmail(ordenMock, 2000, mockCLP, mockWindow);
            
            var href = mockWindow.location.href;
            
            expect(href).toContain('mailto:test@test.cl');
            expect(href).toContain('subject=Boleta%20de%20compra%20ABC12345');
            expect(href).toContain(encodeURIComponent('Hola Juan,'));
            expect(href).toContain(encodeURIComponent('• Torta x2 = $2000'));
            expect(href).toContain(encodeURIComponent('Total pagado: $2000'));
        });

        // Test 2: Entrada nula/incorrecta (orden nula)
        it('no debe hacer nada (no cambiar href) si la orden es nula', function () {
            window.PagoBienLogic.enviarEmail(null, 2000, mockCLP, mockWindow);
            expect(mockWindow.location.href).toBe('');
        });

        // Test 3: Caso borde (datos del cliente y correo faltantes)
        it('debe manejar cliente/correo faltante (mailto: vacío y nombre vacío)', function () {
            var ordenSinCliente = {
                codigo: 'DEF456',
                items: [],
            };
            window.PagoBienLogic.enviarEmail(ordenSinCliente, 0, mockCLP, mockWindow);
            
            var href = mockWindow.location.href;
            expect(href).toContain('mailto:?'); // 'to' está vacío
            expect(href).toContain(encodeURIComponent('Hola ,')); // Nombre vacío
        });

    });
});