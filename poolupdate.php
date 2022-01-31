<?php

function getPDO() {
        $host = '127.0.0.1';
        $db   = 'scrt_contracts';
        $user = 'localroot';
        $pass = 'Fz1vM17tUzy2Qxpb';
        $charset = 'utf8mb4';

        $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
        $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
                $pdo = new PDO($dsn, $user, $pass, $options);
                return $pdo;
        } catch (\PDOException $e) {
                 throw new \PDOException($e->getMessage(), (int)$e->getCode());
        }
}

function getTokenInfo($address) {
        $query = "secretcli q compute query $address '{\"token_info\":{}}'";
        exec($query, $output, $return_var);
        if (strpos($output[0], 'ERROR') !== false) {
                $snip20 = false;
                #echo $output[0]."\n";
                throw "Not a SNIP20";
        } else {
                $json = json_decode($output[0], true);
                #echo json_encode($json)."\n\n";
                return $json["token_info"];
        }
}

function getAssetInfo($address, $pdo) {
        $stmt = $pdo->prepare('SELECT * FROM contracts WHERE address = ?');
        $stmt->execute([$address]);
        $sqlout = $stmt->fetch();
        if (!$sqlout) {
                echo "Didnt find token $address in DB, fetching...\n";

                #get basic contract info
                $str = file_get_contents('https://lcd.scrt-archive.xiphiar.com/wasm/contract/'.$address); //get contract info
                $contractjson = json_decode($str, true); // decode the JSON into an associative array
                $result = $contractjson['result'];

                #insert basic info
                try {
                        $stmt = $pdo->prepare('INSERT INTO contracts (code_id, creator, label, address) VALUES (?, ?, ?, ?)');
                        $stmt->execute([$result["code_id"], $result["creator"],  $result["label"], $address]);
                        $cid = $pdo->lastInsertId();
                        echo "Added ".$result["label"]." contract info to DB.\n";
                } catch (PDOException $e) {
                        if (strpos($e->getMessage(), "Integrity constraint violation: 1062 Duplicate entry") !== FALSE) {
                                echo "Duplicate contract? This shouldn't happen... $address\n";
                        } else {
                                echo "Failed to add to DB!!!!\n$e\n";
                        }
                }

                #get token_info
                $token_info = getTokenInfo($address);
                $decimals = $token_info["decimals"];
                $symbol = $token_info["symbol"];
                $name = $token_info["name"];

                if (strpos($name, 'spy-') !== false) {
                        $decimals = 6;
                }

                #set SNIP20 data
                setSnip20($address, $pdo);
                setDecimals($address, $decimals, $pdo);
                setName($address, $name, $pdo);
                setSymbol($address, $symbol, $pdo);

                #return fresh data from DB
                $stmt = $pdo->prepare('SELECT * FROM contracts WHERE address = ?');
                $stmt->execute([$address]);
                $sqlout = $stmt->fetch();
                return $sqlout;

        } else {
                #swap tokens should be SNIP20's
                if (!$sqlout["snip20"]){

                        #get token info
                        $token_info = getTokenInfo($address);
                        $decimals = $token_info["decimals"];
                        $symbol = $token_info["symbol"];
                        $name = $token_info["name"];

                        if (strpos($name, 'spy-') !== false) {
                                $decimals = 6;
                        }

                        #set SNIP20 data
                        setSnip20($address, $pdo);
                        setDecimals($address, $decimals, $pdo);
                        setName($address, $name, $pdo);
                        setSymbol($address, $symbol, $pdo);

                        #return fresh data from DB
                        $stmt = $pdo->prepare('SELECT * FROM contracts WHERE address = ?');
                        $stmt->execute([$address]);
                        $sqlout = $stmt->fetch();
                        return $sqlout;

                } else {
                        #echo "$address is in DB\n";
                        return $sqlout;
                }
        }
}

