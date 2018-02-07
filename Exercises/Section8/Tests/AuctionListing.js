//
// Tests for simple auction smart contract for Section 8 Project 1 of the Udemy class
// "Ethereum: Decentralized Application Design & Development":
//
//      https://www.udemy.com/ethereum-dapp/learn/v4/t/lecture/6979728?start=0
//
var AuctionListing = artifacts.require("./AuctionListing.sol");

const AUCTION_END_TIME = 5; // auction end time (in seconds)

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//
// Force a new block to be mined via TestRPC's evm_mine function.
// Used to force an update to block.timestamp after a wait so that
// smart contract calls which depend on time having passed can be
// made.
//
function forceMine() {
    return new Promise(function (resolve, reject) {
        web3.currentProvider.sendAsync({
            jsonrpc: "2.0",
            method: "evm_mine",
            id: 12345
          }, function(err, result) {
            if (err) reject(err);
            else resolve();
        });
    });
}

async function getGasCost(txResult) {
    var gasUsed = txResult.receipt.gasUsed;
    let tx = await web3.eth.getTransaction(txResult.tx);
    var gasCost = tx.gasPrice.times(gasUsed);
    return gasCost;
}

contract('AuctionListing', function(accounts) {
    var auctionListing;

    // Create new, clean contract instance before each test
    beforeEach(async function() {
        auctionListing = await AuctionListing.new("Car", "Honda Accord", web3.toWei(1), AUCTION_END_TIME);
     });

    var alice = { address: accounts[0], name: "Alice" };
    var bob = { address: accounts[1], name: "Bob", bidAmount: web3.toWei(2) };
    var charlie = { address: accounts[2], name: "Charlie", bidAmount: web3.toWei(1) };
    var sybil = { address: accounts[3], name: "Sybil", bidAmount: web3.toWei(0.5) };
    var owner = alice; // must be alice since contract is deployed via account[0]

    it('People can place bids, contract will end on time, and owner can withdraw funds', async function() {
        var highBidder = bob;
        var lowBidder = charlie;

        // Make winning bid (bid > min bid)
        console.log(highBidder.name + " is making bid of " + web3.fromWei(highBidder.bidAmount));
        let result = await auctionListing.placeBid({ from: highBidder.address, value: highBidder.bidAmount }); 
        assert.equal(result.logs[0].event, "HighBid", "HighBid event wasn't fired after first bet");
        assert.equal(result.logs[0].args.bidder, highBidder.address, "Bidder address in HighBid event wasn't address of bidder");
        assert.equal(result.logs[0].args.bidAmount, highBidder.bidAmount, "Bid amount in HighBid event wasn't amount bid by bidder");
        
        // Make losing bid (bid < high bid)
        console.log(lowBidder.name + " is making bid of " + web3.fromWei(lowBidder.bidAmount));
        result = await auctionListing.placeBid({ from: lowBidder.address, value: lowBidder.bidAmount });
        assert.equal(result.logs[0].event, "BidFailed", "BidFailed event wasn't fired after losing bet");
        assert.equal(result.logs[0].args.bidder, lowBidder.address, "Bidder address in event wasn't address of low bidder");
        assert.equal(result.logs[0].args.bidAmount, lowBidder.bidAmount, "Bid amount in event wasn't amount bid by low bidder");


        //
        // Reclaim amount bid
        //

        // Compute expected balance after withdrawing funds and compare to actual balance
        console.log(lowBidder.name + " is reclaiming amount bid: " + web3.fromWei(lowBidder.bidAmount));
        let startingBalance = await web3.eth.getBalance(lowBidder.address);
        result = await auctionListing.claimBidAmount({ from: lowBidder.address });
        let gasCost = await getGasCost(result);
        var computedEndingBalance = startingBalance.plus(lowBidder.bidAmount).minus(gasCost);

        let endingBalance = await web3.eth.getBalance(lowBidder.address);
        assert.equal(computedEndingBalance.toString(), endingBalance.toString(), "Low bidder's balance after withdrawal isn't equal to starting balance minus gas cost of tx");

        // Wait for auction to end
        console.log("Waiting for auction to end...");
        await timeout(AUCTION_END_TIME * 1000);
        console.log("Auction has ended");
        
        // Force a block to be mined so that block.timestamp will be updated
        await forceMine();

        // Verify time left is 0
        let timeLeft = await auctionListing.timeLeft.call();
        assert.equal(timeLeft.valueOf(), 0, "Time left in auction isn't 0 after waiting for auction to expire");

        // Close out contract + verify owner balance
        startingBalance = await web3.eth.getBalance(owner.address);
        contractBalance = await web3.eth.getBalance(auctionListing.address);

        console.log("Ending auction...");
        result = await auctionListing.bidEnd({ from: owner.address });
        console.log("Auction ended!");
        gasCost = await getGasCost(result);
        endingBalance = await web3.eth.getBalance(owner.address);
        computedEndingBalance = startingBalance.plus(contractBalance).minus(gasCost);
        assert.equal(
            computedEndingBalance.toString(),
            endingBalance.toString(),
            "Auction owner's balance after auction end doesn't reflect unredeemed bids - gas cost"
        );
    });

    // Note:Cannot test placing bid after auction end because self-destructed contract can still be called
    //      and accept funds, the called functions won't actually do anything though.
    it('Placing bid < min bid throws exception', async function() {
        // Try to place bid < minBid
        var smallBidder = sybil;
        
        try {
            console.log("Bidder " + smallBidder.name + " is placing a bid < minBid");
            let result = await auctionListing.placeBid({ from: smallBidder.address, value: smallBidder.bidAmount });
            assert.fail(0, 1, "Small bid should fail");
        } catch (e) {
            assert.include(e.message, "VM Exception", "Making bid less than minimum bid amount should throw exception");
        }
    });
});

