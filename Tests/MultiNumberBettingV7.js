//
// Truffle tests for simple betting smart contract from Section 7 (Ethereum Smart Contract Development Using Solidity)
// Coding Exercise 7 (Events)
//
//      https://www.udemy.com/ethereum-dapp/learn/v4/t/lecture/7030598?start=0
//

var MultiNumberBettingV7 = artifacts.require("./MultiNumberBettingV7.sol");

function getWeiStr(wei) {
    return wei.toString() + "/" + web3.fromWei(wei);
}

// Truffle gas price, NOT eth network gas price
// (cannot retrieve via web3.eth.gasPrice, need to retrieve from
// tx receipt)
var gasPrice;

contract('MultiNumberBettingV7', function(accounts) {
    // Identities
    var alice = { address: accounts[0], name: "Alice", balance: 0 };
    var bob = { address: accounts[1], name: "Bob", balance: 0 };

    var contractOwner = alice; // must be Alice since contract is deployed via account[0]

    // From MultiNumberBettingAbstractV3 contract
    var MIN_BET = web3.toWei(0.000001);
    var MAX_BET = web3.toWei(0.0005);

    var minContractBalance = 2 * MAX_BET;
    var minContractBalanceForBet = 2 * MAX_BET + MIN_BET;

    // TODO: Does the gas price work here? 
    // Setup contract for subsequent tests
    it('Owner should deposit 10 ether into contract', function() {
        var multiNumberBetting;
        var depositAmountInEther = 10;
        var depositAmountInWei = web3.toWei(depositAmountInEther);
        return MultiNumberBettingV7.deployed().then(function (instance) {
            multiNumberBetting = instance;
            console.log("Depositing " + depositAmountInEther + " ether");
            return multiNumberBetting.ownerDeposit({ from: contractOwner.address, value: depositAmountInWei });
        }).then(function (result) {
            // Save gas price for later tests
            gasPrice = result.receipt.gasPrice;

            return web3.eth.getBalance(multiNumberBetting.address);
        }).then(function (result) {
            console.log("Contract balance: " + getWeiStr(result));
            assert.equal(
                result.greaterThanOrEqualTo(depositAmountInWei).toString(),
                "true",
                "Contract balance doesn't reflect deposited amount"
            );
        });
    });

    it('Winning better information shows up in events', function() {
        var multiNumberBetting;
        var winningBetter = alice;
        var betAmount = MIN_BET;
        var winningGuessVal = 9;
        return MultiNumberBettingV7.deployed().then(function (instance) {
            multiNumberBetting = instance;
            console.log(winningBetter.name + " is making winning guess with amount " + getWeiStr(betAmount));
            return multiNumberBetting.guess(winningGuessVal, winningBetter.name, { from: winningBetter.address, value: betAmount });
        }).then(function (result) {
            assert.equal(result.logs[0].event, "WinningBet", "WinningBet event wasn't fired after winning bet");

            // Validate winner information
            assert.equal(result.logs[0].args.winner, winningBetter.address, "Event didn't contain winning better's address");
            assert.equal(result.logs[0].args.winnerName, winningBetter.name, "Event didn't contain winning better's name");
            assert.equal(result.logs[0].args.amount.toString(), betAmount.toString(), "Event didn't contain bet amount");
        });
    });

    it('Losing better information shows up in events', function() {
        var multiNumberBetting;
        var losingBetter = bob;
        var betAmount = 2 * MIN_BET;
        var losingGuessVal = 2;
        return MultiNumberBettingV7.deployed().then(function (instance) {
            multiNumberBetting = instance;
            return multiNumberBetting.guess(losingGuessVal, losingBetter.name, { from: losingBetter.address, value: betAmount });
        }).then(function (result) {
            assert.equal(result.logs[0].event, "LosingBet", "LosingBet event wasn't fired after winning bet");

            // Validate winner information
            assert.equal(result.logs[0].args.loser, losingBetter.address, "Event didn't contain losing better's address");
            assert.equal(result.logs[0].args.loserName, losingBetter.name, "Event didn't contain losing better's name");
            assert.equal(result.logs[0].args.amount.toString(), betAmount.toString(), "Event didn't contain amount bet");
        });
    });
});