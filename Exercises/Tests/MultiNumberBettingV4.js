//
// Truffle tests for simple betting smart contract from Section 7 (Ethereum Smart Contract Development Using Solidity)
// Coding Exercise 4 (Enum, Mapping, & Struct)
//
//      https://www.udemy.com/ethereum-dapp/learn/v4/t/lecture/7030576?start=0
//

var MultiNumberBettingV4 = artifacts.require("./MultiNumberBettingV4.sol");

contract('MultiNumberBettingV4', function(accounts) {
    var defaultAddress = "0x0000000000000000000000000000000000000000";
    var alice = { address: accounts[0], name: "Alice" };
    var bob = { address: accounts[1], name: "Bob" };

    it('Winner information should only be populated after a winning guess is made', function() {
        var multiNumberBetting;
        return MultiNumberBettingV4.deployed().then(function (instance) {
            multiNumberBetting = instance;

            return multiNumberBetting.getLastWinnerInfo.call();
        }).then(function (result) {
            // Should be no winner info returned if no guess has been made
            assert.equal(result[0].valueOf(), defaultAddress, "Winner address doesn't default to " + defaultAddress);
            assert.equal(result[1].valueOf(), "", "Winner name doesn't default to empty string");
            assert.equal(result[2].valueOf(), 0, "Time guessed doesn't default to 0");

            console.log("Making losing guess...");
            multiNumberBetting.guess(2, alice.name, {from: alice.address});
            return multiNumberBetting.getLastWinnerInfo.call();
        }).then(function (result) {

            // Should be no winner info returned if only a losing guess has been made
            assert.equal(result[0].valueOf(), defaultAddress, "Winner address isn't still default value: " + defaultAddress);
            assert.equal(result[1].valueOf(), "", "Winner name isn't still default value (empty string)");
            assert.equal(result[2].valueOf(), 0, "Time of winning guess isn't still default value (0)");

            // Test a winning guess
            console.log("Making winning guess. Guesser: " + bob.name + ", Address: " + bob.address);
            multiNumberBetting.guess(1, bob.name, {from: bob.address});
            return multiNumberBetting.getLastWinnerInfo.call();
        }).then(function (result) {
            assert.equal(result[0].valueOf(), bob.address, "Winner address wasn't set correctly after winning guess");
            assert.equal(result[1].valueOf(), bob.name, "Winner name wasn't set correctly after winning guess");
        });
    });

    it('Info for winners prior to last winner can be checked', function() {
        var multiNumberBetting;
        return MultiNumberBettingV4.deployed().then(function (instance) {
            multiNumberBetting = instance;

            console.log("Making another winning guess...");
            multiNumberBetting.guess(3, alice.name, {from: alice.address});
            return multiNumberBetting.checkWinning.call(bob.address);
        }).then(function (result) {
            // Bob's address should still be registered as a prior winner
            assert.equal(result[0].valueOf(), bob.address, "Address of last winner - 1 wasn't returned");
            assert.equal(result[1].valueOf(), bob.name, "Name of last winner - 1 wasn't returned");
        });
    });
});
