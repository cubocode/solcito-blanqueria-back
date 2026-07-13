const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Usuarios = sequelize.define(
    "Usuarios",
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
        apellido: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        usuario: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        dni: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        contrasenia: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        nivel: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                isIn: [[1, 2, 3]],
            },
        },
        contrasenia_temporal: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        tableName: "usuarios",
        timestamps: false,
    }
);

module.exports = Usuarios;

