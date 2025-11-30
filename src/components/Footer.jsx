export default function Footer() {
  return (
    <footer>
      <div className="footer-content">
        <div>
          <div className="footer-logo">
            <img
              src="/img/Logo emprendimiento reposteria beige.png"
              alt="Logo footer"
              style={{ width: "40px", verticalAlign: "middle", marginRight: "8px" }}
            />
            Pastelería Mil Sabores
          </div>
          <div style={{ fontSize: "0.95rem", color: "#7c3a2d" }}>
            Celebrando nuestros 50 años
          </div>
        </div>
        <div className="footer-links">
          <h5>SOBRE NOSOTROS</h5>
          <ul>
            <li>Nuestros productos</li>
            <li>Tiendas y teléfonos</li>
            <li>Preguntas frecuentes</li>
          </ul>
        </div>
        <div className="newsletter">
          <form>
            <label htmlFor="newsletter-email">Suscríbete a nuestro newsletter:</label>
            <div className="newsletter-input-group">
              <input type="email" id="newsletter-email" placeholder="Ingresa tu email" />
              <button type="submit">Suscribirse</button>
            </div>
          </form>
        </div>
      </div>

      <div style={{ marginTop: "1rem", color: "#b48b7d", fontSize: "0.9rem" }}>
        &copy; 2025 Pastelería Mil Sabores. Todos los derechos reservados.
      </div>
    </footer>
  )
}