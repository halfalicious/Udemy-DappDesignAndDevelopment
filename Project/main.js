//
// A simple betting smart contract for the final coding exercise of section 7 (Ethereum smart contract development using Solidity)
// of the Udemy class Ethereum : Decentralized Application Design & Development:
//
//      https://www.udemy.com/ethereum-dapp/learn/v4/t/lecture/6602204?start=0
//
// Note:The version of the contract used in this exercise has some minor modifications which improve debuggability in a browser
//      environment.
//

// Contract data
const contract_definition = '[{"constant":true,"inputs":[],"name":"lastWinnerDays","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastWinnerAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"loserCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"address_","type":"address"}],"name":"checkWinning","outputs":[{"name":"retAddress","type":"address"},{"name":"name","type":"string"},{"name":"guessVal","type":"uint8"},{"name":"guessTime","type":"uint256"},{"name":"ethersReceived","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastTimeWon","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastWinnerMinutes","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastWinnerHours","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"ownerDeposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalGuesses","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guessVal","type":"uint8"},{"name":"name","type":"string"}],"name":"guess","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"winnerCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"ownerWithdrawal","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getLastWinnerInfo","outputs":[{"name":"address_","type":"address"},{"name":"name","type":"string"},{"name":"guessVal","type":"uint8"},{"name":"guessTime","type":"uint256"},{"name":"ethersReceived","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"val1","type":"uint8"},{"name":"val2","type":"uint8"},{"name":"val3","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"winner","type":"address"},{"indexed":false,"name":"winnerName","type":"string"},{"indexed":false,"name":"winTime","type":"uint256"},{"indexed":false,"name":"guessVal","type":"uint8"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"WinningBet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"loser","type":"address"},{"indexed":false,"name":"loserName","type":"string"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"LosingBet","type":"event"}]';
const contract_bytecode = "0x6060604052341561000f57600080fd5b6040516060806112c383398101604052808051906020019091908051906020019091908051906020019091905050336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550826003600060038110151561008e57fe5b602091828204019190066101000a81548160ff021916908360ff16021790555081600360016003811015156100bf57fe5b602091828204019190066101000a81548160ff021916908360ff16021790555080600360026003811015156100f057fe5b602091828204019190066101000a81548160ff021916908360ff1602179055505050506111a1806101226000396000f3006060604052600436106100d0576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806302bb1072146100d55780631ec41163146100fe578063524799a7146101535780635249c2311461017c5780635dc121a91461027c57806365c0c411146102a557806365d8c578146102ce5780637b1aa45f146102f75780638da5cb5b146103015780638ef282491461035657806395583f711461037f578063caa02e08146103f5578063dff3f3b91461041e578063ee040eb914610441575b600080fd5b34156100e057600080fd5b6100e861051d565b6040518082815260200191505060405180910390f35b341561010957600080fd5b61011161058e565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b341561015e57600080fd5b6101666105b4565b6040518082815260200191505060405180910390f35b341561018757600080fd5b6101b3600480803573ffffffffffffffffffffffffffffffffffffffff169060200190919050506105ba565b604051808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001806020018560ff1660ff168152602001848152602001838152602001828103825286818151815260200191508051906020019080838360005b8381101561023d578082015181840152602081019050610222565b50505050905090810190601f16801561026a5780820380516001836020036101000a031916815260200191505b50965050505050505060405180910390f35b341561028757600080fd5b61028f61070c565b6040518082815260200191505060405180910390f35b34156102b057600080fd5b6102b8610778565b6040518082815260200191505060405180910390f35b34156102d957600080fd5b6102e16107e7565b6040518082815260200191505060405180910390f35b6102ff610857565b005b341561030c57600080fd5b6103146108c3565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b341561036157600080fd5b6103696108e8565b6040518082815260200191505060405180910390f35b6103db600480803560ff1690602001909190803590602001908201803590602001908080601f016020809104026020016040519081016040528093929190818152602001838380828437820191505050505050919050506108f6565b604051808215151515815260200191505060405180910390f35b341561040057600080fd5b610408610d5f565b6040518082815260200191505060405180910390f35b341561042957600080fd5b61043f6004808035906020019091905050610d65565b005b341561044c57600080fd5b610454610e35565b604051808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001806020018560ff1660ff168152602001848152602001838152602001828103825286818151815260200191508051906020019080838360005b838110156104de5780820151818401526020810190506104c3565b50505050905090810190601f16801561050b5780820380516001836020036101000a031916815260200191505b50965050505050505060405180910390f35b60006201518060046000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206003015402905090565b600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60015481565b60006105c46110bc565b600080600080600460008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020905060008160030154141515610702578060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169550806001018054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156106d85780601f106106ad576101008083540402835291602001916106d8565b820191906000526020600020905b8154815290600101906020018083116106bb57829003601f168201915b505050505094508060020160009054906101000a900460ff16935080600301549250806004015491505b5091939590929450565b600060046000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060030154905090565b6000603c60046000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206003015402905090565b6000610e1060046000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206003015402905090565b3373ffffffffffffffffffffffffffffffffffffffff166000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161415156108b257600080fd5b6000341115156108c157600080fd5b565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600060015460025401905090565b600080600080600a8660ff161115151561090f57600080fd5b64e8d4a51000341015801561092b57506601c6bf526340003411155b151561093657600080fd5b6601c6bf526340006002023073ffffffffffffffffffffffffffffffffffffffff163111151561096557600080fd5b600092505b6003831015610c84578560ff1660038460038110151561098657fe5b602091828204019190069054906101000a900460ff1660ff161415610c7757600260008154809291906001019190505550600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000209150338260000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555084826001019080519060200190610a539291906110d0565b50858260020160006101000a81548160ff021916908360ff160217905550428260030181905550600234029050803073ffffffffffffffffffffffffffffffffffffffff16311015610aba573073ffffffffffffffffffffffffffffffffffffffff163190505b80826004018190555033600560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508160000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f0d6281a0254396665cbf8cbd8245f1a8518c4972ed1243e8588981a04d2ab4d38360010184600301548560020160009054906101000a900460ff163460405180806020018581526020018460ff1660ff168152602001838152602001828103825286818154600181600116156101000203166002900481526020019150805460018160011615610100020316600290048015610c1d5780601f10610bf257610100808354040283529160200191610c1d565b820191906000526020600020905b815481529060010190602001808311610c0057829003601f168201915b50509550505050505060405180910390a23373ffffffffffffffffffffffffffffffffffffffff166108fc829081150290604051600060405180830381858888f193505050501515610c6e57600080fd5b60019350610d56565b828060010193505061096a565b6001600081548092919060010191905055503373ffffffffffffffffffffffffffffffffffffffff167f0a58ba98c2e1ef767890c74c7a25be9af01e6ea93a97812ff12fe38e9594583f86346040518080602001838152602001828103825284818151815260200191508051906020019080838360005b83811015610d16578082015181840152602081019050610cfb565b50505050905090810190601f168015610d435780820380516001836020036101000a031916815260200191505b50935050505060405180910390a2600093505b50505092915050565b60025481565b3373ffffffffffffffffffffffffffffffffffffffff166000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16141515610dc057600080fd5b6601c6bf52634000600202813073ffffffffffffffffffffffffffffffffffffffff16310310151515610df257600080fd5b3373ffffffffffffffffffffffffffffffffffffffff166108fc829081150290604051600060405180830381858888f193505050501515610e3257600080fd5b50565b6000610e3f6110bc565b60008060008060025411156110b557600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16945060046000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206001018054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610f6b5780601f10610f4057610100808354040283529160200191610f6b565b820191906000526020600020905b815481529060010190602001808311610f4e57829003601f168201915b5050505050935060046000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060020160009054906101000a900460ff16925060046000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060030154915060046000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206004015490505b9091929394565b602060405190810160405280600081525090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061111157805160ff191683800117855561113f565b8280016001018555821561113f579182015b8281111561113e578251825591602001919060010190611123565b5b50905061114c9190611150565b5090565b61117291905b8082111561116e576000816000905550600101611156565b5090565b905600a165627a7a723058208f388296507c8df4a6176be645d413e3c686ff647e251b53457bb4b1cacc9abd0029";
const contract_address = "0xd31d6df6a6017ec14716e7ff832488920ef8eead";

