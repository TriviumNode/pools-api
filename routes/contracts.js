const express = require('express');
const router = express.Router();
const contracts = require('../services/contracts');

/* GET contracts. */
router.get('/', async function(req, res, next) {
  try {
    res.json(await contracts.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error while getting contracts `, err.message);
    next(err);
  }
});

/* GET single contract */
router.get('/address/:id', async function(req, res, next) {
  try {
    res.json(await contracts.getSingle(req.params.id));
  } catch (err) {
    console.error(`Error while getting contract `, err.message);
    next(err);
  }
});

//get by label
router.get('/label/:id', async function(req, res, next) {
  try {
      res.json(await contracts.getByLabel(req.params.id));
    } catch (err) {
      console.error(`Error while getting contract label `, err.message);
      next(err);
  }
});




module.exports = router;