const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const VentasItems = sequelize.define(
    "VentasItems",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        venta_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "ventas",
                key: "id",
            },
        },
        producto_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "productos",
                key: "id",
            },
        },
        cantidad: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        precio_unitario: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        subtotal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    },
    {
        tableName: "ventas_items",
        timestamps: false,
    }
);

module.exports = VentasItems;