function getAddressLabel($address) {
        $pdo = getPDO();
        $stmt = $pdo->prepare('SELECT label FROM contracts WHERE address = ?');
        $stmt->execute([$address]);
        $sqlout = $stmt->fetch();
        if (!$sqlout) {
                echo "Didnt find $address in DB, fetching...\n";
                $str = file_get_contents('https://lcd.scrt-archive.xiphiar.com/wasm/contract/'.$address);
                $contractjson = json_decode($str, true); // decode the JSON into an associative array
                $result = $contractjson['result'];

                try {
                        $stmt = $pdo->prepare('INSERT INTO contracts (code_id, creator, label, address) VALUES (?, ?, ?, ?)');
                        $stmt->execute([$result["code_id"], $result["creator"],  $result["label"], $address]);
                        echo "Added ".$result["label"]." to DB.\n";
                } catch (PDOException $e) {
                        $existingkey = "Integrity constraint violation: 1062 Duplicate entry";
                        if (strpos($e->getMessage(), $existingkey) !== FALSE) {
                                echo "DUPLICATE!!!!\n";
                        } else {
                                echo "Failed to add to DB!!!!\n$e\n";
                        }
                }
        } else {
                #echo "$address is in DB111\n";
                $label = $sqlout['label'];
                return $label;
        }
}


function setSnip20($address) {
        $pdo = getPDO();
        $stmt = $pdo->prepare('UPDATE contracts SET snip20=1 WHERE address = ?');
        $stmt->execute([$address]);
        #echo "Set $address to SNIP20\n";
}

function setDecimals($address, $decimals) {
        $pdo = getPDO();
        $stmt = $pdo->prepare('UPDATE contracts SET decimals=? WHERE address = ?');
        $stmt->execute([$decimals, $address]);
        #echo "Set $address to $decimals decimals.\n";
}

function setName($address, $name) {
        $pdo = getPDO();
        $stmt = $pdo->prepare('UPDATE contracts SET name=? WHERE address = ?');
        $stmt->execute([$name, $address]);
        #echo "Set $address to $name.\n";
}

function setSpyAddress($address, $spyAddress) {
        $pdo = getPDO();
        $stmt = $pdo->prepare('UPDATE contracts SET spyAddress=? WHERE address = ?');
        $stmt->execute([$spyAddress, $address]);
        echo "Set $address spy address to $spyAddress.\n";
}

function setSymbol($address, $symbol) {
        $pdo = getPDO();
        $stmt = $pdo->prepare('UPDATE contracts SET symbol=? WHERE address = ?');
        $stmt->execute([$symbol, $address]);
        #echo "Set $address to $symbol.\n";
}

function insertPair($cid, $sid) {
        $pdo = getPDO();

        try {
                $stmt = $pdo->prepare('INSERT INTO pairs (contractID, swapID) VALUES (?, ?)');
                $stmt->execute([$cid, $sid]);
                $sqlout = $stmt->fetch();
                echo "Inserted $cid with $sid.\n";
        } catch (PDOException $e) {
                $existingkey = "Integrity constraint violation: 1062 Duplicate entry";
                if (strpos($e->getMessage(), $existingkey) !== FALSE) {
                        echo "Error: Pair token CID: $cid exists for SID: $sid!!!!\n";
                } else {
                        echo "BIG ERROR: Failed to add pair to DB!!!!\n$e\n";
                }
        }
}

function getContractID($address) {
        $pdo = getPDO();
        $stmt = $pdo->prepare('SELECT id FROM contracts WHERE address = ?');
        $stmt->execute([$address]);
        $sqlout = $stmt->fetch();
        if (!$sqlout) {
                echo "Didnt find $address in DB\n";
        } else {
                $id = $sqlout['id'];
                return $id;
        }
}

function getSwapID($cid) {
        $pdo = getPDO();
        $stmt = $pdo->prepare('SELECT id FROM swaps WHERE contract = ?');
        $stmt->execute([$cid]);
        $sqlout = $stmt->fetch();
        if (!$sqlout) {
                echo "Didnt find CID $cid in Swap DB\n";
        } else {
                $id = $sqlout['id'];
                return $id;
        }
}


$pdo = getPDO();
$count = 0;
$notadded = 0;


