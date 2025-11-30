import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/style.css";
import orderService from "../data/orderService";
import "../utils/Pago-Bien.logic.js";

export default function PagoBien() {
	const navigate = useNavigate();
	const [orden, setOrden] = useState(null);
  const savedOnce = useRef(false);

	useEffect(() => {
		if (savedOnce.current) return;
		savedOnce.current = true;
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
			try { orderService.saveFromUltimaOrden("pagado"); } catch {}
			setOrden(o);
		} catch {
			navigate("/carrito");
		}
	}, [navigate]);

	const CLP = (n) => window.PagoBienLogic.CLP(n);
	const total = useMemo(() => window.PagoBienLogic.calcularTotal(orden), [orden]);
	const imprimirPDF = () => window.PagoBienLogic.imprimirPDF(window);
	const enviarEmail = () => window.PagoBienLogic.enviarEmail(orden, total, CLP, window);

	if (!orden) return null;

	const c = orden.cliente || {};

		return (
			<main>
				{/* Usamos cart-card para heredar tamaños de miniatura (48x48) y estilos de tabla */}
				<div className="card cart-card" style={{ maxWidth: 940, margin: "20px auto" }}>
				<div className="receipt-success" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
					<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
						<span style={{ fontSize: 22 }}>✅</span>
						<h2 className="estiloEncabezado" style={{ margin: 0 }}>
							Se ha realizado la compra. nro {orden.nro}
						</h2>
					</div>
					<small style={{ color: "#7c3a2d", opacity: 0.9 }}>Código orden: {orden.codigo}</small>
				</div>
			{/* Texto retirado a solicitud: "Completa la siguiente información" */}

				{/* Información del cliente y entrega (solo lectura) */}
				<div className="form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
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
							{(orden.items || []).map((it) => {
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

						<div className="receipt-actions" style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 12 }}>
							{/* Mismo estilo de botón que el de envío por email */}
							<button onClick={imprimirPDF} className="btn-compra">
								Imprimir boleta en PDF
							</button>
							<button onClick={enviarEmail} className="btn-compra">
							Enviar boleta por email
						</button>
				</div>
			</div>
		</main>
	);
}

