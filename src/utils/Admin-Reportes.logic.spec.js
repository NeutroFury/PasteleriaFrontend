/**
 * AdminReportes.logic.spec.js
 * Pruebas unitarias para AdminReportes.logic.js
 * (Configurado para Karma + Jasmine)  
 */
describe('AdminReportes.logic.js', function() {

  // Asegurarnos que la lógica esté cargada
  beforeAll(function() {
    // En un entorno Karma, el .logic.js ya debería estar cargado
    if (!window.AdminReportesLogic) {
      throw new Error('AdminReportes.logic.js no se cargó correctamente.');
    }
  });

  // Pruebas para CLP  
  describe('CLP', function() {

    // Test 1: Caso válido  
    it('debe formatear un número estándar', function() {
      // No usar const { CLP } = ...  
      var resultado = window.AdminReportesLogic.CLP(123456);
      expect(resultado).toBe('$123.456');
    });

    // Test 2: Caso nulo/inválido  
    it('debe manejar valores nulos o cero', function() {
      var resultadoNull = window.AdminReportesLogic.CLP(null);
      var resultadoCero = window.AdminReportesLogic.CLP(0);
      expect(resultadoNull).toBe('$0');
      expect(resultadoCero).toBe('$0');
    });

    // Test 3: Caso borde (decimales)  
    it('debe redondear decimales según maximumFractionDigits: 0', function() {
      var resultadoUp = window.AdminReportesLogic.CLP(123.50);
      var resultadoDown = window.AdminReportesLogic.CLP(456.49);
      expect(resultadoUp).toBe('$124'); // Redondea hacia arriba
      expect(resultadoDown).toBe('$456'); // Redondea hacia abajo
    });
  });

  // Pruebas para toDateKey
  describe('toDateKey', function() {
    
    // Test 1: Caso válido
    it('debe convertir una fecha ISO a YYYY-MM-DD', function() {
      var resultado = window.AdminReportesLogic.toDateKey('2025-10-27T15:30:00.000Z');
      expect(resultado).toBe('2025-10-27');
    });

    // Test 2: Caso nulo
    it('debe manejar null (cae en catch)', function() {
      var resultado = window.AdminReportesLogic.toDateKey(null);
      // toDateKey usa new Date(null) que es válido y resulta en epoch
      expect(resultado).toBe('1970-01-01');
    });

    // Test 3: Caso inválido
    it('debe manejar una cadena inválida (cae en catch)', function() {
      var resultado = window.AdminReportesLogic.toDateKey('esto no es una fecha');
      expect(resultado).toBe('esto no es'); // String(...).slice(0,10)
    });
  });

  // Pruebas para calcularTotales
  describe('calcularTotales', function() {
    var mockOrdenes = [
      { total: 100, estado: 'pagado' },
      { total: 200, estado: 'pagado' },
      { total: 50, estado: 'fallido' },
      { total: 1000, estado: 'anulado' },
      { total: 'abc', estado: 'pagado' } // total inválido
    ];

    // Test 1: Caso válido
    it('debe sumar y contar correctamente', function() {
      var totales = window.AdminReportesLogic.calcularTotales(mockOrdenes);
      expect(totales.count).toBe(5);
      expect(totales.total).toBe(1350); // 100 + 200 + 50 + 1000 + 0
      expect(totales.pagado).toBe(3);
      expect(totales.fallido).toBe(1);
      expect(totales.anulado).toBe(1);
    });

    // Test 2: Caso nulo
    it('debe retornar ceros si la entrada es nula o undefined', function() {
      var totales = window.AdminReportesLogic.calcularTotales(null);
      expect(totales.count).toBe(0);
      expect(totales.total).toBe(0);
      expect(totales.pagado).toBe(0);
    });

    // Test 3: Caso borde (array vacío)
    it('debe retornar ceros si la entrada es un array vacío', function() {
      var totales = window.AdminReportesLogic.calcularTotales([]);
      expect(totales.count).toBe(0);
      expect(totales.total).toBe(0);
    });
  });
  
  // Pruebas para calcularVentasPorDia
  describe('calcularVentasPorDia', function() {
    // Mock de 'hoy' para consistencia
    var baseTime = new Date('2025-10-27T12:00:00Z');
    var mockOrdenes = [
      { fecha: '2025-10-27T10:00:00Z', total: 100, estado: 'pagado' },
      { fecha: '2025-10-27T11:00:00Z', total: 50, estado: 'pagado' },
      { fecha: '2025-10-26T10:00:00Z', total: 200, estado: 'pagado' },
      { fecha: '2025-10-26T11:00:00Z', total: 300, estado: 'fallido' }, // no debe sumar
    ];

    beforeEach(function() {
      jasmine.clock().install();
      jasmine.clock().mockDate(baseTime); // Fijamos 'hoy' a 2025-10-27
    });
    
    afterEach(function() {
      jasmine.clock().uninstall();
    });

    // Test 1: Caso válido (3 días)
    it('debe agrupar ventas y rellenar días vacíos', function() {
      var rango = '3';
      var ventas = window.AdminReportesLogic.calcularVentasPorDia(mockOrdenes, rango);
      
      expect(ventas.length).toBe(3);
      // Día 2025-10-25 (vacío)
      expect(ventas[0].fecha).toBe('2025-10-25');
      expect(ventas[0].pedidos).toBe(0);
      expect(ventas[0].ingresos).toBe(0);
      // Día 2025-10-26 (con datos)
      expect(ventas[1].fecha).toBe('2025-10-26');
      expect(ventas[1].pedidos).toBe(1);
      expect(ventas[1].ingresos).toBe(200);
      // Día 2025-10-27 (con datos)
      expect(ventas[2].fecha).toBe('2025-10-27');
      expect(ventas[2].pedidos).toBe(2);
      expect(ventas[2].ingresos).toBe(150);
    });

    // Test 2: Caso nulo (órdenes nulas)
    it('debe retornar un array de días en cero si no hay órdenes', function() {
      var rango = '2';
      var ventas = window.AdminReportesLogic.calcularVentasPorDia(null, rango);
      expect(ventas.length).toBe(2);
      expect(ventas[0].pedidos).toBe(0);
      expect(ventas[1].pedidos).toBe(0);
    });

    // Test 3: Caso borde (rango 0)
    it('debe retornar un array vacío si el rango es 0', function() {
      var rango = '0';
      var ventas = window.AdminReportesLogic.calcularVentasPorDia(mockOrdenes, rango);
      expect(ventas.length).toBe(0);
    });
  });

  // Pruebas para calcularTopProductos
  describe('calcularTopProductos', function() {
    var mockOrdenes = [
      { estado: 'pagado', items: [
        { codigo: 'P1', nombre: 'Torta', cantidad: 1, precio: 100 },
        { codigo: 'P2', nombre: 'Kuchen', cantidad: 2, precio: 50 }, // 100
      ]},
      { estado: 'pagado', items: [
        { codigo: 'P1', nombre: 'Torta', cantidad: 3, precio: 100 }, // 300
      ]},
      { estado: 'fallido', items: [ // No debe contar
        { codigo: 'P3', nombre: 'Galletas', cantidad: 10, precio: 10 },
      ]}
    ];

    // Test 1: Caso válido
    it('debe sumar cantidades e ingresos de productos pagados', function() {
      var top = window.AdminReportesLogic.calcularTopProductos(mockOrdenes);
      expect(top.length).toBe(2);
      // P1 debe ser primero
      expect(top[0].codigo).toBe('P1');
      expect(top[0].cantidad).toBe(4); // 1 + 3
      expect(top[0].ingresos).toBe(400); // 100 + 300
      // P2
      expect(top[1].codigo).toBe('P2');
      expect(top[1].cantidad).toBe(2);
      expect(top[1].ingresos).toBe(100);
    });
    
    // Test 2: Caso nulo
    it('debe retornar un array vacío si las órdenes son nulas', function() {
      var top = window.AdminReportesLogic.calcularTopProductos(null);
      expect(top.length).toBe(0);
    });

    // Test 3: Caso borde (sin órdenes pagadas)
    it('debe retornar un array vacío si no hay órdenes pagadas', function() {
      var soloFallidas = [ { estado: 'fallido', items: [{ codigo: 'P1', cantidad: 1, precio: 10 }] }];
      var top = window.AdminReportesLogic.calcularTopProductos(soloFallidas);
      expect(top.length).toBe(0);
    });
  });

  // Pruebas para exportarOrdenes (y exportCSV)
  describe('exportarOrdenes (y exportCSV)', function() {
    
    // Mock de las APIs del navegador usadas por exportCSV 
    var mockAnchor = { click: jasmine.createSpy('click') };
    
    beforeEach(function() {
      // Espiamos las funciones que exportarOrdenes debe llamar
      // 1. La llamada interna a exportCSV
      spyOn(window.AdminReportesLogic, 'exportCSV').and.callThrough();
      
      // 2. Las APIs del navegador que usa exportCSV
      spyOn(URL, 'createObjectURL').and.returnValue('blob:mock-url-123');
      spyOn(URL, 'revokeObjectURL');
      spyOn(document, 'createElement').and.returnValue(mockAnchor);
      mockAnchor.click.calls.reset(); // Reseteamos el spy de click
    });

    // Test 1: Caso válido
    it('debe llamar a exportCSV con los datos y formato correctos', function() {
      var mockOrdenes = [
        { id: 1, codigo: 'C1', nro: 123, fecha: '2025-10-27', estado: 'pagado', total: 1000, cliente: { correo: 'a@b.com' }},
        { id: 2, codigo: 'C2', nro: 124, fecha: '2025-10-26', estado: 'anulado', total: 500, cliente: null } // cliente nulo
      ];
      var rango = '7';
      
      window.AdminReportesLogic.exportarOrdenes(mockOrdenes, rango);
      
      // 1. Validar que exportCSV fue llamado
      expect(window.AdminReportesLogic.exportCSV).toHaveBeenCalledTimes(1);
      
      // 2. Validar los argumentos de exportCSV
      var args = window.AdminReportesLogic.exportCSV.calls.argsFor(0);
      expect(args[0]).toBe('ordenes_7d.csv'); // filename
      expect(args[1].length).toBe(2); // rows
      expect(args[1][0].cliente).toBe('a@b.com');
      expect(args[1][1].cliente).toBe(''); // Manejo de cliente nulo 

      // 3. Validar que las APIs del navegador fueron llamadas
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockAnchor.href).toBe('blob:mock-url-123');
      expect(mockAnchor.download).toBe('ordenes_7d.csv');
      expect(mockAnchor.click).toHaveBeenCalledTimes(1);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url-123');
    });

    // Test 2: Caso nulo
    it('debe manejar órdenes nulas (genera CSV solo con cabecera)', function() {
      window.AdminReportesLogic.exportarOrdenes(null, '30');
      
      var args = window.AdminReportesLogic.exportCSV.calls.argsFor(0);
      expect(args[0]).toBe('ordenes_30d.csv');
      expect(args[1].length).toBe(0); // El array de filas está vacío
      expect(mockAnchor.click).toHaveBeenCalled(); // Aun así genera el archivo (vacío)
    });

    // Test 3: Caso borde (CSV con comillas)
    it('exportCSV debe escapar comillas dobles correctamente', function() {
       var mockOrdenes = [
        { id: 1, codigo: 'C1"X', nro: 123, fecha: '2025-10-27', estado: 'pagado', total: 1000, cliente: { correo: 'a@b.com' }}
      ];
      
      // Espiamos Blob para verificar el contenido
      var mockBlobInstance;
      spyOn(window, 'Blob').and.callFake(function(content, options) {
        mockBlobInstance = { content: content, options: options };
        return mockBlobInstance;
      });

      window.AdminReportesLogic.exportarOrdenes(mockOrdenes, '1');
      
      var csvContent = mockBlobInstance.content[0];
      var expectedHeader = 'id,codigo,nro,fecha,estado,total,cliente';
      // La fila debe tener el valor "C1""X" (escapado)
      var expectedRow = '"1","C1""X","123","2025-10-27","pagado","1000","a@b.com"';
      
      expect(csvContent).toContain(expectedHeader);
      expect(csvContent).toContain(expectedRow);
    });

  });
});