// Contract references
var contract = null;
var contractInstance = null;
var winningBetEvt = null;
var losingBetEvt = null;

// Constants
const ETHERSCAN_URL = "https://ropsten.etherscan.io/tx/";
const TX_TIMEOUT_MS = 60000; // 1 minute
const POLL_INTERVAL_MS = 1000; // 1 second
const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

//
// Create a new Web3 instance (or leverage an existing injected instance)
// and initialize the app after document load has completed
//
window.addEventListener("load", function() {
    // Inject web3 if necessary
    if (typeof(web3) != "undefined") {
        console.log("Injected Web3 instance detected (Metamask)");
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.log("No Injected Web3 found, attempting to connect to local node...");
        window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    }
    console.log("Web3 initialized");
    initializeApp();
});

function initializeApp() {
    loadConnectionInfo();
    loadAccounts();

    createContractInstance();
    loadStats();
    getLastWinnerInfo();
}

//
// Load Ethereum node connection information (version, peercount, blocknumber)
//
function loadConnectionInfo() {
    console.log("Loading node connection information...");
    updateElement("connection_status", web3.isConnected());

    web3.version.getNode(function (error, result) {
        if (error) {
            console.error(error);
        }
        else {
            updateElement("node_version", result);
        }
    });
    web3.net.getPeerCount(function (error, result) {
        if (error) {
            console.error(error);
        } else {
            updateElement("peer_count", result);
        }
    });
    web3.eth.getBlockNumber(function (error, result) {
        if (error) {
            console.error(error);
        } else {
            updateElement("block_number", result);
        }
    });
}

