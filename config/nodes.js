
const controlNodeSecret = 'https://rpc.scrt.network/status';
const controlNodePulsar = 'http://40.88.137.151:26657/status';
  
const triviumNodes = [
    // 'http://66.85.137.179:26657/status', // tpn02-node01
    // 'http://66.85.137.180:26657/status', // tpn02-node02

    'http://174.138.172.51:26657/status', // anode01-node01
    'http://174.138.172.52:26657/status', // anode01-node01

    'http://131.153.57.226:26657/status', // chi-node01
    'http://131.153.57.227:26657/status', // chi-node02
    'http://131.153.57.228:26657/status', // chi-node03

    'http://131.153.175.90:26657/status', // ash-node01
    'http://131.153.175.91:26657/status', // ash-node02
    'http://131.153.175.92:26657/status', // ash-node03
];

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
    triviumNodes,
    pulsarNodes,
    controlNodeSecret,
    controlNodePulsar,
}