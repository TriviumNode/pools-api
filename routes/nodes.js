const express = require('express');
const router = express.Router();
const { triviumNodes, pulsarNodes, controlNodeSecret, controlNodePulsar } = require('../config/nodes');
const { getNodeStatus } = require('../services/nodes')

router.get('/trivium', async function(req, res, next) {
  try {
    res.json(await getNodeStatus(triviumNodes, controlNodeSecret, false));
  } catch (err) {
    console.error(`Error while getting node statuses `, err.message);
    next(err);
  }
});

router.get('/pulsar', async function(req, res, next) {
  try {
    res.json(await getNodeStatus(pulsarNodes, controlNodePulsar, true));
  } catch (err) {
    console.error(`Error while getting node statuses `, err.message);
    next(err);
  }
});

router.get('/', (req, res) => {
  res.json({'available_routes': ['/keplr', '/trivium', '/sienna']});
})

const intervalSecret = () => getNodeStatus(triviumNodes, controlNodeSecret, false, true)

setInterval(intervalSecret, 300_000);


module.exports = router;