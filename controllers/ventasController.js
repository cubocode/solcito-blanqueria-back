const { sequelize, Ventas, VentasItems, Productos, Clientes, Cajas } = require("../models");

const VentasController = {
    // GET /api/ventas
    async getAll(req, res) {
        try {
            const list = await Ventas.findAll({
                include: [
                    { model: Clientes, as: "cliente" },
                    {
                        model: VentasItems,
                        as: "items",
                        include: [{ model: Productos, as: "producto" }]
                    }
                ],
                order: [["fecha", "DESC"]]
            });

            // Map database records to client-side model structure
            const formatted = list.map((s) => ({
                id: `SALE-${s.id}`,
                dbId: s.id,
                date: s.fecha,
                clientName: s.cliente ? s.cliente.nombre : "Consumidor Final",
                clientId: s.cliente_id,
                paymentMethod: s.metodo_pago,
                total: parseFloat(s.total),
                items: s.items.map((item) => ({
                    productId: item.producto ? item.producto.codigo : `OLD-${item.producto_id}`,
                    productName: item.producto ? item.producto.nombre : "Producto Eliminado",
                    quantity: item.cantidad,
                    salePrice: parseFloat(item.precio_unitario),
                    subtotal: parseFloat(item.subtotal)
                }))
            }));

            res.json(formatted);
        } catch (error) {
            console.error("Error al obtener ventas:", error);
            res.status(500).json({ error: "Error al obtener las ventas" });
        }
    },

    // POST /api/ventas
    async create(req, res) {
        const t = await sequelize.transaction();
        try {
            const { metodo_pago, total, cliente_id, items } = req.body;

            if (!metodo_pago || total === undefined || !items || items.length === 0) {
                await t.rollback();
                return res.status(400).json({ error: "Datos de venta incompletos." });
            }

            // 1. Validate cash shift is open
            const activeCaja = await Cajas.findOne({
                where: { estado: "Abierto" },
                transaction: t
            });
            if (!activeCaja) {
                await t.rollback();
                return res.status(400).json({ error: "No se pueden registrar ventas. Debe abrir el turno de caja." });
            }

            // 2. Dry run stock check
            for (const item of items) {
                const prod = await Productos.findOne({
                    where: { codigo: item.productId },
                    transaction: t
                });
                if (!prod) {
                    await t.rollback();
                    return res.status(404).json({ error: `Producto no encontrado con el código ${item.productId}` });
                }
                if (prod.cantidad < item.quantity) {
                    await t.rollback();
                    return res.status(400).json({ error: `Stock insuficiente para ${prod.nombre}. Stock actual: ${prod.cantidad}` });
                }
            }

            // 3. Register Cuenta Corriente limits check
            let client = null;
            let currentBalance = 0;
            if (metodo_pago === "Cuenta Corriente") {
                if (!cliente_id) {
                    await t.rollback();
                    return res.status(400).json({ error: "Debe seleccionar un cliente registrado para Cuenta Corriente." });
                }
                client = await Clientes.findByPk(cliente_id, { transaction: t });
                if (!client) {
                    await t.rollback();
                    return res.status(404).json({ error: "Cliente no encontrado." });
                }
                if (client.estado === "Suspendido") {
                    await t.rollback();
                    return res.status(400).json({ error: "El cliente seleccionado está suspendido." });
                }
                currentBalance = parseFloat(client.saldo);
                const limit = parseFloat(client.limite_credito);
                if (currentBalance + parseFloat(total) > limit) {
                    await t.rollback();
                    return res.status(400).json({ error: `El total de la venta excede el límite de crédito del cliente ($${limit.toLocaleString("es-AR")}).` });
                }

                // Increment debt balance
                await client.update({ saldo: currentBalance + parseFloat(total) }, { transaction: t });
            }

            // 4. Create Sale row
            const sale = await Ventas.create(
                {
                    cliente_id: cliente_id || null,
                    metodo_pago,
                    total: parseFloat(total),
                    caja_id: activeCaja.id
                },
                { transaction: t }
            );

            // If credit sale, log to ledger movements
            if (metodo_pago === "Cuenta Corriente" && client) {
                const ClienteMovimientos = require("../models/ClienteMovimientos");
                await ClienteMovimientos.create(
                    {
                        cliente_id: client.id,
                        tipo: "Compra",
                        monto: parseFloat(total),
                        saldo_resultante: currentBalance + parseFloat(total),
                        descripcion: `Compra a crédito (Venta #${sale.id})`
                    },
                    { transaction: t }
                );
            }

            // 5. Create Items rows and decrease stock
            for (const item of items) {
                const prod = await Productos.findOne({
                    where: { codigo: item.productId },
                    transaction: t
                });

                // Deduct stock
                const oldStock = prod.cantidad;
                await prod.update({ cantidad: oldStock - item.quantity }, { transaction: t });

                // Create sales items
                await VentasItems.create(
                    {
                        venta_id: sale.id,
                        producto_id: prod.id,
                        cantidad: item.quantity,
                        precio_unitario: parseFloat(item.salePrice),
                        subtotal: parseFloat(item.subtotal)
                    },
                    { transaction: t }
                );
            }

            // 6. Look up client name for response safely inside transaction
            let clientName = "Consumidor Final";
            if (cliente_id && !isNaN(cliente_id)) {
                const client = await Clientes.findByPk(cliente_id, { transaction: t });
                if (client) {
                    clientName = client.nombre;
                }
            }

            await t.commit();

            // Return sale formatted for immediate UI reprint receipt
            res.status(201).json({
                id: `SALE-${sale.id}`,
                date: sale.fecha,
                clientName,
                clientId: cliente_id || null,
                paymentMethod: metodo_pago,
                items,
                total
            });
        } catch (error) {
            if (t && !t.finished) {
                try {
                    await t.rollback();
                } catch (rollbackErr) {
                    console.error("Error al realizar rollback de transacción:", rollbackErr);
                }
            }
            console.error("Error al crear venta:", error);
            res.status(500).json({ error: error.message || "Error al procesar la venta." });
        }
    }
};

module.exports = VentasController;