//
// Load contract bet stats
//
function loadStats() {
    contractInstance.totalGuesses.call(function (error, result) {
        if (error) {
            console.error(error);
        } else {
            console.log("Total guesses: " + result);
            updateElement("total_guesses", result);
        }
    });
    contractInstance.winnerCount.call(function (error, result) {
        if (error) {
            console.error(error);
        } else {
            console.log("Winner count: " + result);
            updateElement("winner_count", result);
        }
    });
    contractInstance.loserCount.call(function (error, result) {
        if (error) {
            console.error(error);
        } else {
            console.log("Loser count: " + result);
            updateElement("loser_count", result);
        }
    });
    contractInstance.lastTimeWon.call(function (error, result) {
        if (error) {
            console.error(error);
        } else {
            if (result != 0) {
                var wonTime = new Date(Number(result)).toString();
                console.log("Last time won: " + wonTime);
                updateElement("last_time_won", wonTime);
            }
        }
    })
}

//
// Monitor a sent transaction for completion, returns a Promise
// object which performs the actual monitoring.
//
// Sent transactions go into the pending state until they complete,
// i.e. they are either mined or rejected. The receipt object is
// undefined until the transaction completes, at which point
// receipt.status is set to 1 (if the tx is mined) or 0 (tx failed).
//
function monitorTransaction(txHash) {
    var endTime = Number(new Date() + TX_TIMEOUT_MS);
    var transactionCheck = function (resolve, reject) {
        web3.eth.getTransactionReceipt(txHash, function (error, receipt) {
            if (error) {
                reject(new Error("Transaction failed: " + error));
            }
            // Receipt will only be defined once the transaction has gone from pending -> completed
            // Note that completed can represent either successful or failed transaction
            else if (receipt) {
                if (receipt.status == 1) {
                    resolve();
                } else {
                    reject(new Error("Transaction failed (status == 0)"));
                }
            } else if (Number(new Date()) >= endTime) {
                reject(new Error("Transaction timed out"));
            } else {
                setTimeout(transactionCheck, POLL_INTERVAL_MS, resolve, reject);
            }
        });
    }
    return new Promise(transactionCheck);
}

//
// Retrieve the information for the last winner (if available)
//
function getLastWinnerInfo() {
    contractInstance.getLastWinnerInfo.call(function (error, result) {
        if (error) {
            console.error(error);
        } else {
            if (result[0] != NULL_ADDRESS) {
                updateWinnerInfo(result);
            } else {
                console.log("No last winner");
            }
        }
    });
}

