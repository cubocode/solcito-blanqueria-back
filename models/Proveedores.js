const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Proveedores = sequelize.define(
    "Proveedores",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        telefono: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        direccion: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        notas: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "proveedores",
        timestamps: false,
    }
);

module.exports = Proveedores;
