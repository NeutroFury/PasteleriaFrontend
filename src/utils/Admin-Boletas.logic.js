// AdminBoletas.logic.js
// Lógica pura de todas las funciones internas detectadas 

(function (window) {
  'use strict';

  // Objeto para evitar colisiones en el scope global 
  window.AdminBoletasLogic = {

    /**
     * Formatea un número como moneda CLP. 
     * @param {number | string} n - El número a formatear.
     * @returns {string} - El número formateado como CLP.
     */
    CLP: function (n) {
      return Number(n).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
    },

    /**
     * Muestra un mensaje toast temporal. 
     * @param {function} setToast - El setter de estado de React para el toast.
     * @param {object} window_obj - El objeto window global (para timers).
     * @param {string} text - El texto a mostrar.
     * @param {string} [kind='info'] - El tipo de toast (info, success, error).
     */
    showToast: function (setToast, window_obj, text, kind = 'info') {
      if (!setToast || !window_obj) return;
      setToast({ text, kind });
      window_obj.clearTimeout(window_obj.__toastTimer);
      window_obj.__toastTimer = window_obj.setTimeout(() => setToast(null), 2600);
    },

    /**
     * Carga las órdenes desde el servicio, limpiando duplicados primero. 
     * @param {object} orderService - El servicio de órdenes (debe tener dedupe, purgeExamples, getAll).
     * @param {function} setOrders - El setter de estado de React para las órdenes.
     */
    load: function (orderService, setOrders) {
      if (!orderService || !setOrders) return;
      try { orderService.dedupe(); } catch (e) { console.error('Error en dedupe', e); }
      try { orderService.purgeExamples(); } catch (e) { console.error('Error en purgeExamples', e); }
      setOrders(orderService.getAll());
    },

    /**
     * Prepara la visualización de una boleta en el modal. 
     * @param {object} localStorage - El objeto localStorage global.
     * @param {object} o - La orden seleccionada.
     * @param {function} setOrdenSel - El setter de estado para la orden seleccionada.
     * @param {function} setVisible - El setter de estado para la visibilidad del modal.
     */
    verBoleta: function (localStorage, o, setOrdenSel, setVisible) {
      if (!localStorage || !setOrdenSel || !setVisible) return;
      try { localStorage.setItem('ultima_orden', JSON.stringify(o)); } catch (e) { console.error('Error guardando en localStorage', e); }
      setOrdenSel(o);
      setVisible(true);
    },

    /**
     * Cierra el modal de la boleta. 
     * @param {function} setVisible - El setter de estado para la visibilidad del modal.
     * @param {function} setOrdenSel - El setter de estado para la orden seleccionada.
     */
    cerrarBoleta: function (setVisible, setOrdenSel) {
      if (!setVisible || !setOrdenSel) return;
      setVisible(false);
      setOrdenSel(null);
    },

    /**
     * Construye y ejecuta un enlace 'mailto:' para enviar la boleta. 
     * @param {object} ordenSel - La orden actualmente seleccionada.
     * @param {function} CLP_func - La función de formateo de moneda (CLP).
     * @param {object} window_obj - El objeto window global (para location.href).
     */
    enviarEmail: function (ordenSel, CLP_func, window_obj) {
      if (!ordenSel || !CLP_func || !window_obj) return;

      const total = (ordenSel.items || []).reduce((s, it) => s + (Number(it.precio) || 0) * (Number(it.cantidad) || 1), 0);
      const to = ordenSel?.cliente?.correo || '';
      const subject = encodeURIComponent(`Boleta de compra ${ordenSel.codigo || ordenSel.id}`);
      const cuerpoTexto = [
        `Hola ${ordenSel?.cliente?.nombre || ''},`,
        '',
        `Adjuntamos el detalle de tu compra ${ordenSel.codigo || ordenSel.id}.`,
        '',
        ...(ordenSel.items || []).map(
          (it) => `• ${it.nombre} x${it.cantidad} = ${CLP_func((Number(it.precio) || 0) * (Number(it.cantidad) || 1))}`
        ),
        '',
        `Total pagado: ${CLP_func(total)}`,
      ].join('\r\n');
      
      const cuerpo = encodeURIComponent(cuerpoTexto);
      
      window_obj.location.href = `mailto:${to}?subject=${subject}&body=${cuerpo}`;
    },

    /**
     * Anula una boleta específica, pidiendo confirmación. 
     * @param {object} window_obj - El objeto window global (para confirm).
     * @param {object} orderService - El servicio de órdenes.
     * @param {function} load_func - La función 'load' para recargar la lista.
     * @param {function} showToast_func - La función 'showToast' para mostrar feedback.
     * @param {object} o - La orden a anular.
     */
    anular: function (window_obj, orderService, load_func, showToast_func, o) {
      if (!window_obj || !orderService || !load_func || !showToast_func || !o) return;
      
      if (!window_obj.confirm('¿Anular esta boleta?')) return;
      
      orderService.update(o.id, { estado: 'anulado' });
      load_func();
      showToast_func('Boleta anulada', 'info');
    },

    /**
     * Depura órdenes duplicadas desde el servicio. 
     * @param {object} orderService - El servicio de órdenes.
     * @param {function} load_func - La función 'load' para recargar la lista.
     * @param {function} showToast_func - La función 'showToast' para mostrar feedback.
     */
    depurar: function (orderService, load_func, showToast_func) {
      if (!orderService || !load_func || !showToast_func) return;
      
      const res = orderService.dedupe();
      load_func();
      if (res && typeof res.removed === 'number') {
        showToast_func(`Depuración completa. Eliminados ${res.removed} duplicados.`, 'success');
      }
    },

    /**
     * (Función extraída de handler en línea)
     * Guarda la orden y la abre en una nueva pestaña. 
     * @param {object} localStorage - El objeto localStorage global.
     * @param {object} window_obj - El objeto window global (para open).
     * @param {object} o - La orden a abrir.
     */
    abrirPestanaBoleta: function (localStorage, window_obj, o) {
      if (!localStorage || !window_obj || !o) return;
      try {
        localStorage.setItem('ultima_orden', JSON.stringify(o));
      } catch (e) { console.error('Error guardando en localStorage', e); }
      window_obj.open('/pago-bien', '_blank');
    },

    /**
     * Devuelve la lógica para el badge de estado. 
     * NOTA: Esta función devuelve JSX. Para hacerla testeable,
     * simulamos la estructura de un elemento React.
     * @param {string} s - El estado (pagado, fallido, anulado).
     * @returns {object} - Un objeto simulando un elemento React (JSX).
     */
    badge: function (s) {
      const map = { pagado: '#e9ffe8', fallido: '#fff5f5', anulado: '#f5f5f5' };
      const color = s === 'pagado' ? '#0f5d1d' : s === 'fallido' ? '#9b2c2c' : '#4a4a4a';
      
      // Simulamos React.createElement para el test
      return {
        $$typeof: Symbol.for('react.element'),
        type: 'span',
        props: {
          style: { 
            background: map[s] || '#f5f5f5', 
            color: color, 
            padding: '4px 8px', 
            borderRadius: 999, 
            fontSize: 12, 
            fontWeight: 700, 
            textTransform: 'capitalize' 
          },
          children: s
        }
      };
    }

  };

})(window);