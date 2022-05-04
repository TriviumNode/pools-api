const express = require('express');
const router = express.Router();
const nodes = require('../services/nodes');

/* GET tokens. */
router.get('/keplr', async function(req, res, next) {
  try {
    res.json(await nodes.getNodeStatus(nodes.keplrNodes, nodes.controlNodeSecret));
  } catch (err) {
    console.error(`Error while getting node statuses `, err.message);
    next(err);
  }
});

router.get('/trivium', async function(req, res, next) {
  try {
    res.json(await nodes.getNodeStatus(nodes.triviumNodes, nodes.controlNodeSecret));
  } catch (err) {
    console.error(`Error while getting node statuses `, err.message);
    next(err);
  }
});

router.get('/sienna', async function(req, res, next) {
  try {
    res.json(await nodes.getNodeStatus(nodes.siennaNodes, nodes.controlNodeSecret));
  } catch (err) {
    console.error(`Error while getting node statuses `, err.message);
    next(err);
  }
});

router.get('/pulsar', async function(req, res, next) {
  try {
    res.json(await nodes.getNodeStatus(nodes.pulsarNodes, nodes.controlNodePulsar));
  } catch (err) {
    console.error(`Error while getting node statuses `, err.message);
    next(err);
  }
});

router.get('/', (req, res) => {
  res.json({'available_routes': ['/keplr', '/trivium', '/sienna']});
})


module.exports = router;