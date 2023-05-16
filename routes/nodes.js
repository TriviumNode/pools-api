const express = require('express');
const router = express.Router();
const { nodes } = require('../config/nodes');
const { getNodeStatus } = require('../services/nodes')

router.get('/trivium', async function(req, res, next) {
  try {
    res.json(await getNodeStatus(nodes, false));
  } catch (err) {
    console.error(`Error while getting node statuses `, err.message);
    next(err);
  }
});

router.get('/', (req, res) => {
  res.json({'uwu': ['owo', 'wuw', 'uvu']});
})

module.exports = router;