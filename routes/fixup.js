const express = require('express');
const router = express.Router();
const tokenfix = require('../services/tokenfix');
const { CosmWasmClient } = require("secretjs");

const queryJs = new CosmWasmClient(process.env.REST_URL);

/* GET contracts. */
router.get('/missingtokendata/', async function(req, res, next) {
  try {
    res.json(await tokenfix.fixMissingTokenData(queryJs));
  } catch (err) {
    console.error(`Error while executing `, err.message);
    next(err);
  }
});




module.exports = router;