//
// Check if the selected acount was a winner and if so, retrieve 
// its winning information
//
function checkWinning() {
    var accountList = getElement("account_list");
    var account = accountList[accountList.selectedIndex].value;
    contractInstance.checkWinning.call(account, function(error, result) {
        if (error) {
            console.error(error);
        } else {
            if (result[0] != NULL_ADDRESS) {
                updateWinnerInfo(result);
            } else {
                console.log("Account " + account + " wasn't a winner");
            }
        }
    });
}

//
// Update page with winner information
//
function updateWinnerInfo(winnerInfo) {
    updateElement("winner_address", winnerInfo[0]);
    updateElement("winner_name", web3.toAscii(winnerInfo[1]));
    updateElement("winner_guess_value", winnerInfo[2]);
    updateElement("winner_amount", web3.fromWei(winnerInfo[3]));
    updateElement("winner_time_won", new Date(Number(winnerInfo[4])).toString());
}

//
// Submit a bet
//
function submitBet() {
    var accountList = getElement("account_list");

    var betterAddress = accountList[accountList.selectedIndex].value;
    var betterName = getElement("better_name").value;
    var betterGuess = getElement("better_guess").value;
    var betterValue = getElement("better_value").value;

    // The callback will be called twice - once after the tx is sent and again
    // after the tx completes
    contractInstance.guess.sendTransaction(
        betterGuess,
        web3.fromAscii(betterName),
        { from: betterAddress, value: web3.toWei(betterValue) },
        function (error, result) {
            if (error) {
                console.error("Error sending transaction: " + error);
            } else {               
                console.log("Bet transaction sent: " + ETHERSCAN_URL + result);
                monitorTransaction(result, TX_TIMEOUT_MS).then(function () {
                    console.log("Bet transaction completed");
                }).catch(function(error) {
                    console.error("Bet transaction failed: " + error);
                });
            }
        });
}

//
// Submit an owner operation tx and monitor for completion
//
function submitOwnerOperation() {
    var ownerOperation = getElement("owner_operation");
    var ownerAmount = Number(getElement("owner_amount").value);

    // Deposit tx
    if (ownerOperation[ownerOperation.selectedIndex].value == "Deposit") {
        contractInstance.ownerDeposit.sendTransaction(
            { from: getActiveAccount(), value: web3.toWei(ownerAmount) }, 
            function (error, result) {
                if (!error) {
                    console.log("Deposit transaction sent: " + ETHERSCAN_URL + result);
                    monitorTransaction(result, TX_TIMEOUT_MS).then(function (error, result) {
                        if (error) {
                            console.error("Deposit transaction failed: " + error);
                        } else {
                            updateAccountBalance(getActiveAccount());
                            updateContractBalance(contractInstance.address);
                        }
                    });
                } else {
                    console.error("Sending deposit transaction failed: " + error);
                }
            });
    
    // Withdraw tx
    } else if (ownerOperation[ownerOperation.selectedIndex].value == "Withdraw") {
        contractInstance.ownerWithdrawal.sendTransaction(
            web3.toWei(ownerAmount),
            function (error, result) {
                if (!error) {
                    console.log("Withdraw transaction sent: " + ETHERSCAN_URL + result);
                    monitorTransaction(result, TX_TIMEOUT_MS).then(function (error, result) {
                        if (error) {
                            console.error("Withdraw transaction failed: " + error);
                        } else {
                            console.log("Withdraw transaction completed");
                            updateAccountBalance(getActiveAccount());
                            updateContractBalance(contractInstance.address);
                        }
                    });
                } else {
                    console.error("Sending withdraw transaction failed");
                }
            });
    } else {
        console.error("Unidentified operation");
    }
}

///////////////////////////////////////////////////////////////////////////////
//  Contract functions
///////////////////////////////////////////////////////////////////////////////

