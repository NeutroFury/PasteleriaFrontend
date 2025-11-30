/*
 * Archivo de lógica pura para el componente PagoBien.
 * Contiene las funciones de formato, cálculo y acciones extraídas del componente.
 * Estas funciones se adjuntan a 'window.PagoBienLogic' para ser accesibles globalmente
 * y poder ser probadas por Jasmine/Karma.
 */
(function (window) {
    
    // Evita la redeclaración si el script se carga varias veces
    if (window.PagoBienLogic) {
        return;
    }

    window.PagoBienLogic = {};

    /**
     * Formatea un número a moneda chilena (CLP).
     * @param {number|string} n - El número a formatear.
     * @returns {string} - El número formateado como "$X.XXX".
     */
    window.PagoBienLogic.CLP = function (n) {
            var num = Number(n);
            if (isNaN(num)) {
                return '$0';
            }
            return num.toLocaleString("es-CL", {
            style: "currency",
            currency: "CLP",
            maximumFractionDigits: 0,
        });
    };

    /**
     * Calcula el total de la orden sumando los subtotales de los items.
     * @param {object} orden - El objeto de la orden, debe contener un array 'items'.
     * @returns {number} - El total calculado.
     */
    window.PagoBienLogic.calcularTotal = function (orden) {
        if (!orden || !Array.isArray(orden.items)) {
            return 0;
        }
        return (orden.items || []).reduce(
            (s, it) => s + (Number(it.precio) || 0) * (Number(it.cantidad) || 1),
            0
        );
    };

    /**
     * Dispara la acción de impresión del navegador.
     * Se pasa 'windowObj' para facilitar el mocking en las pruebas.
     * @param {object} windowObj - El objeto 'window' global.
     */
    window.PagoBienLogic.imprimirPDF = function (windowObj) {
        if (windowObj && typeof windowObj.print === 'function') {
            windowObj.print();
        }
    };

    /**
     * Genera y ejecuta un enlace mailto: para enviar la boleta por email.
     * @param {object} orden - El objeto de la orden (requerido).
     * @param {number} total - El total numérico de la orden.
     * @param {function} clpFormatter - La función (ej. CLP) para formatear moneda.
     * @param {object} windowObj - El objeto 'window' global (requerido).
     */
    window.PagoBienLogic.enviarEmail = function (orden, total, clpFormatter, windowObj) {
        if (!orden || !windowObj || !windowObj.location) {
            return;
        }

        // Asegura que el formateador sea una función
        var formatter = (typeof clpFormatter === 'function') 
            ? clpFormatter 
            : function(n) { return String(n); }; // Fallback simple

        var to = orden?.cliente?.correo || "";
        var subject = encodeURIComponent(
            `Boleta de compra ${orden.codigo || orden.id}`
        );
        var cuerpoTexto = [
            `Hola ${orden?.cliente?.nombre || ""},`,
            "",
            `Adjuntamos el detalle de tu compra ${orden.codigo || orden.id}.`,
            "",
            ...(orden.items || []).map(
                (it) => `• ${it.nombre} x${it.cantidad} = ${formatter((Number(it.precio)||0)*(Number(it.cantidad)||1))}`
            ),
            "",
            `Total pagado: ${formatter(total)}`,
        ].join("\r\n");
        
        var cuerpo = encodeURIComponent(cuerpoTexto);
        
        // Asigna al location.href para disparar el cliente de email
        windowObj.location.href = `mailto:${to}?subject=${subject}&body=${cuerpo}`;
    };

})(window);