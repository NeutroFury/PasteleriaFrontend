/*
 * Archivo: AdminUsuarios.logic.spec.js
 * Pruebas Jasmine para la lógica pura de AdminUsuarios.  
 */

describe("AdminUsuarios.logic", function() {

  // Asumimos que AdminUsuarios.logic.js ya está cargado en el entorno
  // de pruebas (p.ej., a través de karma.conf.js)

  // --- Pruebas para fmtDate ---

  describe("fmtDate", function() {

    /**
     * Prueba de caso válido: una fecha ISO estándar.  21, 22]
     */
    it("debería formatear una fecha ISO válida a 'es-CL'", function() {
      var isoString = "2025-10-27T14:30:00.000Z";
      // Usamos window.AdminUsuariosLogic como pide la instrucción  
      var result = window.AdminUsuariosLogic.fmtDate(isoString);
      // El resultado exacto depende de la zona horaria del ejecutor,
      // pero para 'es-CL' debe contener el formato DD/MM/YYYY o DD-MM-YYYY.
      var hasSlashFormat = result.indexOf("27/10/2025") !== -1;
      var hasDashFormat = result.indexOf("27-10-2025") !== -1;
      expect(hasSlashFormat || hasDashFormat).toBe(true);
      expect(result).toContain(":"); // Debe incluir la hora
    });

    /**
     * Prueba de caso nulo/incorrecto: entrada nula.  
     */
    it("debería devolver una cadena vacía para una entrada nula", function() {
      var result = window.AdminUsuariosLogic.fmtDate(null);
      expect(result).toBe("");
    });

    /**
     * Prueba de caso borde: una cadena de fecha inválida.  
     */
    it("debería devolver la cadena original si la fecha es inválida", function() {
      var invalidString = "esto-no-es-una-fecha";
      var result = window.AdminUsuariosLogic.fmtDate(invalidString);
      expect(result).toBe("esto-no-es-una-fecha");
    });
  });

  // --- Pruebas para filterItems ---

  describe("filterItems", function() {

    // Datos de prueba
    var mockUsers = [
      { id: 1, nombre: "Ana López", email: "ana@mail.com", rol: "admin", estado: "activo" },
      { id: 2, nombre: "Bruno Díaz", email: "bruno@mail.com", rol: "cliente", estado: "activo" },
      { id: 3, nombre: "Carla Mora", email: "carla@mail.com", rol: "cliente", estado: "inactivo" }
    ];

    /**
     * Prueba de caso válido: filtrar por término de búsqueda (nombre).  
     */
    it("debería filtrar por término de búsqueda (nombre)", function() {
      var result = window.AdminUsuariosLogic.filterItems(mockUsers, "Ana", "", "");
      expect(result.length).toBe(1);
      expect(result[0].nombre).toBe("Ana López");
    });

    /**
     * Prueba de caso válido: filtrar por término de búsqueda (email).  
     */
    it("debería filtrar por término de búsqueda (email) con mayúsculas/minúsculas", function() {
      var result = window.AdminUsuariosLogic.filterItems(mockUsers, " BRUNO@MAIL.COM ", "", "");
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(2);
    });

    /**
     * Prueba de caso válido: filtrar por estado.  
     */
    it("debería filtrar por estado 'inactivo'", function() {
      var result = window.AdminUsuariosLogic.filterItems(mockUsers, "", "inactivo", "");
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(3);
    });

    /**
     * Prueba de caso válido: filtrar por rol.  
     */
    it("debería filtrar por rol 'cliente'", function() {
      var result = window.AdminUsuariosLogic.filterItems(mockUsers, "", "", "cliente");
      expect(result.length).toBe(2);
      expect(result[0].id).toBe(2);
      expect(result[1].id).toBe(3);
    });

    /**
     * Prueba de caso válido: filtros combinados (rol cliente y estado activo).  
     */
    it("debería filtrar por rol 'cliente' Y estado 'activo'", function() {
      var result = window.AdminUsuariosLogic.filterItems(mockUsers, "", "activo", "cliente");
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(2);
    });

    /**
     * Prueba de caso nulo/incorrecto: array de items nulo.  
     */
    it("debería devolver un array vacío si los items son nulos", function() {
      var result = window.AdminUsuariosLogic.filterItems(null, "Ana", "", "");
      expect(result.length).toBe(0);
    });

    /**
     * Prueba de caso borde: sin filtros (debe devolver todo).  
     */
    it("debería devolver todos los items si no hay filtros", function() {
      var result = window.AdminUsuariosLogic.filterItems(mockUsers, "", "", "");
      expect(result.length).toBe(3);
    });

    /**
     * Prueba de caso borde: término de búsqueda que no coincide.  
     */
    it("debería devolver un array vacío si la búsqueda no coincide", function() {
      var result = window.AdminUsuariosLogic.filterItems(mockUsers, "Zacarias", "", "");
      expect(result.length).toBe(0);
    });
  });

});