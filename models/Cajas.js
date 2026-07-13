const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Cajas = sequelize.define(
    "Cajas",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        fecha_apertura: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        fecha_cierre: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        monto_inicial: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        monto_final_teorico: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        monto_final_real: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        diferencia: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        observaciones: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        estado: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Abierto",
        },
    },
    {
        tableName: "cajas",
        timestamps: false,
    }
);

module.exports = Cajas;
