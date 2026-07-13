const { Cajas, CajaMovimientos, Ventas } = require("../models");

const CajaController = {
    // GET /api/cajas/activa
    async getActive(req, res) {
        try {
            const active = await Cajas.findOne({
                where: { estado: "Abierto" }
            });
            if (!active) {
                return res.json(null);
            }

            // Fetch movements and sales to compute sums
            const movements = await CajaMovimientos.findAll({
                where: { caja_id: active.id }
            });
            const sales = await Ventas.findAll({
                where: { caja_id: active.id }
            });

            const salesCash = sales
                .filter((s) => s.metodo_pago === "Efectivo")
                .reduce((sum, s) => sum + parseFloat(s.total), 0);

            const clientPaymentsCash = movements
                .filter((m) => m.tipo === "Cobro" && (m.metodo_pago === "Efectivo" || !m.metodo_pago))
                .reduce((sum, m) => sum + parseFloat(m.monto), 0);

            const manualInflow = movements
                .filter((m) => m.tipo === "Ingreso")
                .reduce((sum, m) => sum + parseFloat(m.monto), 0);

            const manualOutflow = movements
                .filter((m) => m.tipo === "Egreso")
                .reduce((sum, m) => sum + parseFloat(m.monto), 0);

            const CardTotal = sales
                .filter((s) => s.metodo_pago === "Tarjeta")
                .reduce((sum, s) => sum + parseFloat(s.total), 0) +
                movements
                .filter((m) => m.tipo === "Cobro" && m.metodo_pago === "Tarjeta")
                .reduce((sum, m) => sum + parseFloat(m.monto), 0);

            const TransferTotal = sales
                .filter((s) => s.metodo_pago === "Transferencia")
                .reduce((sum, s) => sum + parseFloat(s.total), 0) +
                movements
                .filter((m) => m.tipo === "Cobro" && m.metodo_pago === "Transferencia")
                .reduce((sum, m) => sum + parseFloat(m.monto), 0);

            const QRTotal = sales
                .filter((s) => s.metodo_pago === "QR")
                .reduce((sum, s) => sum + parseFloat(s.total), 0) +
                movements
                .filter((m) => m.tipo === "Cobro" && m.metodo_pago === "QR")
                .reduce((sum, m) => sum + parseFloat(m.monto), 0);

            // Format movements list (including cash sales for UI rendering)
            const formattedMovements = movements.map((m) => ({
                date: m.fecha,
                concept: m.concepto,
                type: m.tipo,
                amount: parseFloat(m.monto)
            }));

            sales
                .filter((s) => s.metodo_pago === "Efectivo")
                .forEach((s) => {
                    formattedMovements.push({
                        date: s.fecha,
                        concept: `Venta POS #${s.id}`,
                        type: "Venta",
                        amount: parseFloat(s.total)
                    });
                });

            // Sort movements by date descending
            formattedMovements.sort((a, b) => new Date(b.date) - new Date(a.date));

            res.json({
                id: active.id,
                openedAt: active.fecha_apertura,
                initialAmount: parseFloat(active.monto_inicial),
                salesCash,
                clientPaymentsCash,
                manualInflow,
                manualOutflow,
                otherPaymentMethods: {
                    Tarjeta: CardTotal,
                    Transferencia: TransferTotal,
                    QR: QRTotal
                },
                movements: formattedMovements
            });
        } catch (error) {
            console.error("Error al obtener caja activa:", error);
            res.status(500).json({ error: "Error al obtener la caja activa" });
        }
    },

    // POST /api/cajas/abrir
    async open(req, res) {
        try {
            const active = await Cajas.findOne({ where: { estado: "Abierto" } });
            if (active) {
                return res.status(400).json({ error: "Ya existe una caja abierta en el sistema." });
            }

            const { monto_inicial } = req.body;
            const parsedMonto = parseFloat(monto_inicial);
            if (isNaN(parsedMonto) || parsedMonto < 0) {
                return res.status(400).json({ error: "Monto inicial inválido." });
            }

            const newCaja = await Cajas.create({
                monto_inicial: parsedMonto,
                estado: "Abierto"
            });

            res.status(201).json(newCaja);
        } catch (error) {
            console.error("Error al abrir caja:", error);
            res.status(500).json({ error: "Error al abrir la caja" });
        }
    },

    // POST /api/cajas/movimientos
    async addMovement(req, res) {
        try {
            const active = await Cajas.findOne({ where: { estado: "Abierto" } });
            if (!active) {
                return res.status(400).json({ error: "La caja debe estar abierta para registrar movimientos." });
            }

            const { tipo, monto, concepto } = req.body;
            if (!tipo || !monto || !concepto || !["Ingreso", "Egreso"].includes(tipo)) {
                return res.status(400).json({ error: "Parámetros inválidos. tipo (Ingreso/Egreso), monto y concepto requeridos." });
            }

            const parsedMonto = parseFloat(monto);
            if (isNaN(parsedMonto) || parsedMonto <= 0) {
                return res.status(400).json({ error: "Monto inválido." });
            }

            const newMov = await CajaMovimientos.create({
                caja_id: active.id,
                tipo,
                monto: parsedMonto,
                concepto: concepto.trim()
            });

            res.status(201).json(newMov);
        } catch (error) {
            console.error("Error al agregar movimiento de caja:", error);
            res.status(500).json({ error: "Error al registrar el movimiento" });
        }
    },

    // POST /api/cajas/cerrar
    async close(req, res) {
        try {
            const active = await Cajas.findOne({ where: { estado: "Abierto" } });
            if (!active) {
                return res.status(400).json({ error: "No hay una caja abierta para cerrar." });
            }

            const { monto_final_real, diferencia, observaciones } = req.body;
            const parsedReal = parseFloat(monto_final_real);
            if (isNaN(parsedReal) || parsedReal < 0) {
                return res.status(400).json({ error: "Monto final real inválido." });
            }

            // Calculate theoretical final balance
            const movements = await CajaMovimientos.findAll({ where: { caja_id: active.id } });
            const sales = await Ventas.findAll({ where: { caja_id: active.id } });

            const salesCash = sales
                .filter((s) => s.metodo_pago === "Efectivo")
                .reduce((sum, s) => sum + parseFloat(s.total), 0);

            const clientPaymentsCash = movements
                .filter((m) => m.tipo === "Cobro" && (m.metodo_pago === "Efectivo" || !m.metodo_pago))
                .reduce((sum, m) => sum + parseFloat(m.monto), 0);

            const manualInflow = movements
                .filter((m) => m.tipo === "Ingreso")
                .reduce((sum, m) => sum + parseFloat(m.monto), 0);

            const manualOutflow = movements
                .filter((m) => m.tipo === "Egreso")
                .reduce((sum, m) => sum + parseFloat(m.monto), 0);

            const theoretical =
                parseFloat(active.monto_inicial) +
                salesCash +
                clientPaymentsCash +
                manualInflow -
                manualOutflow;

            const parsedDiff = parsedReal - theoretical;

            await active.update({
                fecha_cierre: new Date(),
                monto_final_teorico: theoretical,
                monto_final_real: parsedReal,
                diferencia: parsedDiff,
                observaciones: observaciones ? observaciones.trim() : "",
                estado: "Cerrado"
            });

            res.json(active);
        } catch (error) {
            console.error("Error al cerrar caja:", error);
            res.status(500).json({ error: "Error al cerrar la caja" });
        }
    },

    // GET /api/cajas/historial
    async getHistory(req, res) {
        try {
            const list = await Cajas.findAll({
                where: { estado: "Cerrado" },
                order: [["fecha_cierre", "DESC"]]
            });

            const formatted = list.map((c) => ({
                openedAt: c.fecha_apertura,
                closedAt: c.fecha_cierre,
                initialAmount: parseFloat(c.monto_inicial),
                theoreticalAmount: parseFloat(c.monto_final_teorico),
                realAmount: parseFloat(c.monto_final_real),
                difference: parseFloat(c.diferencia),
                observations: c.observaciones || ""
            }));

            res.json(formatted);
        } catch (error) {
            console.error("Error al obtener historial de caja:", error);
            res.status(500).json({ error: "Error al obtener historial de cajas" });
        }
    }
};

module.exports = CajaController;
