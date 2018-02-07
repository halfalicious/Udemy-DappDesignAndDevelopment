//
// Tests for simple auction smart contract factory for Section 8 Project 1 of the
// Udemy class "Ethereum: Decentralized Application Design & Development":
//
//      https://www.udemy.com/ethereum-dapp/learn/v4/t/lecture/6979728?start=0
//
var AuctionListingFactory = artifacts.require("./AuctionListingFactory.sol");

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

const AUCTION_END_TIME = 5; // auction end time (in seconds)

contract("AuctionListingFactory", function(accounts) {
    var contractInstance;

    // Deploy new contract before each test
    beforeEach(async function() {
        contractInstance = await AuctionListingFactory.new();
    });

    // Accounts
    var alice = { address: accounts[0], name: "Alice" };
    var bob = { address: accounts[1], name: "Bob", bidAmount: web3.toWei(2) };
    var charlie = { address: accounts[2], name: "Charlie", bidAmount: web3.toWei(1) };
    var sybil = { address: accounts[3], name: "Sybil", bidAmount: web3.toWei(0.5) };

    var owner = alice; // must be alice since contract is deployed via account[0]
    var bidder = bob;

    // Items to be auctioned
    var items = [
        {
            name: "Car",
            description: "Honda Accord 2018",
            minBid: 1,
            bidEnd: AUCTION_END_TIME
        },
        {
            name: "Computer",
            description: "Lenovo T420s",
            minBid: 2,
            bidEnd: AUCTION_END_TIME
        }
    ];

    it("Multiple auctions can be deployed, bet on, and closed once they've expired", async function() {
        // Create auction listings
        items.forEach(async function (item) {
            let txReceipt = await contractInstance.newAuction(
                                    item.name,
                                    item.description,
                                    item.minBid,
                                    item.bidEnd);
            assert.equal(txReceipt.logs[0].event, "AuctionCreated", "Creating new auction didn't trigger AuctionCreated event");
            item.listingAddress = txReceipt.logs[0].args.auction;
        });

        // Validate auctions were created
        let liveAuctionCount = await contractInstance.liveAuctions.call();
        assert.equal(items.length.valueOf(), liveAuctionCount.valueOf(), "Number of live auctions should match number of items for listing");
        let totalAuctionCount = await contractInstance.auctionCount.call();
        assert.equal(totalAuctionCount.valueOf(), liveAuctionCount.valueOf(), "Number of live auctions should match total number of auctions");
   
        // Bid on each auction, where bid > min bid
        items.forEach(async function (item) {
            console.log(
                "Bidder " + bidder.name + 
                " bidding " + web3.fromWei(bidder.bidAmount) + 
                " on item " + item.name + 
                " with description " + item.description
            );
            let txReceipt = await contractInstance.placeBid(
                                    item.listingAddress,
                                    { from: bidder.address, value: bidder.bidAmount }
                                );
            let balance = await web3.eth.getBalance(item.listingAddress);
            assert.equal(
                web3.fromWei(bidder.bidAmount).toString(), web3.fromWei(balance).toString(), "Listing balance doesn't reflect bid amount"
            );
        });

        console.log("Waiting for auctions to expire...");
        await timeout(AUCTION_END_TIME * 1000); // ms
        console.log("Wait completed");
        
        // Force a block to be mined so that block.timestamp will be updated
        console.log("Forcing block to be mined...");
        await forceMine();
        console.log("Block mined!");

        // Verify all auctions are expired
        expiredAuctionCount = await contractInstance.expiredAuctions.call();
        assert.equal(expiredAuctionCount.valueOf(), items.length.valueOf(), "Expired auction count doesn't equal all items listed");

        // Close all auctions
        await contractInstance.closeExpiredAuctions();
        auctionCount = await contractInstance.auctionCount.call();
        assert.equal(auctionCount.valueOf(), 0, "All auctions haven't been closed");
    });
});