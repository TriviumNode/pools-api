const endpoints = [
    {
        name: 'Phoenix LB',
        url: 'http://131.153.241.98:9100/metrics',
    },
    {
        name: 'Chicago SGX01',
        url: 'http://131.153.57.226:9100/metrics',
    },
    {
        name: 'Ashburn SGX01',
        url: 'http://131.153.175.90:9100/metrics',
    },
    {
        name: 'Phoenix SGX01',
        url: 'http://174.138.172.50:9100/metrics',
    },
    {
        name: 'Phoenix SGX04',
        url: 'http://66.85.149.162:9100/metrics',
    },
    {
        name: 'Validator 1',
        url: 'http://174.138.166.130:9100/metrics',
    },
    {
        name: 'Validator 2',
        url: 'http://66.85.142.170:9100/metrics',
    },
    {
        name: 'Validator 3',
        url: 'http://74.80.180.130:9100/metrics',
    },
    {
        name: 'Pulsar Validator',
        url: 'http://131.153.202.81:9100/metrics',
    },
]

module.exports = {
    endpoints
}