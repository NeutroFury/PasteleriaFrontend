import { useEffect, useState } from "react";
import { createProduct, updateProduct } from "../services/productService";
// Estado inicial del producto vacío
const emptyProduct = { id: null, name: "", price: "", category: "" };

export default function ProductForm({ selected, onSaved, onCancel }) {
  // Estado del formulario y de mensajes de error
  const [product, setProduct] = useState(emptyProduct);
  const [error, setError] = useState("");

  // useEffect: cada vez que cambia "selected", carga el producto a editar
  useEffect(() => {
    if (selected) setProduct(selected);
    else setProduct(emptyProduct);
  }, [selected]);
  // Actualiza el estado al escribir en cualquier input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((p) => ({ ...p, [name]: value }));
  };

  // Envía el formulario (crear o actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // Validación básica
    if (!product.name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (!product.price || isNaN(product.price)) {
      setError("El precio debe ser numérico");
      return;
    }
    // ✅ El payload debe coincidir con el modelo backend
    const payload = {
      name: product.name.trim(),
      price: Number(product.price),
      category: product.category.trim(),
    };
    try {
      if (product.id == null) {
        // POST → crear producto
        await createProduct(payload);
      } else {
        // PUT → actualizar producto
        await updateProduct(product.id, payload);
      }
      // Avisar al componente padre que se guardó con éxito
      onSaved();
      // Limpiar formulario
      setProduct(emptyProduct);
    } catch (err) {
      setError(err.message || "Error al guardar");
    }
  };
  // Render del formulario
  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <h4>{product.id == null ? "Nuevo producto" : "Editar producto"}</h4>
      {/* Mensaje de error */}
      {error && <div className="alert alert-danger">{error}</div>}
      {/* Campo: Nombre */}
      <div className="mb-2">
        <label className="form-label">Nombre</label>
        <input
          className="form-control"
          name="name"
          value={product.name}
          onChange={handleChange}
          placeholder="Ej: Notebook"
        />
      </div>
      {/* Campo: Precio */}
      <div className="mb-2">
        <label className="form-label">Precio</label>
        <input
          className="form-control"
          type="number"
          name="price"
          value={product.price}
          onChange={handleChange}
          placeholder="Ej: 899990"
        />
      </div>
      {/* Campo: Categoría */}
      <div className="mb-2">
        <label className="form-label">Categoría</label>
        <input
          className="form-control"
          type="text"
          name="category"
          value={product.category}
          onChange={handleChange}
          placeholder="Ej: Tecnología"
        />
      </div>
      {/* Botones de acción */}
      <button className="btn btn-primary me-2" type="submit">
        Guardar
      </button>
      {selected && (
        <button className="btn btn-secondary" type="button" onClick={onCancel}>
          Cancelar
        </button>
      )}
    </form>
  );
}
