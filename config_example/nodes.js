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
        rpc: 'http://1.2.3.4:26657',
        name: 'node01'
    },
    {
        rpc: 'http://1.2.3.4:26657',
        name: 'node02'
    },
    
    // {
    //     rpc: '',
    //     name: ''
    // },
]


module.exports = {
    nodes,
    control_nodes
}
