const axios = require('axios');
const { Webhook } = require('discord-webhook-node');
const hook = new Webhook(process.env.webhook);

const getNodeStatus = async(nodes, controlNode, syncingIsInPool, alert=false) =>{
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
            if (alert) hook.send(`Failed to query node ${single.config.url} with error code ${single.code}`);
        }
    }

    //determine which nodes are behind and how much
    for (let i=0; i < resolves.length; i++){
        const single = resolves[i];
        if (single.data){
            try {
                const {data: { result: {node_info: {moniker, network}, sync_info: {latest_block_height, catching_up}}}} = single;
                const behind = highest - parseInt(latest_block_height)
                results.nodes[moniker]['behind'] = behind;

                //add to behind nodes count if more than 15 blocks behind AND (NOT fast-sycing OR(fast-syncing AND syncing nodes are in the cluster))
                if (behind > 15) {
                    if (alert) hook.send(`Node ${moniker} on ${network} is behind ${behind} blocks!`);
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
    getNodeStatus
}
