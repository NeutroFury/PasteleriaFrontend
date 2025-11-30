import { useState, useRef } from "react";
import ProductList from "../components/ProductList";
import ProductForm from "../components/ProductForm";
import { getProducts } from "../services/productService";
export default function ProductsPage() {
  const [selected, setSelected] = useState(null);
  const [reloadFlag, setReloadFlag] = useState(0);
  const listRef = useRef(null);
  const handleSaved = () => {
    // estrategia simple: forzar recarga de lista vía flag
    setReloadFlag((f) => f + 1);
    setSelected(null);
  };
  const handleCancel = () => setSelected(null);
  return (
    <div className="container my-4">
      <h2>Gestión de productos</h2>
      <ProductForm
        selected={selected}
        onSaved={handleSaved}
        onCancel={handleCancel}
      />
      {/*
Una opción simple: pasar reloadFlag y usarlo como dependencia en
useEffect
del listado.
*/}
      <ProductList key={reloadFlag} onEdit={(p) => setSelected(p)} />
    </div>
  );
}
