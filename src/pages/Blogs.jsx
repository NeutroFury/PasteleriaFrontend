import { NavLink } from "react-router-dom";
export default function Blogs() {
  return (
    <>
      <main>
        <h1
          className="estiloEncabezado"
          style={{ textAlign: "center", marginBottom: "2rem" }}
        >
          NOTICIAS IMPORTANTES
        </h1>

        {/* DATO CURIOSO 1 */}
        <section className="blog-caso">
          <div className="blog-caso-info">
            <h2 className="estiloEncabezado">DATO CURIOSO #1</h2>
            <p className="blog-caso-texto">
              Nuestro equipo comparte tips para identificar ingredientes únicos
              en la repostería chilena. ¡Descubre más en nuestro blog!
            </p>
            <NavLink to="/dato1">
              <button className="btn-principal blog-caso-btn">VER CASO</button>
            </NavLink>
          </div>
          <div className="blog-caso-img">
            <img src="img/Ingredientes.png" alt="Caso curioso 1" />
          </div>
        </section>

        {/* DATO CURIOSO 2 */}
        <section className="blog-caso">
          <div className="blog-caso-info">
            <h2 className="estiloEncabezado">DATO CURIOSO #2</h2>
            <p className="blog-caso-texto">
              Aprende sobre la historia de la torta más grande de Chile y cómo
              fue posible lograr este récord. ¡Lee el caso completo!
            </p>
            <NavLink to="/dato2">
              <button className="btn-principal blog-caso-btn">VER CASO</button>
            </NavLink>
          </div>
          <div className="blog-caso-img">
            <img src="img/record.png" alt="Caso curioso 2" />
          </div>
        </section>
      </main>
    </>
  );
}
