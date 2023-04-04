const control_nodes = [
    {
        chain: 'secret-4',
        rpc: 'https://rpc.secret.express'
    },
    {
        chain: 'pulsar-2',
        rpc: 'https://rpc.testnet.secretsaturn.net'
    },
    {
        chain: 'sentinelhub-2',
        rpc: 'https://rpc-sentinel-ia.cosmosia.notional.ventures',
    }
]

const nodes = [
    {
        rpc: 'http://66.85.142.171:26657',
        name: 'tpn01-node01'
    },
    {
        rpc: 'http://66.85.142.172:26657',
        name: 'tpn01-node02'
    },
    {
        rpc: 'http://66.85.142.146:26657',
        name: 'phx02-node01'
    },
    {
        rpc: 'http://66.85.142.147:26657',
        name: 'phx02-node02'
    },
    {
        rpc: 'http://174.138.172.51:26657',
        name: 'MC Node' //anode01-node01
    },
    {
        rpc: 'http://174.138.172.52:26657',
        name: 'SG Node' // anode01-node02
    },
    {
        rpc: 'http://131.153.57.226:26657',
        name: 'chi01-node01'
    },
    {
        rpc: 'http://131.153.57.227:26657',
        name: 'chi01-node02'
    },
    {
        rpc: 'http://131.153.175.90:26657',
        name: 'ash01-node01'
    },
    {
        rpc: 'http://131.153.175.91:26657',
        name: 'ash01-node02'
    },
    {
        rpc: 'http://131.153.174.10:26657',
        name: 'ash2-node01'
    },
    {
        rpc: 'http://131.153.174.11:26657',
        name: 'ash2-node02'
    },
    
    {
        rpc: 'http://131.153.175.92:30657',
        name: 'Sentinel Relayer API'
    },
    
    // {
    //     rpc: '',
    //     name: ''
    // },
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
];


module.exports = {
    nodes,
    pulsarNodes,
    control_nodes
}
