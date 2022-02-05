const db = require('./db');
const pool = require('./db');
const helper = require('../helper');
const config = require('../config');
const app = require('../index');
var request = require('request');

async function fixMissingTokenData(queryJs){
  const rows = await db.query(
    `Select id, address
    from contracts
    where symbol IS NULL
    and snip20 = 1`
  );
  const data = helper.emptyOrRows(rows);

  for (let i = 0; i < data.length; i++) {
    let address = data[i].address;

    let snip20;
    try {
      snip20 = await queryJs.queryContractSmart(address, {token_info: {}})
      if (snip20.token_info.symbol) {
        console.log("is snip20")
        await setSnip20(address, snip20.token_info)
      }
    } catch(e) {
      if (e.toString().includes("unknown variant")){
        setNotSnip20(address);
      } else {
        console.log("ERROR:", e)
      }
    }

  }

  return {
    data
  }
}

async function setSnip20(address, tokenInfo){
  const rows = await db.query(
    `UPDATE contracts SET
      snip20=1,
      decimals=?,
      symbol=?,
      name=?
    WHERE address=?;`,
    [tokenInfo.decimals, tokenInfo.symbol, tokenInfo.name, address]
  );
  const result = helper.emptyOrRows(rows);
  console.log(result);
}

async function setNotSnip20(address){
  const rows = await db.query(
    `UPDATE contracts SET
      snip20=0
    WHERE address=?;`,
    [address]
  );
  const result = helper.emptyOrRows(rows);
  console.log(result);
}

module.exports = {
  fixMissingTokenData,
}