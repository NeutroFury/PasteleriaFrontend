import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/style.css';

export default function Comprar() {
  return (
    <main className="comprar-page" style={{ padding: '1.5rem' }}>
      <nav className="breadcrumb" style={{ marginBottom: '1rem' }}>
        <Link to="/" style={{ color: '#7c3a2d', marginRight: '0.5rem' }}>Home</Link>
        <span style={{ margin: '0 0.5rem' }}>{'>'}</span>
        <Link to="/productos" style={{ color: '#7c3a2d', marginRight: '0.5rem' }}>Productos</Link>
        <span style={{ margin: '0 0.5rem' }}>{'>'}</span>
        <span style={{ color: '#6c757d' }}>Detalle producto</span>
      </nav>

      <section className="producto-detalle" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        <div className="producto-imagen" style={{ flex: '0 0 420px' }}>
          <img
            src="/img/Pastel_1.png"
            alt="Torta Chocolate"
            style={{ width: '100%', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          />
        </div>

        <div className="producto-info" style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "'Pacifico', cursive", color: '#7c3a2d', marginBottom: '0.25rem' }}>
            Torta Chocolate
          </h1>
          <div style={{ fontSize: '1.25rem', color: '#b35448', marginBottom: '1rem' }}>
            $45.000
          </div>

          <p style={{ color: '#444', lineHeight: 1.5 }}>
            Bizcocho húmedo de chocolate, relleno con ganache y decorado con frutos y crema.
            Ideal para cumpleaños y celebraciones.
          </p>

          <div className="producto-opciones" style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label style={{ color: '#6c757d' }}>
              Tamaño:
              <select defaultValue="mediano" style={{ marginLeft: '0.5rem', padding: '0.35rem 0.5rem' }}>
                <option value="pequeno">Pequeño</option>
                <option value="mediano">Mediano</option>
                <option value="grande">Grande</option>
              </select>
            </label>

            <label style={{ color: '#6c757d' }}>
              Cantidad:
              <input type="number" defaultValue={1} min={1} style={{ width: '64px', marginLeft: '0.5rem', padding: '0.25rem' }} />
            </label>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
            <Link to="/carrito" className="btn-principal" style={{ textDecoration: 'none' }}>
              🛒 Añadir al carrito
            </Link>
            <Link to="/productos" className="btn-secundario" style={{ textDecoration: 'none', alignSelf: 'center' }}>
              ← Volver a productos
            </Link>
          </div>

          <div style={{ marginTop: '1.5rem', color: '#6c757d', fontSize: '0.95rem' }}>
            <strong>Información adicional:</strong>
            <ul style={{ marginTop: '0.5rem' }}>
              <li>Tiempo de preparación: 48 horas</li>
              <li>Pedido mínimo con 24 horas de anticipación</li>
              <li>Opciones sin azúcar o sin gluten disponibles bajo pedido</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="productos-relacionados" style={{ marginTop: '2.5rem' }}>
        <h2 style={{ color: '#7c3a2d', fontFamily: "'Pacifico', cursive' " }}>Productos relacionados</h2>
        <div className="productos-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <article className="producto-card" style={{ padding: '0.75rem', borderRadius: '8px', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <img src="/img/Pastel_2.png" alt="Torta Frutas" style={{ width: '100%', borderRadius: '6px' }} />
            <h3 style={{ marginTop: '0.5rem', fontSize: '1rem' }}>Torta Frutas</h3>
            <div style={{ color: '#b35448' }}>$50.000</div>
          </article>

          <article className="producto-card" style={{ padding: '0.75rem', borderRadius: '8px', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <img src="/img/Pastel_3.png" alt="Torta Vainilla" style={{ width: '100%', borderRadius: '6px' }} />
            <h3 style={{ marginTop: '0.5rem', fontSize: '1rem' }}>Torta Vainilla</h3>
            <div style={{ color: '#b35448' }}>$40.000</div>
          </article>

          <article className="producto-card" style={{ padding: '0.75rem', borderRadius: '8px', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <img src="/img/Pastel_4.png" alt="Torta Manjar" style={{ width: '100%', borderRadius: '6px' }} />
            <h3 style={{ marginTop: '0.5rem', fontSize: '1rem' }}>Torta Manjar</h3>
            <div style={{ color: '#b35448' }}>$42.000</div>
          </article>
        </div>
      </section>
    </main>
  );
}