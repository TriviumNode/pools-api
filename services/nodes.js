const axios = require('axios');

const controlNodeSecret = 'https://rpc.roninventures.io/status';
const controlNodePulsar = 'http://40.88.137.151:26657/status';

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
    'http://20.63.36.149:26657/status', //power-query
    'http://85.237.192.230:26657/status' //secret-rpc-a.consensus.one
  ]
  
  const triviumNodes = [
    'http://66.85.135.35:26657/status',
    'http://66.85.135.36:26657/status',
    'http://66.85.135.37:26657/status',
    'http://66.85.135.38:26657/status',
    'http://66.85.137.179:26657/status',
    'http://66.85.137.180:26657/status',
    'http://66.85.137.181:26657/status',
    'http://174.138.172.52:26657/status',
    'http://66.85.149.162:26657/status',
    'http://66.85.149.163:26657/status',
    'http://66.85.149.164:26657/status'
  ]

  const siennaNodes = [
      'http://96.44.142.234:26657/status', //1
      'http://96.44.142.238:26657/status', //2
      'http://96.44.143.34:26657/status', //3
      // 'http://:26657/status',
      'http://96.44.143.194:26657/status', //sienna-node-5
      // 'http://:26657/status',
      'http://96.44.145.138:26657/status', //7
      'http://96.44.145.142:26657/status', //8
      'http://96.44.145.202:26657/status', //9
      'http://96.44.145.206:26657/status' //10


  ]

  const pulsarNodes = [
    'http://20.127.18.96:26657/status', //scrtlabs1
    'http://40.88.137.151:26657/status',//slabs-validator
    'http://20.116.58.47:26657/status', //uo2vKPgA2y
    'http://20.83.213.250:26657/status', //foundry-test
    'http://144.202.126.98:26657/status', //Secure Secrets
    'http://108.62.104.102:26657/status', //nanas_forever
    'http://20.104.227.233:26657/status', //zQdqfTSyy5
    'http://108.59.1.107:26657/status', //sod-coconut
    'http://52.190.249.47:26657/status', //baedrik
]

  const getNodeStatus = async(nodes, controlNode, syncingIsInPool) =>{
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
            promises.push(axios.get(rpc, { timeout: 3000 }).catch(error => { return error }))
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
        } else {
            //console.log(single);
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
    siennaNodes,
    pulsarNodes,
    controlNodeSecret,
    controlNodePulsar,
    getNodeStatus
  }