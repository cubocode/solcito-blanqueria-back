const sequelize = require('./config/database');
require('./models/index');

/* 

const Tareas = require('./models/Tareas');
const Empleados = require('./models/Empleados');
const Eventos = require('./models/Eventos');
const Equipos = require('./models/Equipos');
const MovimientosEquipos = require('./models/MovimientosEquipos');
const Licencias = require('./models/Licencias');
const Oficinas = require('./models/Oficinas');
const OrdenesServicio = require('./models/OrdenesServicio');
const StockTokens = require('./models/StockTokens');
const TokensAsignados = require('./models/TokensAsignados');
const FirmaDigitalEmpleados = require('./models/FirmaDigitalEmpleados');
const Novedades = require('./models/Novedades');
const FondoComun = require('./models/FondoComun');
const MovimientosFondoComun = require('./models/MovimientosFondoComun');
const PagosFondoComun = require('./models/PagosFondoComun');
const Compras = require('./models/Compras');
const ComprasParticipantes = require('./models/ComprasParticipantes');
const ComprasPagos = require('./models/ComprasPagos');
const BitacoraMensaje = require('./models/BitacoraMensaje');

*/
async function syncDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Conexión establecida con éxito.');

        // Sincroniza todos los modelos con la base de datos
        // alter: true permite modificar tablas existentes para agregar nuevos campos
        await sequelize.sync({ alter: true });
        console.log('Modelos sincronizados con la base de datos.');
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
}

syncDatabase();
