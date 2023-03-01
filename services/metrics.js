const axios = require('axios');
const  parsePrometheusTextFormat = require('parse-prometheus-text-format');

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
const checkDiskSpace = async(endpoints) => {
    for (let i=0; i < endpoints.length; i++) {
        try {
            const metrics = await fetchNodeExporter(endpoints[i].url);
            const fsData = parseFsFreeSpace(metrics);
            fsData.forEach(fs=>{
                if (fs.percentUsed > 90) hook.send(`\`${endpoints[i].name}\`'s filesystem is ${fs.percentUsed.toFixed(2)}% used (${fs.freeSpace} free) at mountpoint \`${fs.mountPoint}\``)
            })
        } catch (error) {
            hook.send(`Failed to fetch metrics for \`${endpoints[i].name}\` at ${endpoints[i].url}`)
        }
    };
}

module.exports = {
    checkDiskSpace
}