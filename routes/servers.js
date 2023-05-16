const express = require('express');
const router = express.Router();

const { getMetrics, parseFsFreeSpace } = require('../services/metrics');
const { endpoints } = require('../config/node_exporter');

router.get('/trivium', async function(req, res, next) {
  try {
    res.json(await getServerMetrics());
  } catch (err) {
    console.error(`Error while getting server metrics `, err.message);
    next(err);
  }
});

router.get('/', (req, res) => {
  res.json({'uwu': ['owo']});
})

const getServerMetrics = async () => {
  const returnResult = []
  const results = await getMetrics(endpoints);

  for (let i=0; i < results.length; i++) {
    const result = results[i];

    if (result.error){
        const item = {
          server: result.endpoint.name,
          url: result.endpoint.url,
          error: result.error.toString(),
        }
        returnResult.push(item)
        continue;
    }

    const fsData = parseFsFreeSpace(result.metrics);
    const drives = []
    fsData.forEach(fs=>{
        if (fs.mountPoint.includes('/boot')) return;
        drives.push({
          mountpoint: fs.mountPoint,
          used: fs.percentUsed,
          freeSpace: fs.freeSpace,
        })
    })
    const item = {
      server: result.endpoint.name,
      url: result.endpoint.url,
      drives
    }
    returnResult.push(item)
  };
  return {servers: returnResult}
}

module.exports = router;