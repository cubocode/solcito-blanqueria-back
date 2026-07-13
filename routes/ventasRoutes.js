const express = require("express");
const router = express.Router();
const VentasController = require("../controllers/ventasController");

router.get("/", VentasController.getAll);
router.post("/", VentasController.create);

module.exports = router;
