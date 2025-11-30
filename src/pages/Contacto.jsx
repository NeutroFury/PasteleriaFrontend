export default function Contacto(){
    return(
        <>
        <main>
    <img
      className="centered"
      src="img/Logo emprendimiento reposteria beige.png"
      height={400}
      width="auto"
      alt=""
    />
    <div className="auth-card contacto-card">
      <h1 className="auth-title">Contáctenos</h1>
      <form>
        <div className="form-group">
          <label className="form-label" htmlFor="nombre">
            Nombre:
          </label>
          <input
            className="form-control"
            type="text"
            id="nombre"
            name="nombre"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email:
          </label>
          <input
            className="form-control"
            type="email"
            id="email"
            name="email"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="mensaje">
            Mensaje:
          </label>
          <textarea
            className="form-control"
            id="mensaje"
            name="mensaje"
            defaultValue={""}
          />
        </div>
        <button type="submit" className="btn-auth">
          Enviar
        </button>
      </form>
    </div>
  </main>
        </>
)} ;