#get list of swaps from bridge API
$str = file_get_contents('https://api-bridge-mainnet.azurewebsites.net/secretswap_pairs');
$json = json_decode($str, true); // decode the JSON into an associative array
$pools = $json['pairs'];

foreach($pools as $key => $data) {

        #get asset1 info
        #$asset1 = $data['asset_infos'][0]['token']['contract_addr'];
        #if (is_null($asset1)) {
                #if null, get native token
        #        $asset1 = $data['asset_infos'][0]['native_token']['denom'];
        #}
        #$info1 = getAssetInfo($asset1, $pdo);

        #get asset2 info
        #$asset2 = $data['asset_infos'][1]['token']['contract_addr'];
        #if (is_null($asset2)) {
        #        $asset2 = $data['asset_infos'][1]['native_token']['denom'];
        #}
        #$info2 = getAssetInfo($asset2, $pdo);
		
		
        #get asset1 info
		if (array_key_exists("token", $data['asset_infos'][0])) {
			$asset1 = $data['asset_infos'][0]['token']['contract_addr'];
		} elseif (array_key_exists("native_token", $data['asset_infos'][0])) {
			$asset1 = $data['asset_infos'][0]['native_token']['denom'];
		}
        $info1 = getAssetInfo($asset1, $pdo);

        #get asset2 info
		if (array_key_exists("token", $data['asset_infos'][1])) {
			$asset2 = $data['asset_infos'][1]['token']['contract_addr'];
		} elseif (array_key_exists("native_token", $data['asset_infos'][1])) {
			$asset2 = $data['asset_infos'][1]['native_token']['denom'];
		}
        $info2 = getAssetInfo($asset2, $pdo);



        #pool vars
        $poolContract = $data['contract_addr'];
        $poolLabel = getAddressLabel($poolContract);
        $poolName = "SecretSwap--".$info1["symbol"]."--".$info2["symbol"];
        $poolCID = getContractID($poolContract);
        echo "POOL NAME: $poolName\n";

        #LP token vars
        $poolToken = $data['liquidity_token'];
        $tokenName = "SWAPLP-".$info1["symbol"]."-".$info2["symbol"];
        $LPtokenInfo = getAssetInfo($poolToken, $pdo);
        $LPTokenCID = $LPtokenInfo["id"];
        echo "LP TOKEN NAME: $tokenName\n";

        #update DB
        setName($poolContract, $poolName);
        setSnip20($poolToken);
        setDecimals($poolToken, 6);
        setName($poolToken, $tokenName);

        #insert swap
        try {
                $stmt = $pdo->prepare('INSERT INTO swaps (contract, tokenContract) VALUES (?, ?)');
                $stmt->execute([$poolCID, $LPTokenCID]);
                $sqlout = $stmt->fetch();
                $sid = $pdo->lastInsertId();
                echo "SWAPID: $sid\n";
        } catch (PDOException $e) {
                $existingkey = "Integrity constraint violation: 1062 Duplicate entry";
                if (strpos($e->getMessage(), $existingkey) !== FALSE) {
                        $sid = getSwapID($poolCID);
                        #echo "Error: Swap: $poolName already exists in DB with SID: $sid!!!!\n";
                        $notadded += 1;
                } else {
                        echo "Failed to add swap to DB!!!!\n$e\n";
                }
        }

        #insert asset1
        try {
                insertPair($info1["id"], $sid);
        } catch (PDOException $e) {
                if (strpos($e->getMessage(), "Integrity constraint violation: 1062 Duplicate entry") !== FALSE) {
                        #echo "Error: Pair $cid1 - $sid already in DB!\n";
                } else {
                        echo "Failed to add pair to DB!!!!\n$e\n";
                }
        }

        #insert asset2
        try {
                insertPair($info2["id"], $sid);
        } catch (PDOException $e) {
                $existingkey = "Integrity constraint violation: 1062 Duplicate entry";
                if (strpos($e->getMessage(), $existingkey) !== FALSE) {
                        #echo "Error: Pair $cid2 - $sid already in DB!\n";
                } else {
                        echo "Failed to add pair to DB!!!!\n$e\n";
                }
        }

        echo "Processed ".$info1["symbol"]." <> ".$info2["symbol"].".\n####################\n\n\n";
        $count += 1;
}
echo "COUNT: $count\n";
echo "SKIPPED: $notadded";


