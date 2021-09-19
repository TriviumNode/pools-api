const express = require('express');
const router = express.Router();
const pools = require('../services/pools');

/* GET pools. */
router.get('/', async function(req, res, next) {
  try {
    res.json(await pools.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error while getting pools `, err.message);
    next(err);
  }
});

/* GET single pool */
router.get('/:id', async function(req, res, next) {
  try {
    res.json(await pools.getSingle(req.params.id));
  } catch (err) {
    console.error(`Error while getting pool `, err.message);
    next(err);
  }
});

//get by pair
router.get('/pair/:c1/:c2', async function(req, res, next) {
  try {
      res.json(await pools.getSingle(req.params.c1, req.params.c2));
    } catch (err) {
      console.error(`Error while getting pair `, err.message);
      next(err);
  }
});




module.exports = router;