//
// Initialize contract events
//
function initializeContractEvents() {
    // Winning bet
    winningBetEvt = contractInstance.WinningBet();
    winningBetEvt.watch(function (error, result) {
        console.log("Winning bet made");
        var winnerCount = Number(getElement("winner_count").innerHTML) + 1;
        updateElement("winner_count", winnerCount);
        updateElement("total_guesses", Number(getElement("total_guesses").innerHTML) + 1);

        updateElement("winner_address", result.args.winner);
        updateElement("winner_name", web3.toAscii(result.args.winnerName));
        updateElement("winner_guess_val", result.args.guessVal);
        updateElement("winner_amount", web3.fromWei(result.args.amount));
        updateElement("winner_time_won", new Date(Number(result.args.guessTime)).toString());


    });

    // Losing bet
    losingBetEvt = contractInstance.LosingBet();
    losingBetEvt.watch(function (error, result) {
        console.log("Losing bet made");
        var loserCount = Number(getElement("loser_count").innerHTML) + 1;
        updateElement("loser_count", loserCount);
        updateElement("total_guesses", Number(getElement("total_guesses").innerHTML) + 1);
    });
}

function updateContractInfo() {
    console.log("Contract address: " + contractInstance.address);
    updateElement("contract_address", contractInstance.address);
    updateContractBalance(contractInstance.address);
    updateContractOwner();
}

function updateContractOwner() {
    contractInstance.owner.call(function (error, result) {
        if (error) {
            console.error(error);
        } else {
            console.log("Contract owner: " + result);
            updateElement("contract_owner", result);
        }
    });
}

function updateContractBalance(address) {
    web3.eth.getBalance(address, function(error, result) {
        if (error) {
            console.error(error);
        } else {
            console.log("Contract balance: " + web3.fromWei(result));
            updateElement("contract_balance", web3.fromWei(result));
        }
    });
}

function createContractInstance() {
    contract = web3.eth.contract(JSON.parse(contract_definition));
    contractInstance = contract.at(contract_address);
    initializeContractEvents();
    updateContractInfo();
}

//
// Deploy the contract. Note that the callback will be called
// twice - once when the transaction is sent and once when
// the contract is mined. contract.address is only defined once
// the contract is mined.
//
function deployContract() {
    contract.new(
        getElement("contract_val1").value,
        getElement("contract_val2").value,
        getElement("contract_val3").value,
        {
          from: getActiveAccount(), 
          data: contract_bytecode,
          gas: '4700000'
        }, function (error, contract) {
            if (!error) {
                if (contract.address) {
                    console.log("Contract mined");
                    contractInstance = contract;
                    initializeContractEvents();
                    updateContractInfo();
                }
                else if (contract.transactionHash) {
                    console.log("Contract deploy transaction sent: " + ETHERSCAN_URL + contract.transactionHash);
                }
            }
      });
}

///////////////////////////////////////////////////////////////////////////////
//  Account functions
///////////////////////////////////////////////////////////////////////////////
function getActiveAccount() {
    var account_list = getElement("account_list");
    return account_list[account_list.selectedIndex].value;
}

function updateAccountBalance(address) {
    console.log("Retrieving balance for: " + address);
    web3.eth.getBalance(address, function(error, result) {
        if (error) {
            console.error(error);
        } else {
            updateElement("account_balance", web3.fromWei(result)); // TODO: Display wei + either in separate fields
        }
    });
}

// 
// Iterate over accounts and add them to the account select list.
//
function loadAccounts() {
    console.log("Loading accounts...");
    web3.eth.getAccounts(function (error, result) {
        var accountList = getElement("account_list");
        if (error) {
            console.error(error);
        } else {
            if (result.length == 0) {
                console.error("No accounts found. If you're using Metamask are you logged in?");
            } else {
                result.forEach(function (account) {
                    var option = document.createElement("option");
                    option.text = account;
                    accountList.add(option);
                });
                updateAccountBalance(accountList[accountList.selectedIndex].value);
            }
        }
    });
}

///////////////////////////////////////////////////////////////////////////////
//  Helper functions
///////////////////////////////////////////////////////////////////////////////
function getElement(elementId) {
    var element = document.getElementById(elementId);
    if (!element) {
        console.error("Element with id not found: " + elementId);
    }
    return element;
}

function updateElement(elementId, newValue) {
    var element = document.getElementById(elementId);
    if (!element) {
        console.error("Element with the following id not found: " + elementId);
    } else {
        element.innerHTML = newValue;
    }
}
