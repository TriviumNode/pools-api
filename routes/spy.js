const express = require('express');
const router = express.Router();
const spy = require('../services/spy');

/* GET tokens. */
router.get('/', async function(req, res, next) {
  try {
    res.json(await spy.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error while getting spy addresses `, err.message);
    next(err);
  }
});




module.exports = router;