import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/style.css";
import orderService from "../data/orderService";
import "../utils/Pago-Mal.logic.js";

export default function PagoMal() {
	const navigate = useNavigate();
	const [orden, setOrden] = useState(null);

	useEffect(() => {
		try {
			const raw = localStorage.getItem("ultima_orden");
			const o = raw ? JSON.parse(raw) : null;
			if (!o || !Array.isArray(o.items) || o.items.length === 0) {
				navigate("/carrito");
				return;
			}
			if (!o.codigo) {
				o.codigo = `ORDER${String(Date.now()).slice(-5)}`;
			}
			if (!o.nro) {
				o.nro = `#${new Date().getFullYear()}${String(Date.now()).slice(-4)}`;
			}
			// Registrar la orden como 'fallido' en el historial
			try { orderService.saveFromUltimaOrden("fallido"); } catch {}
			setOrden(o);
		} catch {
			navigate("/carrito");
		}
	}, [navigate]);

	const CLP = (n) => window.PagoMalLogic.formatCLP(n);
	const total = useMemo(() => window.PagoMalLogic.calculateTotal(orden), [orden]);

	// Nunca retornamos antes de ejecutar los hooks; si no hay orden aún, renderizamos un fallback seguro
	const c = (orden && orden.cliente) ? orden.cliente : {};
	const items = (orden && Array.isArray(orden.items)) ? orden.items : [];

	return (
		<main>
			<div className="card cart-card" style={{ maxWidth: 940, margin: "20px auto" }}>
				{/* Encabezado de error */}
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
					<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
						<span style={{ fontSize: 22 }}>❌</span>
						<h2 className="estiloEncabezado" style={{ margin: 0 }}>
							No se pudo realizar el pago. nro {orden?.nro || ""}
						</h2>
					</div>
					<small style={{ color: "#7c3a2d", opacity: 0.9 }}>Código orden: {orden?.codigo || ""}</small>
				</div>
				<div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
					<button className="btn-compra" onClick={() => navigate("/checkout")}>
						VOLVER A REALIZAR EL PAGO
					</button>
				</div>

				{orden?.error && (
					<div style={{ 
						background: "#ffebee", 
						color: "#c62828", 
						padding: "12px", 
						borderRadius: "8px", 
						marginTop: "12px",
						textAlign: "center"
					}}>
						<strong>Error:</strong> {orden.error}
					</div>
				)}

				{/* Formulario (solo lectura) */}
				<div className="form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 12 }}>
					<div className="form-field">
						<label className="form-label">Nombre*</label>
						<input className="input" value={c.nombre || ""} readOnly />
					</div>
					<div className="form-field">
						<label className="form-label">Apellidos*</label>
						<input className="input" value={c.apellidos || ""} readOnly />
					</div>
					<div className="form-field">
						<label className="form-label">Correo*</label>
						<input className="input" value={c.correo || ""} readOnly />
					</div>
				</div>

				<h3 className="estiloEncabezado" style={{ margin: "16px 0 6px" }}>Dirección de entrega de los productos</h3>

				<div className="form-grid-2" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
					<div className="form-field">
						<label className="form-label">Calle*</label>
						<input className="input" value={c.calle || ""} readOnly />
					</div>
					<div className="form-field">
						<label className="form-label">Departamento (opcional)</label>
						<input className="input" value={c.depto || ""} readOnly />
					</div>
				</div>

				<div className="form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
					<div className="form-field">
						<label className="form-label">Región*</label>
						<input className="input" value={c.region || ""} readOnly />
					</div>
					<div className="form-field">
						<label className="form-label">Comuna*</label>
						<input className="input" value={c.comuna || ""} readOnly />
					</div>
				</div>

				<div className="form-field" style={{ marginTop: 12 }}>
					<label className="form-label">Indicaciones para la entrega (opcional)</label>
					<textarea className="input" value={c.indicaciones || ""} readOnly rows={3} />
				</div>

				{/* Tabla de productos */}
				<div className="cart-scroll" style={{ marginTop: 16 }}>
					<table className="cart-table" style={{ width: "100%" }}>
						<thead>
							<tr>
								<th>Imagen</th>
								<th>Nombre</th>
								<th>Precio</th>
								<th>Cantidad</th>
								<th>Subtotal</th>
							</tr>
						</thead>
						<tbody>
							{items.map((it) => {
								const subtotal = (Number(it.precio) || 0) * (Number(it.cantidad) || 1);
								return (
									<tr key={it.codigo}>
										<td>
											<img className="thumb" src={it.img} alt={it.nombre} />
										</td>
										<td style={{ color: "#7c3a2d", fontWeight: 600 }}>{it.nombre}</td>
										<td>{CLP(it.precio)}</td>
										<td>{it.cantidad}</td>
										<td style={{ fontWeight: 700 }}>{CLP(subtotal)}</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>

				<div className="receipt-totalbox" style={{ background: "#f3e9e1", borderRadius: 10, padding: 14, marginTop: 16, display: "flex", justifyContent: "center" }}>
						<strong style={{ color: "#7c3a2d", fontSize: 18 }}>Total pagado: {CLP(total)}</strong>
				</div>
			</div>
		</main>
	);
}

