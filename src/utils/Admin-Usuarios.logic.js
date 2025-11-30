/*
 * Archivo: AdminUsuarios.logic.js
 * Lógica pura para el componente AdminUsuarios.
 * Este archivo se carga en window.AdminUsuariosLogic
 */

// Evita la redeclaración si el script se carga múltiples veces  
if (!window.AdminUsuariosLogic) {
  window.AdminUsuariosLogic = (function() {

    /**
     * Formatea una fecha ISO a una cadena 'es-CL' legible.  
     * @param {string} iso - La cadena de fecha en formato ISO.
     * @returns {string} - La fecha formateada o la entrada original si falla.
     */
    function fmtDate(iso) {
      // Manejar entrada nula o undefined
      if (!iso || iso === null || iso === undefined) {
        return '';
      }
      
      try {
        // Intenta convertir la fecha al formato local de Chile
        const date = new Date(iso);
        
        // Verificar si la fecha es válida
        if (isNaN(date.getTime())) {
          // Si la fecha es inválida, devuelve la entrada original
          return iso;
        }
        
        // Formatear con el formato DD/MM/YYYY, HH:MM:SS para 'es-CL'
        return date.toLocaleString('es-CL', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      } catch {
        // Si falla (p.ej., entrada inválida), devuelve la entrada original
        return iso || '';
      }
    }

    /**
     * Filtra una lista de usuarios basada en múltiples criterios:
     * búsqueda (nombre o email), estado y rol.  
     * @param {Array<Object>} items - El array de usuarios a filtrar.
     * @param {string} search - El término de búsqueda (nombre o email).
     * @param {string} estado - El estado a filtrar ('activo', 'inactivo', '').
     * @param {string} rol - El rol a filtrar ('cliente', 'admin', '').
     * @returns {Array<Object>} - El array de usuarios filtrados.
     */
    function filterItems(items, search, estado, rol) {
      // Normaliza el término de búsqueda
      const q = String(search || '').toLowerCase().trim();
      const itemsList = items || [];

      // Filtra la lista
      return itemsList.filter((u) => {
        // Comprueba si la búsqueda coincide (si 'q' no está vacío)
        const okQ = !q ||
          (u.nombre && u.nombre.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q));
        
        // Comprueba si el estado coincide (si 'estado' no está vacío)
        const okE = !estado || u.estado === estado;
        
        // Comprueba si el rol coincide (si 'rol' no está vacío)
        const okR = !rol || u.rol === rol;
        
        // Devuelve verdadero solo si todas las condiciones se cumplen
        return okQ && okE && okR;
      });
    }

    // Exponer las funciones puras al objeto global  
    return {
      fmtDate: fmtDate,
      filterItems: filterItems
    };

  })();
}