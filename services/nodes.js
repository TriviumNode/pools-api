const axios = require('axios');

const keplrNodes = [
    // 'http://:26657/status', keplr-01
    'http://96.47.236.238:26657/status',
    'http://96.47.237.154:26657/status',
    'http://96.47.237.158:26657/status',
    'http://96.47.237.194:26657/status',
    'http://96.47.237.198:26657/status',
    'http://96.47.238.62:26657/status',
    'http://96.47.238.218:26657/status',
    'http://96.47.238.222:26657/status',
    'http://96.47.239.6:26657/status',
    // 'http://:26657/status', eng-node-01
    'http://96.44.143.226:26657/status',
    'http://96.44.143.230:26657/status',
    'http://96.44.144.2:26657/status',
    'http://96.44.144.6:26657/status',
    'http://96.44.144.38:26657/status',
    'http://96.44.144.186:26657/status',
    'http://20.63.36.149:26657/status'
  ]
  
  const triviumNodes = [
    'http://66.85.135.35:26657/status',
    'http://66.85.135.36:36657/status',
    'http://66.85.135.37:46657/status',
    'http://66.85.135.38:56657/status',
    'http://66.85.137.179:26657/status',
    'http://66.85.137.180:36657/status',
    'http://66.85.137.181:46657/status',
    'http://174.138.172.52:3657/status'
  ]

  const getNodeStatus = async(nodes) =>{
    const results = { highest_known_block: 0, nodes: {}};
    const promises = [];
    let resolves;
    let highest = 0;

    for (let i=0; i < nodes.length; i++){
        const rpc = nodes[i];
        try {
            //const {data: { result: {node_info: {moniker}, sync_info: {latest_block_height}}}} = await axios.get(rpc);
            promises.push(axios.get(rpc).catch(error => { return error }),)
            //console.log(moniker, latest_block_height);
            //results[moniker] = latest_block_height;
        }
        catch (error) {
            console.log(`Error fetching ${rpc}`, error)
        }
    }

    try {
        resolves = await Promise.all(promises);
    }
    catch (error) {
        console.log(`Error resolving promises.`, error)
    }

    for (let i=0; i < resolves.length; i++){
        const single = resolves[i];
        if (single.data){
            try {
                const {data: { result: {node_info: {moniker}, sync_info: {latest_block_height}}}} = single;
                if (parseInt(latest_block_height) > highest) highest = parseInt(latest_block_height);
                console.log(moniker, parseInt(latest_block_height));
                results.nodes[moniker] = {}
                results.nodes[moniker]['height'] = parseInt(latest_block_height);
            }
            catch (error) {
                console.log(`Error processing result`, error)
            }
        }
    }

    for (let i=0; i < resolves.length; i++){
        const single = resolves[i];
        if (single.data){
            try {
                const {data: { result: {node_info: {moniker}, sync_info: {latest_block_height}}}} = single;
                const behind = highest - parseInt(latest_block_height)
                console.log(moniker, parseInt(latest_block_height), behind);
                results.nodes[moniker]['behind'] = behind;
            }
            catch (error) {
                console.log(`Error processing result`, error)
            }
        }
    }
    results.highest_known_block = highest;
    return results;
  }

  module.exports = {
    keplrNodes,
    triviumNodes,
    getNodeStatus
  }