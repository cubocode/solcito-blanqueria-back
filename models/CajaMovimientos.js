const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CajaMovimientos = sequelize.define(
    "CajaMovimientos",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        caja_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "cajas",
                key: "id",
            },
        },
        tipo: {
            type: DataTypes.STRING,
            allowNull: false, // 'Ingreso', 'Egreso', 'Venta', 'Cobro'
        },
        metodo_pago: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "Efectivo",
        },
        monto: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        concepto: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fecha: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "caja_movimientos",
        timestamps: false,
    }
);

module.exports = CajaMovimientos;
