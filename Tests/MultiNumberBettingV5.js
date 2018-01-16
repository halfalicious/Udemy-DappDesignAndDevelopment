//
// Truffle tests for simple betting smart contract from Section 7 (Ethereum Smart Contract Development Using Solidity)
// Coding Exercise 5 (Constants and Payables)
//
//      https://www.udemy.com/ethereum-dapp/learn/v4/t/lecture/7030588?start=0
//

var MultiNumberBettingV5 = artifacts.require("./MultiNumberBettingV5.sol");

function getWeiStr(wei) {
    return wei.toString() + "/" + web3.fromWei(wei);
}

contract('MultiNumberBettingV5', function(accounts) {
    // Identities
    var alice = { address: accounts[0], name: "Alice", balance: 0 };
    var bob = { address: accounts[1], name: "Bob", balance: 0 };
    var charlie = { address: accounts[2], name: "Charlie", balance: 0 };

    // From MultiNumberBettingAbstractV1 contract
    var MIN_BET = 0.000001;
    var MAX_BET = 0.0005;

    it('Betters account is debited and contract is credited for losing guess', function() {
        var multiNumberBetting;

        var gasUsed = 0;
        var gasCost = 0;
        var contractBalance = 0;
        var betAmount = web3.toWei(MAX_BET/2);
        var better = alice;
        return MultiNumberBettingV5.deployed().then(function (instance) {
            multiNumberBetting = instance;
            
            // Get default balance for contract
            return web3.eth.getBalance(multiNumberBetting.address);
        }).then(function (result) {
            contractBalance = result;
            console.log("Default contract balance: " + getWeiStr(contractBalance));

            // Get default balance for account making the bet
            return web3.eth.getBalance(better.address);
        }).then(function (result) {
            better.balance = result;
            console.log("Default balance for better " + better.name + ": " + getWeiStr(better.balance));

            // Make losing guess
            console.log(better.name + " is making losing guess with " + getWeiStr(betAmount));
            return multiNumberBetting.guess(2, better.name, { from: better.address, value: betAmount });
        }).then(function (result) {
            gasUsed = result.receipt.gasUsed.valueOf();
            return web3.eth.getTransaction(result.tx);
        }).then(function (result) {
            // Compute gas cost so you can verify that better's account was debited the right amount (bet + gasCost)
            // Note:Need to use web3.eth.getTransaction().gasPrice to retrieve correct gas price in Truffle test
            //      (need to retrieve transaction's gas price, not network's gas price - not setting a gas
            //      price in tx results default value being used, not the network's gas price)
            gasCost = result.gasPrice.times(gasUsed);
            console.log(
                "Bet tx gas cost(" + getWeiStr(gasCost) +
                ") = gasUsed(" + getWeiStr(gasUsed) +
                ") * gasPrice(" + getWeiStr(result.gasPrice) + ")"
            );

            // Verify contract was credited with bet amount
            return web3.eth.getBalance(multiNumberBetting.address);
        }).then(function (result) {
            assert.equal(
                contractBalance.plus(betAmount).toString(),
                result.toString(),
                "Contract wasn't credited with bet amount"
            );

            // Verify money was withdrawn from better's account (bet + gasCost of making bet)
            return web3.eth.getBalance(better.address);
        }).then(function (result) {
            var expectedBalance = better.balance.minus(betAmount).minus(gasCost);
            console.log(
                "Expected balance(" + getWeiStr(expectedBalance) +
                ") = Starting balance(" + getWeiStr(better.balance) + ") - gas cost(" + getWeiStr(gasCost) + ")"
            );
            assert.equal(
                expectedBalance.toString(),
                result.toString(),
                "Incorrect bet amount (" + getWeiStr(betAmount) + 
                    ") or gasCost (" + getWeiStr(gasCost) + 
                    ") debited from better's account (starting balance: " + getWeiStr(better.balance) + ")"
            );
        });
    });

    it('Better gets 2x bet amount with winning guess (and sufficient contract balance)', function() {
        var multiNumberBetting;
        
        var betAmount = web3.toWei(MIN_BET * 2);
        var gasCost = 0;
        var gasUsed = 0;
        var losingBetter = charlie;
        var winningBetter = bob;

        return MultiNumberBettingV5.deployed().then(function (instance) {
            multiNumberBetting = instance;
            
            // Losing better makes 2 bets
            console.log("Better " + losingBetter.name + " making losing bet with " + getWeiStr(betAmount));
            return multiNumberBetting.guess(4, losingBetter.name, { from: losingBetter.address, value: betAmount });
        }).then(function (result) {
            console.log("Better " + losingBetter.name + " making losing bet with " + getWeiStr(betAmount));
            return multiNumberBetting.guess(6, losingBetter.name, { from: losingBetter.address, value: betAmount });
        }).then(function (result) {
            return web3.eth.getBalance(winningBetter.address);
        }).then(function (result) {
            winningBetter.balance = result;
            console.log(winningBetter.name + " starting account balance: " + getWeiStr(winningBetter.balance));

            // Winning better makes 1 winning bet
            console.log("Better " + winningBetter.name + " making winning bet with " + getWeiStr(betAmount));
            return multiNumberBetting.guess(1, winningBetter.name, { from: winningBetter.address, value: betAmount });
        }).then(function (result) {
            gasUsed = result.receipt.gasUsed;
            return web3.eth.getTransaction(result.tx);
        }).then(function (result) {
            // Compute gas cost
            gasCost = result.gasPrice.times(gasUsed);
            console.log(
                "Bet tx gas cost(" + getWeiStr(gasCost) + 
                ") = gas used(" + getWeiStr(gasUsed) + 
                ") * gas price(" + getWeiStr(result.gasPrice) + ")"
            );
            return web3.eth.getBalance(winningBetter.address);
        }).then(function (result) {
            var expectedBalance = winningBetter.balance.plus(betAmount).minus(gasCost);
            assert.equal(
                expectedBalance.toString(),
                result.toString(),
                "Winning better (" + winningBetter.name + ") wasn't credited with  2x bet - gasCost"
            );
        })
    });

    it('Better gets remaining bet amount with winning guess (and insufficient contract balance)', function() {
        var multiNumberBetting;
        
        var betAmount = web3.toWei(MAX_BET);
        var gasCost = 0;
        var gasUsed = 0;
        var contractBalance = 0;
        var winningBetter = bob;
        return MultiNumberBettingV5.deployed().then(function (instance) {
            multiNumberBetting = instance;
            
            return web3.eth.getBalance(multiNumberBetting.address);
        }).then(function (result) {
            contractBalance = result;
            console.log("Contract starting balance: " + getWeiStr(contractBalance));
            assert.equal(result.valueOf() < betAmount, true, "Account balance isn't less than test bet");
            return web3.eth.getBalance(winningBetter.address);
        }).then(function (result) {
            winningBetter.balance = result;
            console.log("Better " + winningBetter.name + " starting balance: " + getWeiStr(winningBetter.balance));
            console.log("Better "+ winningBetter.name + " making winning bet with " + getWeiStr(betAmount));
            return multiNumberBetting.guess(3, winningBetter.name, { from: winningBetter.address, value: betAmount });
        }).then(function (result) {
            gasUsed = result.receipt.gasUsed;
            return web3.eth.getTransaction(result.tx);
        }).then(function (result) {
            gasCost = result.gasPrice.times(gasUsed);
            console.log(
                "Bet tx gas cost (" + getWeiStr(gasCost) +
                ") = gas price (" + getWeiStr(result.gasPrice) +
                ") + gas used (" + getWeiStr(gasUsed) + ")"
            );
            return web3.eth.getBalance(multiNumberBetting.address);
        }).then(function (result) {
            assert.equal(result.toString(), "0", "contract balance isn't 0");
            return web3.eth.getBalance(winningBetter.address);
        }).then(function (result) {
            assert.equal(
                winningBetter.balance.minus(gasCost).plus(contractBalance).toString(),
                result.toString(),
                "Better " + winningBetter.name + " wasn't credited with remaining contract balance " + contractBalance
            );
        });
    });

    it('Bet amount < MIN_BET throws exception', function() {
        var multiNumberBetting;
        return MultiNumberBettingV5.deployed().then(function (instance) {
            multiNumberBetting = instance;
            var better = charlie;
            return multiNumberBetting.guess(5, better.name, { from: better.address, value: 0 });
        }).then(assert.fail).catch(function (error) {
            assert.include(error.message, "VM Exception", "Making bet with amount < MIN_BET should throw exception");
        });
    });

    it('Bet amount > MAX_BET throws exception', function() {
        var multiNumberBetting;
        return MultiNumberBettingV5.deployed().then(function (instance) {
            multiNumberBetting = instance;
            var better = alice;
            var betAmount = web3.toWei(MAX_BET + MIN_BET);
            return multiNumberBetting.guess(5, better.name, { from: better.address, value: betAmount });
        }).then(assert.fail).catch(function (error) {
            assert.include(error.message, "VM Exception", "Making bet with amount > MAX_BET should throw exception");
        });
    });
});
