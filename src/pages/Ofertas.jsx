import { useEffect, useMemo, useState } from "react";
import productService from "../data/productService";
import api from "../services/api";
import "../utils/Ofertas.logic.js";

export default function Ofertas() {
	const resolveImg = (src) => window.OfertasLogic.resolveImg(src);
	const [productos, setProductos] = useState([]);

	useEffect(() => {
		// Cargar desde servicio (cache + backend)
		setProductos(productService.getAll());
	}, []);

	const CLP = (n) => window.OfertasLogic.CLP(n);
	const precioConDescuento = (p) => window.OfertasLogic.precioConDescuento(p);

	const ofertas = useMemo(() => (productos || []).filter((p) => Number(p.descuento) > 0), [productos]);

	const agregarAlCarrito = async (producto) => {
		const token = api.getToken();
		
		if (!token) {
			alert('⚠️ Debes iniciar sesión');
			window.location.href = '/login';
			return;
		}

		try {
			await api.addToCartByProductId(producto.id || producto.codigo, 1);
			alert('✅ Producto agregado al carrito');
			window.dispatchEvent(new Event('carrito-changed'));
		} catch (err) {
			console.error('Error agregando al carrito', err);
			alert('❌ No se pudo agregar al carrito');
		}
	};

	return (
		<main>
			<h1
				style={{
					textAlign: "center",
					margin: "1.5rem 0",
					color: "#7c3a2d",
					fontFamily: '"Pacifico", cursive',
				}}
			>
				Ofertas especiales
			</h1>

			{ofertas.length === 0 ? (
				<p style={{ textAlign: "center", color: "#7c3a2d" }}>
					No hay productos en oferta por ahora.
				</p>
			) : (
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
						gap: "16px",
						padding: "1rem",
					}}
				>
					{ofertas.map((p) => (
						<div
							key={p.codigo}
							className="card-sombra"
							style={{
								background: "#ffffff",
								borderRadius: "12px",
								display: "flex",
								flexDirection: "column",
								overflow: "hidden",
								position: "relative",
							}}
						>
							{/* Badge de oferta */}
							<div
								style={{
									position: "absolute",
									top: 8,
									left: 8,
									background: "#ff6b6b",
									color: "#fff",
									padding: "4px 8px",
									borderRadius: 8,
									fontWeight: 700,
									fontSize: 12,
								}}
							>
								-{p.descuento}%
							</div>

							<div className="catalog-thumb">
				    <img
					    src={resolveImg(p.img)}
									alt={p.nombre}
									loading="lazy"
								/>
							</div>
							<div style={{ padding: "10px 12px" }}>
								<h3 style={{ color: "#7c3a2d", margin: "0 0 6px" }}>{p.nombre}</h3>
								<p style={{ color: "#7c3a2d", opacity: ".9", marginBottom: "10px" }}>
									{p.descripcion}
								</p>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
									}}
								>
									<div style={{ display: "flex", flexDirection: "column" }}>
										<span style={{ textDecoration: "line-through", opacity: 0.6, color: "#7c3a2d" }}>
											{CLP(p.precio)}
										</span>
										<strong style={{ color: "#7c3a2d" }}>{CLP(precioConDescuento(p))}</strong>
									</div>
									<button
										onClick={() => agregarAlCarrito(p)}
										className="btn-agregar"
									>
										Agregar
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</main>
	);
}