//Get SPY tokens
$count = 0;

$str = file_get_contents('https://api-bridge-mainnet.azurewebsites.net/rewards');
$json = json_decode($str, true); // decode the JSON into an associative array
$rewards = $json['pools'];
foreach($rewards as $key => $data) {
	$label = getAddressLabel($data['pool_address']);
	setName($data['pool_address'], "Bridge Mining");
        setSpyAddress($data['inc_token']['address'], $data['pool_address']);

        echo "Processed ".$data['pool_address'].".\n####################\n\n\n";
        $count += 1;
}
echo "COUNT: $count\n";



//UPDATE TOKENS FROM ENIGMA API
function setBridged($address, $image, $source) {
        $pdo = getPDO();
        $stmt = $pdo->prepare('UPDATE contracts SET bridged = 1 WHERE address like ?');
        $stmt->execute([$address]);
		if (isset($source)) {
			$stmt = $pdo->prepare('UPDATE contracts SET sourceAddress = ? WHERE address like ?');
			$stmt->execute([$source, $address]);
		}
		if (isset($image)) {
			$stmt = $pdo->prepare('UPDATE contracts SET image = ? WHERE address like ?');
			$stmt->execute([$image, $address]);
		}
        echo "Set $address as bridgable\n";
}

$str = file_get_contents('https://api-bridge-mainnet.azurewebsites.net/tokens');
$json = json_decode($str, true); // decode the JSON into an associative array
$tokens = $json['tokens'];
foreach($tokens as $key => $data) {
    setBridged($data['dst_address'], $data['display_props']['image'], $data['src_address']);
}

$str = file_get_contents('https://bridge-bsc-mainnet.azurewebsites.net/tokens');
$json = json_decode($str, true); // decode the JSON into an associative array
$tokens = $json['tokens'];
foreach($tokens as $key => $data) {
	setBridged($data['dst_address'], $data['display_props']['image'], $data['src_address']);
}



//UPDATE CG ID's
function setCGID($src_address, $cgid) {
        $pdo = getPDO();
        $stmt = $pdo->prepare('UPDATE contracts SET coingecko_id = ? WHERE LOWER( contracts.sourceAddress ) LIKE ?');
        $stmt->execute([$cgid, $src_address]);
		
		if ($stmt->rowCount()){
			echo 'Success: At least 1 row was affected.';
		} else{
			#echo 'Failure: 0 rows were affected.';
		}
        
}

function findBySrcAddr($src_address) {
        $pdo = getPDO();
		$input = "%$src_address%";
		#echo $input, "\n\n";
        $stmt = $pdo->prepare('SELECT address FROM contracts WHERE LOWER( contracts.sourceAddress ) LIKE ?');
        $stmt->execute([$input]);
        $sqlout = $stmt->fetch();
		print_r($sqlout);
		return $sqlout;
        #echo "Set CGID for $cgid\n";
}

$str = file_get_contents('https://api.coingecko.com/api/v3/coins/list?include_platform=true');
$json = json_decode($str, true); // decode the JSON into an associative array
$tokens = $json;
foreach($tokens as $key => $data) {
        if (isset($data["platforms"]["ethereum"])) {
			#findBySrcAddr($data["platforms"]["ethereum"]);
            setCGID($data["platforms"]["ethereum"], $data["id"]);
        } elseif (isset($data["platforms"]["binance-smart-chain"])) {
			#findBySrcAddr($data["platforms"]["binance-smart-chain"]);
            setCGID($data["platforms"]["binance-smart-chain"], $data["id"]);
        }
}

setCGID("secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8fzek", "secret");
setCGID("secret15l9cqgz5uezgydrglaak5ahfac69kmx2qpd6xt", "secret-finance");
?>

