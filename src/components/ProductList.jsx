import { useEffect, useState } from "react";
import { getProducts, deleteProduct } from "../services/productService";
export default function ProductList({ onEdit }) {
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const load = async () => {
try {
setLoading(true);
const data = await getProducts();
setProducts(data);
setError("");
} catch (err) {
setError(err.message || "Error cargando productos");
} finally {
setLoading(false);
}
};
useEffect(() => {
load();
}, []);
const handleDelete = async (id) => {
if (!window.confirm("¿Eliminar producto?")) return;
try {
await deleteProduct(id);
setProducts(prev => prev.filter(p => p.id !== id));
} catch (err) {
alert("Error al eliminar");
}
};
if (loading) return <p>Cargando...</p>;
if (error) return <p className="text-danger">{error}</p>;
return (
<table className="table table-striped">
<thead>
<tr>
<th>ID</th>
<th>Nombre</th>
<th>Precio</th>
<th>Categoría</th>
<th></th>
</tr>
</thead>
<tbody>
{products.map(p => (
<tr key={p.id}>
<td>{p.id}</td>
<td>{p.name}</td>
<td>{p.price}</td>
<td>{p.category}</td>
<td className="text-end">
<button
className="btn btn-sm btn-warning me-2"
onClick={() => onEdit(p)}
>
Editar
</button>
<button
className="btn btn-sm btn-danger"
onClick={() => handleDelete(p.id)}
>
Eliminar
</button>
</td>
DESARROLLO FULL STACK II
DESARROLLO FULL STACK II | Docente: Mauricio González V.
</tr>
))}
</tbody>
</table>
);
}