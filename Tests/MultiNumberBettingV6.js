//
// Truffle tests for simple betting smart contract from Section 7 (Ethereum Smart Contract Development Using Solidity)
// Coding Exercise 6 (Modifiers)
//
//      https://www.udemy.com/ethereum-dapp/learn/v4/t/lecture/7030592?start=0
//

var MultiNumberBettingV6 = artifacts.require("./MultiNumberBettingV6.sol");

function getWeiStr(wei) {
    return wei.toString() + "/" + web3.fromWei(wei);
}

// From MultiNumberBettingAbstractV2 contract
var MIN_BET = new web3.BigNumber(web3.toWei(0.000001));
var MAX_BET = new web3.BigNumber(web3.toWei(0.0005));

var minContractBalance = MAX_BET.times(2);
var minContractBalanceForBet = minContractBalance.plus(MIN_BET);

contract('MultiNumberBettingV6', function(accounts) {
    // Identities
    var alice = { address: accounts[0], name: "Alice", balance: 0 };
    var bob = { address: accounts[1], name: "Bob", balance: 0 };
    var charlie = { address: accounts[2], name: "Charlie", balance: 0 };

    var contractOwner = alice; // must be Alice since contract is deployed via account[0]
    var notContractOwner = charlie;

    // Truffle gas price, NOT eth network gas price (cannot retrieve via web3.eth.gasPrice,
    // need to retrieve from tx receipt)
    var gasPrice;

    it('Owner cannot withdraw from contract if balance will drop below minContractBalance', function() {
        return MultiNumberBettingV6.deployed().then(function (instance) {
            multiNumberBetting = instance;
            return web3.eth.getBalance(multiNumberBetting.address);
        }).then(function (result) {
            assert.equal(result.valueOf(), 0, "Contract balance doesn't default to 0");
            var depositAmount = minContractBalance;
            return multiNumberBetting.ownerDeposit({ from: contractOwner.address, value:  depositAmount });
        }).then(function (result) {
             // Attempt to withdraw money
             return multiNumberBetting.ownerWithdrawal(MIN_BET);
        }).then(assert.failure).catch(function (error) {
            assert.include(
                error.message,
                "VM Exception",
                "Attempting withdrawal which drops contract balance below minContractBalance should throw exception"
            );
        });
    });

    // Setup contract for subsequent tests
    it('Owner should deposit 10 ether into contract', function() {
        var multiNumberBetting;
        var depositAmount = web3.toWei(10);
        return MultiNumberBettingV6.deployed().then(function (instance) {
            multiNumberBetting = instance;
            console.log("Depositing " + getWeiStr(depositAmount));
            return multiNumberBetting.ownerDeposit({ from: contractOwner.address, value: depositAmount });
        }).then(function (result) {
            // Get gas price
            return web3.eth.getTransaction(result.tx);
        }).then(function (result) {
            // Save gas price for later tests
            gasPrice = result.gasPrice;

            return web3.eth.getBalance(multiNumberBetting.address);
        }).then(function (result) {
            console.log("Contract balance: " + getWeiStr(result));
            assert.equal(
                result.greaterThanOrEqualTo(depositAmount).toString(),
                "true",
                "Contract balance doesn't reflect deposited amount"
            );
        });
    });
    
    it('Owner can withdraw from contract if balance will not drop below minContractBalance', function() {
        var multiNumberBetting;
        var contractBalance;
        var gasCost;
        var gasUsed;
        var withdrawalAmount = MIN_BET;
        return MultiNumberBettingV6.deployed().then(function (instance) {
            multiNumberBetting = instance;

            // Verify contract has enough for test (minContractBalance + withdrawalAmount)
            return web3.eth.getBalance(multiNumberBetting.address);
        }).then(function (result) {
            console.log(
                "Contract balance(" + getWeiStr(result) +
                "), minContractBalance(" + getWeiStr(minContractBalance) +
                "), withdrawalAmount(" + getWeiStr(withdrawalAmount) + ")"
            );
            assert.equal(
                result.greaterThanOrEqualTo(minContractBalance.plus(withdrawalAmount)),
                true,
                "Contract balance isn't greater than minContractBalance"
            );
            contractBalance = result;

            return web3.eth.getBalance(contractOwner.address);
        }).then(function (result) {
            contractOwner.balance = result;
            console.log(
                "Contract owner withdrawing " + getWeiStr(withdrawalAmount) +
                " from account with balance " + getWeiStr(contractOwner.balance)
            );

            // Make withdrawal and compute gas cost of tx for later use in verifying expected
            // owner balance (original balance + withdrawal amount - gas cost of tx)
            return multiNumberBetting.ownerWithdrawal(withdrawalAmount, { from: contractOwner.address });
        }).then(function (result) {
            gasUsed = result.receipt.gasUsed;
            return web3.eth.getTransaction(result.tx);
        }).then(function (result) {
            gasCost = result.gasPrice.times(gasUsed);
            console.log("Gas cost of withdrawal: " + getWeiStr(gasCost));
        }).then(function (result) {

            // Verify contract balance
            return web3.eth.getBalance(multiNumberBetting.address);
        }).then(function (result) {
            console.log("Contract balance: " + getWeiStr(result));
            assert.equal(
                result.toString(),
                contractBalance.minus(withdrawalAmount).toString(),
                "Expected amount wasn't withdrawn from contract"
            );

            // Verify contract owner balance
            return web3.eth.getBalance(contractOwner.address);
        }).then(function (result) {
            assert.equal(
                contractOwner.balance.minus(gasCost).plus(withdrawalAmount).toString(),
                result.toString(),
                "Contract owner's account wasn't credited with expected amount"
            );
        });
    });

    it('Non-owner cannot withdraw funds from contract', function() {
        var multiNumberBetting;
        var withdrawalAmount = MIN_BET;
        return MultiNumberBettingV6.deployed().then(function (instance) {
            multiNumberBetting = instance;
            assert.notEqual(
                contractOwner.address,
                notContractOwner.address,
                "Contract owner and non-contract owner are the same person"
            );

            // Verify contract has enough to withdrawal
            return web3.eth.getBalance(multiNumberBetting.address);
        }).then(function (result) {
            assert.equal(
                result.greaterThanOrEqualTo(minContractBalance.plus(withdrawalAmount).valueOf()),
                true,
                "Contract balance not enough for withdrawal"
            );
            console.log("Non-owner " + notContractOwner.name + " making withdrawal of " + getWeiStr(withdrawalAmount));
            return multiNumberBetting.ownerWithdrawal(withdrawalAmount, { from: notContractOwner.address });
        }).then(assert.failure).catch(function (error) {
            assert.include(
                error.message,
                "VM Exception",
                "Non-owner attempting to withdraw funds from contract should throw exception"
            );
        });
    });

    // Try to make losing guess with valid contract balance
    it('One can make losing guess with valid contract balance', function() {
        var multiNumberBetting;

        var better = bob;
        var betAmount = MIN_BET;
        var guessVal = 9;
        var gasCost;
        return MultiNumberBettingV6.deployed().then(function (instance) {
            multiNumberBetting = instance;

            // Verify contract has enough for losing bet
            return web3.eth.getBalance(multiNumberBetting.address);
        }).then(function (result) {
            console.log(
                "Contract balance: " + getWeiStr(result) + 
                ", bet amount: " + getWeiStr(betAmount)
            );

            assert.equal(
                result.greaterThanOrEqualTo(minContractBalanceForBet.plus(betAmount)),
                true,
                "Contract balance isn't big enough for one to make losing bet"
            );

            // Verify better has enough to make (losing) bet
            return web3.eth.getBalance(better.address);
        }).then(function (result) {
            better.balance = result;
            return multiNumberBetting.guess.estimateGas(guessVal, better.name, { from: better.address, value: betAmount });
        }).then(function (result) {
            console.log("gasPrice: " + gasPrice.valueOf());
            gasCost = result.valueOf() * gasPrice;
            console.log(
                "Better balance: " + getWeiStr(better.balance) + 
                " >= betAmount(" + getWeiStr(betAmount) + 
                ") + gasCost(" + getWeiStr(gasCost) + ")"
            );
            assert.equal(
                better.balance.greaterThanOrEqualTo(betAmount.plus(gasCost)),
                true,
                "Better doesn't have enough funds to make bet"
            );
            
            // Make losing bet
            console.log("Better " + better.name + " is making losing bet worth " + getWeiStr(betAmount));
            return multiNumberBetting.guess(guessVal, better.name, { from: better.address, value: betAmount });
        }).then(function (result) {
            // No exception was thrown so the test passed
        });
    });
});

contract('MultiNumberBettingV6', function(accounts) {
    it('Making guess with invalid contract balance triggers exception', function() {
        var multiNumberBetting;

        // Identities
        var bob = { address: accounts[1], name: "Bob", balance: 0 };
        var alice = { address: accounts[0], name: "Alice", balance: 0 };

        var contractOwner = alice;
        var better = bob;
        var betAmount = MIN_BET;
        return MultiNumberBettingV6.deployed().then(function (instance) {
            multiNumberBetting = instance;
            
            // Contract balance defaults to 0. Deposit minBalanceForBet - MIN_BET
            return multiNumberBetting.ownerDeposit({ from: contractOwner.address, value: minContractBalanceForBet.minus(MIN_BET) });
        }).then(function (result) {
            // Make bet
            return multiNumberBetting.guess(2, better.name, { from: better.address, value: MIN_BET });
        }).then(assert.failure).catch(function (error) {
            assert.include(
                error.message,
                "VM Exception",
                "Making bet with invalid contract balance didn't throw exception"
            );
        })
    });
});
