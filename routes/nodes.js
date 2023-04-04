const express = require('express');
const router = express.Router();
const { pulsarNodes, nodes } = require('../config/nodes');
const { getNodeStatus } = require('../services/nodes')
const { TENDERMINT_CHECK_INTERVAL } = require('../config/intervals')

router.get('/trivium', async function(req, res, next) {
  try {
    res.json(await getNodeStatus(nodes, false));
  } catch (err) {
    console.error(`Error while getting node statuses `, err.message);
    next(err);
  }
});

router.get('/pulsar', async function(req, res, next) {
  try {
    res.json(await getNodeStatus(pulsarNodes, true));
  } catch (err) {
    console.error(`Error while getting node statuses `, err.message);
    next(err);
  }
});

router.get('/', (req, res) => {
  res.json({'available_routes': ['/keplr', '/trivium', '/sienna']});
})

const intervalSecret = () => getNodeStatus(nodes, false, true)

setInterval(intervalSecret, TENDERMINT_CHECK_INTERVAL);

module.exports = router;