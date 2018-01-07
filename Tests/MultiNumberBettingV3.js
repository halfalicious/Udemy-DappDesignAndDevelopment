//
// Truffle tests for simple betting smart contract from Section 7 (Ethereum Smart Contract Development Using Solidity)
// Coding Exercise 3 (Global Variables)
//
//      https://www.udemy.com/ethereum-dapp/learn/v4/t/lecture/7029938?start=0
//
var MultiNumberBettingV3 = artifacts.require("./MultiNumberBettingV3.sol");

var wrongGuess = {name: "Alice", guess: 5 };
var rightGuess = {name: "Bob", guess: 10 };

contract('MultiNumberBettingV3', function(accounts) {
    it("Total guesses should default to 0 and be incremented when a guess is made", function() {
        var multiNumberBetting;
        var guessCount = 0;
        return MultiNumberBettingV3.deployed().then(function(instance) {
            multiNumberBetting = instance;

            // Validate default number of guesses
            return multiNumberBetting.totalGuesses.call();
        }).then(function (result){
            assert.equal(result.valueOf(), guessCount, "Total guesses doesn't default to 0");

            // Make wrong guess and check total guess count and loser count
            console.log("Making incorrect guess...");
            multiNumberBetting.guess(wrongGuess.guess, wrongGuess.name);
            guessCount++;
            return multiNumberBetting.totalGuesses.call();
        }).then(function (result) {
            assert.equal(result.valueOf(), guessCount, "Total guesses is incorrect");
            return multiNumberBetting.loserCount.call();
        }).then(function(result) {
            assert.equal(result.valueOf(), guessCount, "Loser count is incorrect");

            // Make right guess and check total guess count and winner count
            console.log("Making correct guess...");
            multiNumberBetting.guess(rightGuess.guess, rightGuess.name);
            guessCount++;
            return multiNumberBetting.totalGuesses.call();
        }).then(function (result) {
            assert.equal(result.valueOf(), guessCount, "Total guesses is incorrect");
            return multiNumberBetting.winnerCount.call();
        }).then(function (result) {
            assert.equal(result.valueOf(), guessCount - 1, "Total winner count is incorrect");
        });
    });
});

contract('MultiNumberBettingV3', function(accounts) {
    it("Last Winner Name should default to *** and only change after a winning guess", function() {
        var multiNumberBetting;
        var defaultName = "***";

        return MultiNumberBettingV3.deployed().then(function(instance) {
            multiNumberBetting = instance;

            // Check default lastWinnerName value
            return multiNumberBetting.getLastWinner.call();
        }).then(function (result) {
            assert.equal(result.valueOf(), defaultName, "lastWinnerName isn't expected default");

            // Verify lastWinnerName doesn't change after losing guess
            console.log("Making losing guess...");
            multiNumberBetting.guess(wrongGuess.guess, wrongGuess.name);
            return multiNumberBetting.getLastWinner.call();
        }).then(function (result) {
            assert.equal(result.valueOf(), defaultName, "lastWinnerName changed after losing guess");

            // Verify lastWinnerName value changes after winning guess
            console.log("Making winning guess...");
            multiNumberBetting.guess(rightGuess.guess, rightGuess.name);
            return multiNumberBetting.getLastWinner.call();
        }).then(function (result) {
            assert.equal(result.valueOf(), rightGuess.name, "lastWinnerName not set after winning guess");
        });
    });
});

contract('MultiNumberBettingV3', function(accounts) {
    it("Last winner time should default to 0", function() {
        var multiNumberBetting;

        return MultiNumberBettingV3.deployed().then(function(instance) {
            multiNumberBetting = instance;
            return multiNumberBetting.lastWinnerDays.call();
        }).then(function (result) {
            assert.equal(result.valueOf(), 0, "lastWinnerDays doesn't default to 0");
            return multiNumberBetting.lastWinnerHours.call();
        }).then(function (result) {
            assert.equal(result.valueOf(), 0, "lastWinnerHours doesn't default to 0");
            return multiNumberBetting.lastWinnerMinutes.call();
        }).then(function (result) {
            assert.equal(result.valueOf(), 0, "lastWinnerMinutes doesn't default to 0");
        });
    });

    it("Last winner time should not updated after losing guess", function() {
        var multiNumberBetting;

        return MultiNumberBettingV3.deployed().then(function (instance) {
            multiNumberBetting = instance;
            console.log("Making losing guess...");
            multiNumberBetting.guess(wrongGuess.guess, wrongGuess.name);
            return multiNumberBetting.lastWinnerDays.call();
        }).then(function (result) {
            assert.equal(result.valueOf(), 0, "lastWinnerDays was updated after losing guess");
            return multiNumberBetting.lastWinnerHours.call();
        }).then(function (result) {
            assert.equal(result.valueOf(), 0, "lastWinnerHours was updated after losing guess");
            return multiNumberBetting.lastWinnerMinutes.call();
        }).then(function (result) {
            assert.equal(result.valueOf(), 0, "lastWinnerMinutes was updated after losing guess");
        });
    });

    // TODO:Add test which validates lastWinner time values are changed after winning guess
    //      Need to find equivalent of assert.notEqual
});

contract('MultiNumberBettingV3', function(accounts) {
    it("lastWinnerAddress should reflect account which makes winning guess", function() {
        var multiNumberBetting;
        var defaultAddress = "0x0000000000000000000000000000000000000000";

        return MultiNumberBettingV3.deployed().then(function(instance) {
            multiNumberBetting = instance;

            // Validate lastWinnerAddress default value
            return multiNumberBetting.lastWinnerAddress.call();
        }).then(function (result) {
            assert.equal(result.valueOf(), defaultAddress, "lastWinnerAddress isn't default value");

            // Verify lastWinnerAddress doesn't change after losing guess
            console.log("Making losing guess...");
            multiNumberBetting.guess(wrongGuess.guess, wrongGuess.name, { from: accounts[0] });
            return multiNumberBetting.lastWinnerAddress.call();
        }).then(function (result) {
            assert.equal(result.valueOf(), defaultAddress, "lastWinnerAddress changed after losing guess");

            // Verify lastWinnerAddress changes after winning guess
            console.log("Making winning guess...");
            multiNumberBetting.guess(rightGuess.guess, rightGuess.name, { from: accounts[1] });
            return multiNumberBetting.lastWinnerAddress.call();
        }).then(function (result) {
            assert.equal(result.valueOf(), accounts[1], "lastWinnerAddress not set after winning guess");
        });
    });
});

    // TODO:Verify exception is thrown when guess is outside of required range defined in contract
    // Note:Cannot currently test as Truffle doesn't seem to have JS support for testing
    //      for expected exceptions. See the following page for details:
    //
    //          https://github.com/trufflesuite/truffle/issues/498
    //          
    //      This does appear to be supported for tests written in Solidity: 
    //
    //          http://truffleframework.com/tutorials/testing-for-throws-in-solidity-tests
    //

