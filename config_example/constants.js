const TENDERMINT_CHECK_INTERVAL = 300_000; //5 minutes
const SYSTEM_CHECK_INTERVAL = 1_800_000; //30 minutes


const DISK_USE_ALERT_PERCENTAGE = 90; // Alerts at 90% Used

module.exports = {
    TENDERMINT_CHECK_INTERVAL,
    SYSTEM_CHECK_INTERVAL,
    DISK_USE_ALERT_PERCENTAGE,
}