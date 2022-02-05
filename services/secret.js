const db = require('./db');
const helper = require('../helper');

const { CosmWasmClient } = require("secretjs");

getQueryClient = () => {
    return new CosmWasmClient(process.env.REST_URL)
}
  

async function queryInfo(address, queryJs, token = false) {
    const data = await queryJs.getContract(address)

    const rows = await db.query(
        `INSERT INTO contracts
        (code_id, creator, label, address)
        VALUES (?, ?, ?, ?);`,
        [data.codeId, data.creator, data.label, data.address]
    );
    const result = helper.emptyOrRows(rows);
    console.log(result.insertId);

    let snip20;
    try {
        snip20 = await queryJs.queryContractSmart(address, {token_info: {}})

        if (snip20.token_info.symbol) {
            await setSnip20(address, snip20.token_info)
        } else {
            throw ("not a token");
        }
        if (token){
            return [{
                id: result.insertId,
                address: data.address,
                symbol: snip20.token_info.symbol,
                decimals: snip20.token_info.decimals,
                contract_label: data.label,
                code_id: data.codeId,
                creator: data.creator,
                name: snip20.token_info?.name || null,
                image: null,
                coingecko_id: null
            }]
        }else {
            return [{
                id: result.insertId,
                address: data.address,
                label: data.label,
                code_id: data.codeId,
                creator: data.creator,
                name: snip20.token_info?.name || null
            }]
        }


    } catch {
        if (e.toString().includes("unknown variant") || e.toString().includes("not a token")){

            return [{
                id: result.insertId,
                address: data.address,
                label: data.label,
                code_id: data.codeId,
                creator: data.creator,
                name: null
            }]

        } else {
            console.log("ERROR:", e)

            return [{
                id: result.insertId,
                address: data.address,
                label: data.label,
                code_id: data.codeId,
                creator: data.creator,
                name: null
            }]

        }
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

  
module.exports = {
    getQueryClient,
    queryInfo
  }