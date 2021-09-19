const express = require('express');
const router = express.Router();
const tokens = require('../services/tokens');

/* GET tokens. */
router.get('/', async function(req, res, next) {
  try {
    res.json(await tokens.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error while getting tokens `, err.message);
    next(err);
  }
});

/* GET single contract */
router.get('/address/:id', async function(req, res, next) {
  try {
    res.json(await tokens.getSingle(req.params.id));
  } catch (err) {
    console.error(`Error while getting token `, err.message);
    next(err);
  }
});

//get by label
router.get('/symbol/:id', async function(req, res, next) {
  try {
      res.json(await tokens.getBySymbol(req.params.id));
    } catch (err) {
      console.error(`Error while getting token symbol `, err.message);
      next(err);
  }
});




module.exports = router;