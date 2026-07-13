const express = require("express");
const router = express.Router();
const CajaController = require("../controllers/cajaController");

router.get("/activa", CajaController.getActive);
router.post("/abrir", CajaController.open);
router.post("/movimientos", CajaController.addMovement);
router.get("/movimientos", CajaController.getAllMovements);
router.post("/cerrar", CajaController.close);
router.get("/historial", CajaController.getHistory);

module.exports = router;
