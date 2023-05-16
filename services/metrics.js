const axios = require('axios');
const  parsePrometheusTextFormat = require('parse-prometheus-text-format');

const { DISK_USE_ALERT_PERCENTAGE } = require('../config/constants')

const { Webhook } = require('discord-webhook-node');
const hook = new Webhook(process.env.WEBHOOK);

const fetchNodeExporter = async (url) => {
    const { data } = await axios.get(url, { timeout: 5000 });
    const parsed = parsePrometheusTextFormat(data);
    return parsed;
}

const parseFsFreeSpace = (parsed) => {
    const fsSizeMetric = parsed.find(m=>m.name==='node_filesystem_size_bytes')
    fsSizeMetric.metrics = fsSizeMetric.metrics.filter(sm=>sm.labels.fstype !== 'tmpfs')

    const fsAvailMetric = parsed.find(m=>m.name==='node_filesystem_avail_bytes')
    fsAvailMetric.metrics = fsAvailMetric.metrics.filter(sm=>sm.labels.fstype !== 'tmpfs')

    // interface FinalData {
    //     mountPoint: string;
    //     percentFree: number;
    //     bytesFree: string;
    // }
    const finalData = []

    fsSizeMetric.metrics.forEach(m=>{
        const availMetric = fsAvailMetric.metrics.find(a=>a.labels.mountpoint === m.labels.mountpoint);
        const sizeNum = Number(m.value)
        const availNum = Number(availMetric.value)
        const percentUsed = 100 - ((availNum * 100) / sizeNum)

        finalData.push({
            mountPoint: m.labels.mountpoint,
            percentUsed: percentUsed,
            freeSpace: `${(availNum / 1024 / 1024 / 1024).toFixed(3)} GB`
        })
    })

    return finalData;
}

// endpoints: { name, url }[];
// returns: { endpoint, metrics?, error? }[];
const getMetrics = async(endpoints) => {
    const promises = [];
    for (let i=0; i < endpoints.length; i++) {
        const thing = async() => {
            try {
                const result = await fetchNodeExporter(endpoints[i].url);
                return {result, endpoint: endpoints[i]}
            } catch(error) {
                return {error, endpoint: endpoints[i]}
            }
        }
        promises.push(thing());
    };

    const resolves = await Promise.all(promises);

    const results = [];
    for (let i=0; i < resolves.length; i++) {
        if (resolves[i].error){
            results.push({
                endpoint: resolves[i].endpoint,
                error: resolves[i].error
            })
        } else {
            results.push({
                endpoint: resolves[i].endpoint,
                metrics: resolves[i].result
            })
        }
    };

    // const results = [];
    // for (let i=0; i < endpoints.length; i++) {
    //     try {
    //         const metrics = await fetchNodeExporter(endpoints[i].url);
    //         results.push({
    //             endpoint: endpoints[i],
    //             metrics
    //         })
    //     } catch (error) {
    //         results.push({
    //             endpoint: endpoints[i],
    //             error
    //         })
    //     }
    // };
    return results;
}
const checkDiskSpace = async(endpoints) => {
    const results = await getMetrics(endpoints);

    for (let i=0; i < results.length; i++) {
        const result = results[i];

        if (result.error){
            hook.send(`Failed to fetch metrics for \`${result.endpoint.name}\` at ${result.endpoint.url}`)
            continue;
        }

        const fsData = parseFsFreeSpace(result.metrics);
        fsData.forEach(fs=>{
            if (fs.percentUsed > DISK_USE_ALERT_PERCENTAGE) hook.send(`\`${result.endpoint.name}\`'s filesystem is ${fs.percentUsed.toFixed(2)}% used (${fs.freeSpace} free) at mountpoint \`${fs.mountPoint}\``)
        })
    };
}

module.exports = {
    checkDiskSpace,
    getMetrics,
    parseFsFreeSpace
}