export default function Dato1() {
    return(
        <>
        <main>
    <h1
      className="estiloEncabezado"
      style={{ textAlign: "center", marginBottom: "2rem" }}
    >
      DATO CURIOSO #1
    </h1>
    <section className="blog-caso">
      <div
        className="blog-caso-info"
        style={{ textAlign: "justify", margin: "0 2rem" }}
      >
        <h2 className="blog-caso-titulo">
          INGREDIENTES TÍPICOS EN LA REPOSTERÍA CHILENA
        </h2>
        <p className="blog-caso-texto">
          La repostería chilena es conocida por su sabor único y delicioso, que
          se debe en gran parte a los ingredientes típicos que se utilizan en
          sus recetas. Algunos de los ingredientes más comunes en la repostería
          chilena incluyen:
        </p>
        <ul className="blog-caso-texto">
          <li>
            <strong>Manjar:</strong> El manjar es una especie de dulce de leche
            que se utiliza en muchas recetas de repostería chilena, como la
            torta de mil hojas y los alfajores.
          </li>
          <li>
            <strong>Chirimoya:</strong> La chirimoya es una fruta tropical que
            se utiliza en postres como la chirimoya rellena y la torta de
            chirimoya.
          </li>
          <li>
            <strong>Nueces:</strong> Las nueces son un ingrediente común en la
            repostería chilena, especialmente en la torta de nueces y los
            alfajores.
          </li>
          <li>
            <strong>Frutas secas:</strong> Las frutas secas como las pasas y los
            higos se utilizan en muchas recetas de repostería chilena, como la
            torta de pasas y nueces.
          </li>
          <li>
            <strong>Harina de maíz:</strong> La harina de maíz se utiliza en
            algunas recetas de repostería chilena, como el mote con huesillo y
            la torta de choclo.
          </li>
        </ul>
        <p className="blog-caso-texto">
          En resumen, la repostería chilena utiliza una variedad de ingredientes
          típicos que le dan su sabor único y delicioso. Desde el manjar hasta
          las frutas secas, estos ingredientes son esenciales para crear los
          postres tradicionales que tanto gustan en Chile.
        </p>
      </div>
      <div
        className="blog-caso-img"
        style={{ textAlign: "center", margin: "2rem 0" }}
      >
        <img src="img/Ingredientes.png" alt="Ingredientes típicos" />
      </div>
    </section>
  </main>
        </>
    )
}