const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProveedorPedidos = sequelize.define(
    "ProveedorPedidos",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        proveedor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "proveedores",
                key: "id",
            },
        },
        fecha_pedido: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        fecha_recepcion: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        monto: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        estado: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Pendiente", // 'Pendiente' or 'Recibido'
        },
        detalle: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "proveedor_pedidos",
        timestamps: false,
    }
);

module.exports = ProveedorPedidos;
