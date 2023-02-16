const db = require('./db');
const helper = require('../helper');

const { SecretNetworkClient } = require("secretjs");
const { query } = require('express');
const axios = require('axios');
const contracts = require('./contracts');

let queryJs;

getQueryClient = async() => {
    // return await SecretNetworkClient.create({
    //     grpcWebUrl: process.env.GRPC_URL,
    //     chainId: process.env.CHAIN_ID,
    // });
    return new SecretNetworkClient({
        url: process.env.REST_URL,
        chainId: "secret-4",
    })
}

main = async() => {
    queryJs = await getQueryClient();
    // await getSSwapPools();

}

main();

// async function queryInfo(address, token = false) {
//     const codeHash = await queryJs.query.compute.contractCodeHash(address);
//     const data = await queryJs.query.compute.contractInfo(address);
//     const created = data.ContractInfo.created ? data.ContractInfo.created.blockHeight : null
//     //console.log("Data: ", data)
    
//     const rows = await db.query(
//         `INSERT IGNORE INTO contracts
//         (address, label, code_id, code_hash, creator)
//         VALUES (?, ?, ?, ?, ?);`,
//         [data.address, data.ContractInfo.label, data.ContractInfo.codeId, codeHash, data.ContractInfo.creator]
//     );
//     const result = helper.emptyOrRows(rows);
//     //console.log(result.insertId);
    
//    //const result = {insertId: 1}
//     const snip20 = await checkSnip20({address: address, codeHash: codeHash});
//     //console.log("SNIP20: ", snip20)

//     const spy = await checkSpyToken({address: address, codeHash: codeHash, label: data.ContractInfo.label});

//     if (snip20){
//         return {
//             id: result.insertId,
//             address: data.address,
//             symbol: snip20.symbol,
//             decimals: snip20.decimals,
//             contract_label: data.ContractInfo.label,
//             code_id: data.ContractInfo.codeId,
//             creator: data.ContractInfo.creator,
//             name: snip20.name || null,
//             image: null,
//             coingecko_id: null
//         }
//     }else {
//         return {
//             id: result.insertId,
//             address: data.address,
//             label: data.ContractInfo.label,
//             code_id: data.ContractInfo.codeId,
//             code_hash: codeHash,
//             creator: data.ContractInfo.creator,
//         }
//     }
// }

// async function checkSnip20({address, codeHash}) {
//     const response = await queryJs.query.compute.queryContract({
//         contractAddress: address,
//         codeHash: codeHash,
//         query: {token_info: {}}
//     });

//     if (response && response.token_info){
//         setSnip20(address, response.token_info)
//         return {
//             name: response.token_info.name,
//             symbol: response.token_info.symbol,
//             decimals: response.token_info.decimals,
//             total_supply: response.token_info.total_supply
//         }
//     }
//     else return null;
// }

// async function checkSpyToken({address, codeHash, label}) {
//     if (!label.includes('spy' || 'SPY')){
//         return null;
//     }
//     const response = await queryJs.query.compute.queryContract({
//         contractAddress: address,
//         codeHash: codeHash,
//         query: { incentivized_token: {} }
//     });

//     if (response && response.incentivized_token){
//         //get incentivised token info (and ensure its in the database)
//         await contracts.getSingle(response.incentivized_token.token.address);
//         await setSpyToken({
//             spyToken: address,
//             stakeToken: response.incentivized_token.token.address
//         })
//         return true;
//     }
//     else return null;
// }

// async function checkSSwapPool({address, codeHash}) {
//     const response = await queryJs.query.compute.queryContract({
//         contractAddress: address,
//         codeHash: codeHash,
//         query: {token_info: {}}
//     });
//     //console.log("SNIP20 query: ", response)

//     if (response && response.token_info){
//         //setSnip20(address, response.token_info)
//         return {
//             name: response.token_info.name,
//             symbol: response.token_info.symbol,
//             decimals: response.token_info.decimals,
//             total_supply: response.token_info.total_supply
//         }
//     }
//     else return null;
// }

// async function setSnip20(address, tokenInfo){
//     const rows = await db.query(
//         `UPDATE contracts SET
//         snip20=1,
//         decimals=?,
//         symbol=?,
//         name=?
//         WHERE address=?;`,
//         [tokenInfo.decimals, tokenInfo.symbol, tokenInfo.name, address]
//     );
//     const result = helper.emptyOrRows(rows);
// }

// async function setSpyToken({spyToken, stakeToken}){
//     const rows = await db.query(
//         `UPDATE contracts SET
//         spyAddress=?
//         WHERE address=?;`,
//         [spyToken, stakeToken]
//     );
//     const result = helper.emptyOrRows(rows);
// }


// async function getSSwapPools(){
//     //query the sswap endpoint for all pairs
//     const { data: { pairs } } = await axios.get('https://api-bridge-mainnet.azurewebsites.net/secretswap_pairs')

//     //console.log(pairs)
//     pairs.forEach(async(pair) => {
//         const assets = pair.asset_infos
//         const contractAddr = pair.contract_addr
//         const lpToken = pair.liquidity_token
//         if (assets[0].native_token || assets[1].native_token) return;

//         const tokensData = await Promise.all([
//             getContract(contractAddr),
//             getContract(lpToken),
//             getContract(assets[0].token.contract_addr),
//             getContract(assets[1].token.contract_addr),
//         ])
//         const symbol0 = tokensData[2].symbol
//         const symbol1 = tokensData[3].symbol
//         const swapName = `SecretSwap Pair ${symbol0} - ${symbol1}`
//         const lpTokenName = `SecretSwap LP Token  ${symbol0} - ${symbol1}`
//         await Promise.all([
//             setName({address: contractAddr, name: swapName}),
//             setName({address: lpToken, name: lpTokenName})
//         ])
//     })
//     console.log('done')
// }

// async function getContract(input){
//     //query DB for contract
//     const rows = await db.query(
//         `Select *
//         from contracts
//         where address=?`,
//         [input]
//     );
//     const data = helper.emptyOrRows(rows);

//     //return DB data if found
//     if (data.length){
//         return data[0]
//     }

//     //otherwise get data from chain
//     const res = await queryInfo(input);
//     return {
//         data: res
//     }

// }

// async function setName({address, name}){
//     const rows = await db.query(
//         `UPDATE contracts SET
//         name=?
//         WHERE address=?;`,
//         [name, address]
//     );
//     const result = helper.emptyOrRows(rows);
// }
  
module.exports = {
    getQueryClient,
    // queryInfo
  }