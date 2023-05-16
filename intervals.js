const { checkDiskSpace } = require('./services/metrics');
const { endpoints } = require('./config/node_exporter');
const { getNodeStatus } = require('./services/nodes');
const { nodes } = require('./config/nodes');

const { SYSTEM_CHECK_INTERVAL, TENDERMINT_CHECK_INTERVAL } = require('./config/constants');

const intervalFreeSpace = () => {
    console.log('Checking disk space on interval...')
    checkDiskSpace(endpoints)
}

const intervalNodes = () => getNodeStatus(nodes, false, true);


const startIntervals = () => {
    console.log('Starting Timers')
    setInterval(intervalFreeSpace, SYSTEM_CHECK_INTERVAL);
    setInterval(intervalNodes, TENDERMINT_CHECK_INTERVAL);
}

module.exports = {
    startIntervals
}