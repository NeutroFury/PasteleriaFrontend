// AdminProductos.logic.spec.js
// Pruebas Jasmine para AdminProductos.logic.js
//  

describe('AdminProductos.logic.js', function() {

  // Asegurarse de que la lógica esté cargada en window
  // En Karma, esto se configura en 'files' dentro de karma.conf.js
  beforeAll(function() {
    if (!window.AdminProductosLogic) {
      console.error('AdminProductos.logic.js no se cargó. Verifica tu karma.conf.js');
    }
  });

  // --- Tests para CLP ---
  //  
  describe('window.AdminProductosLogic.CLP', function() {

    // Test de entrada válida (número)  
    it('debe formatear un número a CLP', function() {
      // No usar destructuring  
      var resultado = window.AdminProductosLogic.CLP(25000);
      // Usamos regex para ignorar el espacio sin quiebre (NBSP)
      expect(resultado).toMatch(/\$25\.000/);
    });

    // Test de entrada incorrecta (string no numérico)  
    it('debe manejar strings no numéricos', function() {
      var resultado = window.AdminProductosLogic.CLP('hola');
      expect(resultado).toBe('NaN'); // Comportamiento de Number('hola')
    });

    // Test de caso borde (cero y nulo)  
    it('debe manejar 0 y null correctamente', function() {
      expect(window.AdminProductosLogic.CLP(0)).toMatch(/\$0/);
      expect(window.AdminProductosLogic.CLP(null)).toMatch(/\$0/);
    });
  });

  // --- Tests para validateProductoForm ---
  //  
  describe('window.AdminProductosLogic.validateProductoForm', function() {
    var formValido = { codigo: 'C01', nombre: 'Torta', categoria: 'Tortas', precio: 1000 };

    // Test de entrada válida  
    it('debe retornar null para un formulario válido', function() {
      var resultado = window.AdminProductosLogic.validateProductoForm(formValido);
      expect(resultado).toBeNull();
    });

    // Test de entrada incorrecta (campos requeridos con espacios)  
    it('debe retornar error si faltan campos requeridos (o solo espacios)', function() {
      var formInvalido = { ...formValido, nombre: '   ' };
      var error = 'Completa al menos: código, nombre y categoría';
      expect(window.AdminProductosLogic.validateProductoForm(formInvalido)).toBe(error);
      expect(window.AdminProductosLogic.validateProductoForm({ ...formValido, codigo: '' })).toBe(error);
      expect(window.AdminProductosLogic.validateProductoForm(null)).toBe(error);
    });

    // Test de caso borde (precio inválido)  
    it('debe retornar error si el precio es negativo o NaN', function() {
      var formPrecioNeg = { ...formValido, precio: -100 };
      var formPrecioNaN = { ...formValido, precio: 'abc' };
      var error = 'Precio inválido';
      expect(window.AdminProductosLogic.validateProductoForm(formPrecioNeg)).toBe(error);
      expect(window.AdminProductosLogic.validateProductoForm(formPrecioNaN)).toBe(error);
    });
  });

  // --- Tests para resolveImg ---
  //  
  describe('window.AdminProductosLogic.resolveImg', function() {

    // Test de entrada válida (ruta relativa)  
    it('debe anteponer un / a rutas relativas', function() {
      var resultado = window.AdminProductosLogic.resolveImg('img/torta.png');
      expect(resultado).toBe('/img/torta.png');
    });

    // Test de entrada incorrecta (nulo o vacío)  
    it('debe retornar string vacío si no hay src', function() {
      expect(window.AdminProductosLogic.resolveImg(null)).toBe('');
      expect(window.AdminProductosLogic.resolveImg('')).toBe('');
    });

    // Test de caso borde (URL absoluta o data URI)  
    it('debe retornar la misma URL si es absoluta o data URI', function() {
      var urlHttp = 'http://example.com/img.png';
      var urlData = 'data:image/png;base64,...';
      expect(window.AdminProductosLogic.resolveImg(urlHttp)).toBe(urlHttp);
      expect(window.AdminProductosLogic.resolveImg(urlData)).toBe(urlData);
    });
  });
  
  // --- Tests para getStatusPillColors ---
  //  
  describe('window.AdminProductosLogic.getStatusPillColors', function() {

    // Test de entrada válida ("disponible")  
    it('debe retornar colores correctos para "disponible"', function() {
      var colores = window.AdminProductosLogic.getStatusPillColors('disponible');
      expect(colores.bg).toBe('#e9ffe8');
      expect(colores.fg).toBe('#0f5d1d');
    });

    // Test de entrada válida ("agotado")  
    it('debe retornar colores correctos para "agotado"', function() {
      var colores = window.AdminProductosLogic.getStatusPillColors('agotado');
      expect(colores.bg).toBe('#fff5f5');
      expect(colores.fg).toBe('#9b2c2c');
    });

    // Test de caso borde (estado desconocido o nulo)  
    it('debe retornar colores por defecto para estados desconocidos', function() {
      var coloresDefault = { bg: '#f5f5f5', fg: '#4a4a4a' };
      expect(window.AdminProductosLogic.getStatusPillColors('vendido')).toEqual(coloresDefault);
      expect(window.AdminProductosLogic.getStatusPillColors(null)).toEqual(coloresDefault);
    });
  });

  // --- Tests para getCategorias ---
  //  
  describe('window.AdminProductosLogic.getCategorias', function() {
    var items = [
      { categoria: 'Tortas' },
      { categoria: 'Kuchen' },
      { categoria: 'Tortas' }, // Duplicado
      { categoria: 'Galletas' }
    ];

    // Test de entrada válida  
    it('debe retornar categorías únicas y ordenadas', function() {
      var resultado = window.AdminProductosLogic.getCategorias(items);
      expect(resultado).toEqual(['Galletas', 'Kuchen', 'Tortas']);
    });

    // Test de entrada incorrecta (nulo o vacío)  
    it('debe retornar array vacío si no hay items', function() {
      expect(window.AdminProductosLogic.getCategorias(null)).toEqual([]);
      expect(window.AdminProductosLogic.getCategorias([])).toEqual([]);
    });

    // Test de caso borde (items sin categoría)  
    it('debe manejar items con categoría nula o undefined', function() {
      var itemsRaros = [{ categoria: 'Postres' }, { categoria: undefined }, { categoria: 'Postres' }];
      var resultado = window.AdminProductosLogic.getCategorias(itemsRaros);
        expect(resultado).toEqual(['Postres']);
    });
  });

  // --- Tests para filterItems ---
  //  
  describe('window.AdminProductosLogic.filterItems', function() {
    var items = [
      { codigo: 'T01', nombre: 'Torta Chocolate', descripcion: 'Deliciosa', categoria: 'Tortas', estado: 'disponible' },
      { codigo: 'K01', nombre: 'Kuchen Manzana', descripcion: '', categoria: 'Kuchen', estado: 'agotado' },
      { codigo: 'G01', nombre: 'Galletas Avena', descripcion: 'Saludable', categoria: 'Galletas', estado: 'disponible' }
    ];

    // Test de entrada válida (filtro por búsqueda de nombre)  
    it('debe filtrar por término de búsqueda (ignorando mayúsculas)', function() {
      var res = window.AdminProductosLogic.filterItems(items, ' CHOCOLATE ', '', ''); // Con espacios
      expect(res.length).toBe(1);
      expect(res[0].codigo).toBe('T01');
    });

    // Test de entrada válida (filtro por categoría y estado)  
    it('debe filtrar por categoría y estado simultáneamente', function() {
      var res = window.AdminProductosLogic.filterItems(items, '', 'Galletas', 'disponible');
      expect(res.length).toBe(1);
      expect(res[0].codigo).toBe('G01');
    });

    // Test de caso borde (sin filtros y sin items)  
    it('debe retornar todos los items si no hay filtros, o vacío si no hay items', function() {
      var resTodos = window.AdminProductosLogic.filterItems(items, '', '', '');
      expect(resTodos.length).toBe(3);

      var resNinguno = window.AdminProductosLogic.filterItems(null, 'torta', '', '');
      expect(resNinguno.length).toBe(0);
    });
  });

  // --- Tests para onSaveLogic y onDeleteLogic (con mocks) ---
  //  
  describe('Lógica de guardado y borrado (con mocks)', function() {
    var mockProductService;
    var mockConfirm;
    var spyCreate;
    var spyUpdate;
    var spyRemove;

    // Preparar Mocks
    beforeEach(function() {
      spyCreate = jasmine.createSpy('create');
      spyUpdate = jasmine.createSpy('update');
      spyRemove = jasmine.createSpy('remove');

      mockProductService = {
        create: spyCreate,
        update: spyUpdate,
        remove: spyRemove
      };
    });

    // --- onSaveLogic ---
    // Test de entrada válida (Crear)  
    it('onSaveLogic debe llamar a productService.create si no se está editando', function() {
      var data = { nombre: 'Nuevo' };
      window.AdminProductosLogic.onSaveLogic(data, null, mockProductService);
      expect(spyCreate).toHaveBeenCalledWith(data);
      expect(spyUpdate).not.toHaveBeenCalled();
    });

    // Test de entrada válida (Actualizar)  
    it('onSaveLogic debe llamar a productService.update si se está editando', function() {
      var data = { nombre: 'Actualizado' };
      var editing = { codigo: 'T01' };
      window.AdminProductosLogic.onSaveLogic(data, editing, mockProductService);
      expect(spyUpdate).toHaveBeenCalledWith('T01', data);
      expect(spyCreate).not.toHaveBeenCalled();
    });

    // Test de entrada incorrecta (servicio falla)  
    it('onSaveLogic debe lanzar una excepción si productService lanza un error', function() {
      spyCreate.and.throwError('DB Error');
      var data = { nombre: 'Nuevo' };
      // Verificamos que la excepción se propaga
      expect(function() {
        window.AdminProductosLogic.onSaveLogic(data, null, mockProductService);
      }).toThrowError('DB Error');
    });

    // --- onDeleteLogic ---
    // Test de entrada válida (Confirmado)  
    it('onDeleteLogic debe llamar a productService.remove si se confirma', function() {
      mockConfirm = function() { return true; }; // Simula "Aceptar"
      var resultado = window.AdminProductosLogic.onDeleteLogic('T01', mockConfirm, mockProductService);
      expect(resultado).toBe(true);
      expect(spyRemove).toHaveBeenCalledWith('T01');
    });

    // Test de entrada válida (Cancelado)  
    it('onDeleteLogic no debe llamar a productService.remove si se cancela', function() {
      mockConfirm = function() { return false; }; // Simula "Cancelar"
      var resultado = window.AdminProductosLogic.onDeleteLogic('T01', mockConfirm, mockProductService);
      expect(resultado).toBe(false);
      expect(spyRemove).not.toHaveBeenCalled();
    });
    
    // Test de entrada incorrecta (servicio falla)  
    it('onDeleteLogic debe propagar la excepción si productService falla (incluso si se confirma)', function() {
      mockConfirm = function() { return true; };
      spyRemove.and.throwError('DB Error');
      expect(function() {
        window.AdminProductosLogic.onDeleteLogic('T01', mockConfirm, mockProductService);
      }).toThrowError('DB Error');
    });
  });

});