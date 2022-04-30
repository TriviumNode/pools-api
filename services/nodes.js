const axios = require('axios');

const controlNode = 'https://rpc.roninventures.io/status';

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
    'http://174.138.172.52:3657/status',
    'http://66.85.149.162:26657/status',
    'http://66.85.149.162:36657/status',
    'http://66.85.149.162:46657/status'
  ]

  const getNodeStatus = async(nodes, syncingIsInPool) =>{
    const results = {
        status: "Normal",
        highest_known_block: 0,
        nodes_online: 0,
        nodes_behind: 0,
        nodes: {}};
    const promises = [];
    let resolves;
    let highest = 0;

    let nodesBehind = 0;
    let totalNodes = 0;

    //add control node request first
    promises.push(axios.get(controlNode).catch(error => { return error }))

    //add requests for all nodes
    for (let i=0; i < nodes.length; i++){
        const rpc = nodes[i];
        try {
            //const {data: { result: {node_info: {moniker}, sync_info: {latest_block_height}}}} = await axios.get(rpc);
            promises.push(axios.get(rpc).catch(error => { return error }))
            //console.log(moniker, latest_block_height);
            //results[moniker] = latest_block_height;
        }
        catch (error) {
            console.log(`Error fetching ${rpc}`, error)
        }
    }

    //process requests simultaneously
    try {
        resolves = await Promise.all(promises);
    }
    catch (error) {
        console.log(`Error resolving promises.`, error)
    }

    // process and remove control node response
    if (resolves[0].data){
        try{
            const {data: { result: {node_info: {moniker}, sync_info: {latest_block_height}}}} = resolves[0];
            if (parseInt(latest_block_height) > highest) highest = parseInt(latest_block_height);
            console.log("Control: ", moniker, parseInt(latest_block_height));
        } catch(error){
            console.log(`Error processing control result`, error)
        }
    }
    resolves.shift();

    //process other responses
    for (let i=0; i < resolves.length; i++){
        const single = resolves[i];
        if (single.data){
            try {
                const {data: { result: {node_info: {moniker}, sync_info: {latest_block_height, catching_up}}}} = single;
                //add to total nodes count if (NOT fast-syncing) OR (fast-syncing AND syncing nodes ARE in the cluster)
                if (!catching_up || (catching_up && syncingIsInPool)) totalNodes++

                if (parseInt(latest_block_height) > highest) highest = parseInt(latest_block_height);
                results.nodes[moniker] = {}
                results.nodes[moniker]['height'] = parseInt(latest_block_height);
            }
            catch (error) {
                console.log(`Error processing result`, error)
            }
        }
    }

    //determine which nodes are behind and how much
    for (let i=0; i < resolves.length; i++){
        const single = resolves[i];
        if (single.data){
            try {
                const {data: { result: {node_info: {moniker}, sync_info: {latest_block_height, catching_up}}}} = single;
                const behind = highest - parseInt(latest_block_height)
                results.nodes[moniker]['behind'] = behind;

                //add to behind nodes count if more than 15 blocks behind AND (NOT fast-sycing OR(fast-syncing AND syncing nodes are in the cluster))
                if (behind > 15) {
                    results.nodes[moniker]['catching_up'] = catching_up;
                    if (!catching_up || (catching_up && syncingIsInPool)) {
                        nodesBehind++
                    }
                }
            }
            catch (error) {
                console.log(`Error processing result`, error)
            }
        }
    }

    //update overall stats
    results.nodes_online = totalNodes;
    results.nodes_behind = nodesBehind;
    results.highest_known_block = highest;

    if (nodesBehind > 0) results.status = "Degraded"; // Consider cluster degraded if any nodes are more than 15 blocks behind.
    if (nodesBehind/totalNodes > 0.75) results.status = "Down"; // Consider cluster down if 75% of nodes are behind

    return results;
  }

  module.exports = {
    keplrNodes,
    triviumNodes,
    getNodeStatus
  }