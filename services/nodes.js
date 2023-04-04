const axios = require('axios');
const { Webhook } = require('discord-webhook-node');
const hook = new Webhook(process.env.WEBHOOK);
const { control_nodes } = require('../config/nodes');

const getNodeStatus = async(nodes, syncingIsInPool, alert=false) =>{
    const results = {
        highest_known_blocks: {},
        nodes_online: 0,
        nodes_behind: 0,
        nodes: {}};
    const promises = [];
    const networks = [];
    const highest_heights = {};
    let resolves;

    let nodesBehind = 0;
    let totalNodes = 0;

    // Add pending promises for all nodes to run in parallel
    for (let i=0; i < nodes.length; i++){
        const node = nodes[i];
        const rpc = node.rpc ? `${node.rpc}/status` : node; //backwards compatability, although meh at this point
        try {
            promises.push(axios.get(rpc, { timeout: 3000 }).catch(error => { return error }))
        }
        catch (error) {
            console.log(`Error fetching ${rpc}`, error)
        }
    }

    // Process requests simultaneously
    try {
        resolves = await Promise.all(promises);
    }
    catch (error) {
        console.log(`Error resolving promises.`, error)
    }

    // Process responses
    for (let i=0; i < resolves.length; i++){
        const single = resolves[i];
        const nodeName = nodes[i].name ? nodes[i].name : undefined

        if (single.data){
            try {
                const {
                    data: {
                        result: {
                            node_info: {
                                moniker,
                                network
                            },
                            sync_info: {
                                latest_block_height,
                                catching_up
                            }
                        }
                    }
                } = single;

                if (!networks.includes(network)) networks.push(network);

                //add to total nodes count if (NOT fast-syncing) OR (fast-syncing AND syncing nodes ARE in the cluster)
                if (!catching_up || (catching_up && syncingIsInPool)) totalNodes++

                if (parseInt(latest_block_height) > (highest_heights[network] || 0)) highest_heights[network] = parseInt(latest_block_height);

                results.nodes[nodeName || moniker] = {}
                results.nodes[nodeName || moniker]['height'] = parseInt(latest_block_height);
            }
            catch (error) {
                console.log(`Error processing result`, error)
            }
        } else {
            if (alert) hook.send(`Failed to query node ${nodeName ? `\`${nodeName}\` at` : ''} ${single.config.url} with error code \`${single.code}\``);
        }
    }

    // Get control nodes
    const controlPromises = []
    for (let i=0; i < networks.length; i++){
        const network = networks[i];
        const controlRpc = control_nodes.find(n=>n.chain === network)?.rpc;
        if (controlRpc) {
            controlPromises.push(axios.get(`${controlRpc}/status`, { timeout: 3000 }).catch(error => { return error }))
        }
    }
    let controlResults;
    try {
        controlResults = await Promise.all(controlPromises);
    }
    catch (error) {
        console.log(`Error resolving control promises.`, error)
    }
    for (let i=0; i < controlResults.length; i++){
        const controlResponse = controlResults[i];
        if (controlResponse.data){
            try {
                const {
                    data: {
                        result: {
                            node_info: { moniker, network },
                            sync_info: { latest_block_height }
                        }
                    }
                } = controlResponse;
                
                if (parseInt(latest_block_height) > (highest_heights[network] || 0)) highest_heights[network] = parseInt(latest_block_height);
                console.log(`Control node ${moniker} on network ${network} is at height ${latest_block_height}`)
            }
            catch (error) {
                console.log(`Error processing control result`, error)
            }
        }
    }

    //determine which nodes are behind and how much
    for (let i=0; i < resolves.length; i++){
        const single = resolves[i];
        const nodeName = nodes[i].name ? nodes[i].name : undefined

        if (single.data){
            try {
                const {data: { result: {node_info: {moniker, network}, sync_info: {latest_block_height, catching_up}}}} = single;

                const behind = highest_heights[network] - parseInt(latest_block_height)
                results.nodes[nodeName || moniker]['behind'] = behind;

                results.nodes[nodeName || moniker]['network'] = network;

                //add to behind nodes count if more than 15 blocks behind AND (NOT fast-sycing OR(fast-syncing AND syncing nodes are in the cluster))
                if (behind > 15) {
                    if (alert) hook.send(`Node ${nodeName ? `\`${nodeName}\` with moniker` : ''} \`${moniker}\` on \`${network}\` is behind ${behind} blocks!`);
                    results.nodes[nodeName || moniker]['catching_up'] = catching_up;
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
    results.highest_known_blocks = highest_heights;

    console.log(highest_heights)

    return results;
}

module.exports = {
    getNodeStatus
}
