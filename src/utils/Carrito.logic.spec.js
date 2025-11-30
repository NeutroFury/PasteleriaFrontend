/* ================================================================== */
/* Pruebas Jasmine para la Lógica del Componente Carrito              */
/* (Generado automáticamente para Jasmine + Karma)                    */
/* ================================================================== */


// NOTA: No usar destructuración (const { ... } = window.CarritoLogic)
// para evitar errores de redeclaración en Karma.  

describe('CarritoLogic', function () {

  // Asegurarse de que la lógica esté cargada
  it('debe estar cargado en window.CarritoLogic', function () {
    expect(window.CarritoLogic).toBeDefined();
  });

  /* ------------------------------------------------------------------ */
  /* Pruebas para: resolveImg                                           */
  /* ------------------------------------------------------------------ */
  describe('resolveImg', function () {

    // Test 1: Entrada válida (ruta relativa)  
    it('debe prefijar PUBLIC_URL a rutas relativas', function () {
      const publicUrl = '/mi-app';
      const src = 'images/torta.jpg';
      const resultado = window.CarritoLogic.resolveImg(src, publicUrl);
      expect(resultado).toBe('/mi-app/images/torta.jpg');
    });
    
    // Test 2: Caso borde (PUBLIC_URL con / al final)  
    it('debe manejar PUBLIC_URL con / al final', function () {
      const publicUrl = '/mi-app/';
      const src = 'images/torta.jpg';
      const resultado = window.CarritoLogic.resolveImg(src, publicUrl);
      expect(resultado).toBe('/mi-app/images/torta.jpg');
    });

    // Test 3: Entrada válida (ruta absoluta http)  
    it('debe retornar la URL absoluta (http) sin cambios', function () {
      const publicUrl = '/mi-app';
      const src = 'http://example.com/torta.jpg';
      const resultado = window.CarritoLogic.resolveImg(src, publicUrl);
      expect(resultado).toBe('http://example.com/torta.jpg');
    });

    // Test 4: Entrada nula/incorrecta (null)  
    it('debe retornar string vacío si la entrada es nula', function () {
      const publicUrl = '/mi-app';
      const src = null;
      const resultado = window.CarritoLogic.resolveImg(src, publicUrl);
      expect(resultado).toBe('');
    });
  });

  /* ------------------------------------------------------------------ */
  /* Pruebas para: CLP                                                  */
  /* ------------------------------------------------------------------ */
  describe('CLP', function () {

    // Test 1: Entrada válida (número entero)  
    it('debe formatear un número entero como CLP', function () {
      const resultado = window.CarritoLogic.CLP(5000);
      // Nota: El espacio puede variar (espacio normal o non-breaking space)
      expect(resultado).toContain('$');
      expect(resultado).toContain('5.000');
    });

    // Test 2: Entrada nula/incorrecta (string)  
    it('debe manejar strings numéricos', function () {
      const resultado = window.CarritoLogic.CLP("3500");
      expect(resultado).toContain('$');
      expect(resultado).toContain('3.500');
    });

    // Test 3: Caso borde (cero)  
    it('debe formatear 0 correctamente', function () {
      const resultado = window.CarritoLogic.CLP(0);
      expect(resultado).toContain('$');
      expect(resultado).toContain('0');
    });
  });

  /* ------------------------------------------------------------------ */
  /* Pruebas para: precioConDescuento                                   */
  /* ------------------------------------------------------------------ */
  describe('precioConDescuento', function () {
    
    // Test 1: Entrada válida (con descuento)  
    it('debe aplicar un descuento válido', function () {
      const p = { precio: 1000, descuento: 10 }; // 10% de 1000 = 900
      const resultado = window.CarritoLogic.precioConDescuento(p);
      expect(resultado).toBe(900);
    });

    // Test 2: Entrada válida (sin descuento)  
    it('debe retornar el precio base si el descuento es 0', function () {
      const p = { precio: 1000, descuento: 0 };
      const resultado = window.CarritoLogic.precioConDescuento(p);
      expect(resultado).toBe(1000);
    });

    // Test 3: Entrada nula/incorrecta (producto nulo)  
    it('debe retornar 0 si el producto es nulo', function () {
      const resultado = window.CarritoLogic.precioConDescuento(null);
      expect(resultado).toBe(0);
    });

    // Test 4: Caso borde (descuento 100%)  
    it('debe retornar 0 si el descuento es 100%', function () {
      const p = { precio: 1000, descuento: 100 };
      const resultado = window.CarritoLogic.precioConDescuento(p);
      expect(resultado).toBe(0);
    });
  });

  /* ------------------------------------------------------------------ */
  /* Pruebas para: calcularTotal                                        */
  /* ------------------------------------------------------------------ */
  describe('calcularTotal', function () {
    const carrito = [
      { codigo: 'A', precio: 1000, cantidad: 2 }, // 2000
      { codigo: 'B', precio: 500, cantidad: 1 },  // 500
    ];

    // Test 1: Entrada válida  
    it('debe sumar los subtotales del carrito', function () {
      const resultado = window.CarritoLogic.calcularTotal(carrito);
      expect(resultado).toBe(2500);
    });

    // Test 2: Entrada nula/incorrecta (no array)  
    it('debe retornar 0 si la entrada no es un array', function () {
      const resultado = window.CarritoLogic.calcularTotal(null);
      expect(resultado).toBe(0);
    });

    // Test 3: Caso borde (carrito vacío)  
    it('debe retornar 0 si el carrito está vacío', function () {
      const resultado = window.CarritoLogic.calcularTotal([]);
      expect(resultado).toBe(0);
    });
  });

  /* ------------------------------------------------------------------ */
  /* Pruebas para: logic_incrementar                                    */
  /* ------------------------------------------------------------------ */
  describe('logic_incrementar', function () {
    const carritoBase = [{ codigo: 'A', precio: 1000, cantidad: 1 }];

    // Test 1: Entrada válida  
    it('debe incrementar la cantidad del item correcto', function () {
      const nuevoCarrito = window.CarritoLogic.logic_incrementar(carritoBase, 'A');
      expect(nuevoCarrito[0].cantidad).toBe(2);
    });

    // Test 2: Entrada nula/incorrecta (código no existe)  
    it('no debe modificar el carrito si el código no existe', function () {
      const nuevoCarrito = window.CarritoLogic.logic_incrementar(carritoBase, 'B');
      expect(nuevoCarrito[0].cantidad).toBe(1);
      expect(nuevoCarrito.length).toBe(1);
    });

    // Test 3: Caso borde (límite de 5)  
    it('no debe incrementar si la cantidad es 5 o más', function () {
      const carritoLleno = [{ codigo: 'A', precio: 1000, cantidad: 5 }];
      const nuevoCarrito = window.CarritoLogic.logic_incrementar(carritoLleno, 'A');
      expect(nuevoCarrito[0].cantidad).toBe(5);
    });
  });

  /* ------------------------------------------------------------------ */
  /* Pruebas para: logic_decrementar                                    */
  /* ------------------------------------------------------------------ */
  describe('logic_decrementar', function () {
    const carritoBase = [{ codigo: 'A', precio: 1000, cantidad: 2 }];

    // Test 1: Entrada válida  
    it('debe decrementar la cantidad del item correcto', function () {
      const nuevoCarrito = window.CarritoLogic.logic_decrementar(carritoBase, 'A');
      expect(nuevoCarrito[0].cantidad).toBe(1);
    });

    // Test 2: Entrada nula/incorrecta (código no existe)  
    it('no debe modificar el carrito si el código no existe', function () {
      const nuevoCarrito = window.CarritoLogic.logic_decrementar(carritoBase, 'B');
      expect(nuevoCarrito[0].cantidad).toBe(2);
    });

    // Test 3: Caso borde (límite de 1)  
    it('no debe decrementar si la cantidad es 1 (lógica original)', function () {
      const carritoMin = [{ codigo: 'A', precio: 1000, cantidad: 1 }];
      const nuevoCarrito = window.CarritoLogic.logic_decrementar(carritoMin, 'A');
      expect(nuevoCarrito[0].cantidad).toBe(1);
    });
  });

  /* ------------------------------------------------------------------ */
  /* Pruebas para: logic_eliminar                                       */
  /* ------------------------------------------------------------------ */
  describe('logic_eliminar', function () {
    const carritoBase = [
      { codigo: 'A', precio: 1000, cantidad: 1 },
      { codigo: 'B', precio: 500, cantidad: 1 },
    ];

    // Test 1: Entrada válida  
    it('debe eliminar el item correcto', function () {
      const nuevoCarrito = window.CarritoLogic.logic_eliminar(carritoBase, 'A');
      expect(nuevoCarrito.length).toBe(1);
      expect(nuevoCarrito[0].codigo).toBe('B');
    });

    // Test 2: Entrada nula/incorrecta (código no existe)  
    it('no debe modificar el carrito si el código no existe', function () {
      const nuevoCarrito = window.CarritoLogic.logic_eliminar(carritoBase, 'C');
      expect(nuevoCarrito.length).toBe(2);
    });

    // Test 3: Caso borde (eliminar el último item)  
    it('debe retornar un array vacío si se elimina el último item', function () {
      const carritoMin = [{ codigo: 'A', precio: 1000, cantidad: 1 }];
      const nuevoCarrito = window.CarritoLogic.logic_eliminar(carritoMin, 'A');
      expect(nuevoCarrito.length).toBe(0);
    });
  });

  /* ------------------------------------------------------------------ */
  /* Pruebas para: logic_limpiar                                        */
  /* ------------------------------------------------------------------ */
  describe('logic_limpiar', function () {

    // Test 1: Funcionalidad principal  
    it('debe retornar un array vacío', function () {
      const nuevoCarrito = window.CarritoLogic.logic_limpiar();
      expect(nuevoCarrito).toEqual([]);
    });
  });

  /* ------------------------------------------------------------------ */
  /* Pruebas para: logic_agregarDesdeListado                            */
  /* ------------------------------------------------------------------ */
  describe('logic_agregarDesdeListado', function () {
    // Función helper de precio para inyectar en los tests
    const mockPrecioFn = window.CarritoLogic.precioConDescuento;

    // Test 1: Entrada válida (agregar item nuevo)  
    it('debe agregar un item nuevo al carrito', function () {
      const carrito = [];
      const p = { codigo: 'A', nombre: 'Torta', precio: 1000, descuento: 0 };
      const nuevoCarrito = window.CarritoLogic.logic_agregarDesdeListado(carrito, p, mockPrecioFn);
      expect(nuevoCarrito.length).toBe(1);
      expect(nuevoCarrito[0].codigo).toBe('A');
      expect(nuevoCarrito[0].cantidad).toBe(1);
      expect(nuevoCarrito[0].precio).toBe(1000);
    });

    // Test 2: Entrada válida (incrementar item existente)  
    it('debe incrementar un item existente', function () {
      const carrito = [{ codigo: 'A', nombre: 'Torta', precio: 1000, cantidad: 1 }];
      const p = { codigo: 'A', nombre: 'Torta', precio: 1000, descuento: 0 };
      const nuevoCarrito = window.CarritoLogic.logic_agregarDesdeListado(carrito, p, mockPrecioFn);
      expect(nuevoCarrito.length).toBe(1);
      expect(nuevoCarrito[0].cantidad).toBe(2);
    });

    // Test 3: Caso borde (límite de 5)  
    it('no debe agregar si el item existente está en 5', function () {
      const carrito = [{ codigo: 'A', nombre: 'Torta', precio: 1000, cantidad: 5 }];
      const p = { codigo: 'A', nombre: 'Torta', precio: 1000, descuento: 0 };
      const nuevoCarrito = window.CarritoLogic.logic_agregarDesdeListado(carrito, p, mockPrecioFn);
      expect(nuevoCarrito.length).toBe(1);
      expect(nuevoCarrito[0].cantidad).toBe(5);
    });

    // Test 4: Caso borde (actualizar precio por descuento)  
    it('debe actualizar el precio del item si cambió (ej. descuento)', function () {
      // El item en el carrito tiene precio antiguo (1000)
      const carrito = [{ codigo: 'A', nombre: 'Torta', precio: 1000, cantidad: 1 }];
      // El producto en el listado ahora tiene descuento (precio final 900)
      const p = { codigo: 'A', nombre: 'Torta', precio: 1000, descuento: 10 };
      const nuevoCarrito = window.CarritoLogic.logic_agregarDesdeListado(carrito, p, mockPrecioFn);
      
      expect(nuevoCarrito.length).toBe(1);
      expect(nuevoCarrito[0].cantidad).toBe(2); // Incrementa cantidad
      expect(nuevoCarrito[0].precio).toBe(900); // Actualiza precio
    });

    // Test 5: Entrada nula/incorrecta (producto nulo)  
    it('no debe hacer nada si el producto es nulo', function () {
      const carrito = [{ codigo: 'A', cantidad: 1 }];
      const nuevoCarrito = window.CarritoLogic.logic_agregarDesdeListado(carrito, null, mockPrecioFn);
      expect(nuevoCarrito).toBe(carrito); // Retorna el carrito original
      expect(nuevoCarrito.length).toBe(1);
    });
  });

});