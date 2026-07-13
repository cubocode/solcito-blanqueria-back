const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Ventas = sequelize.define(
    "Ventas",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        fecha: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        cliente_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "clientes",
                key: "id",
            },
        },
        metodo_pago: {
            type: DataTypes.STRING,
            allowNull: false, // 'Efectivo', 'Tarjeta', 'Transferencia', 'QR', 'Cuenta Corriente'
        },
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        caja_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "cajas",
                key: "id",
            },
        },
    },
    {
        tableName: "ventas",
        timestamps: false,
    }
);

module.exports = Ventas;
