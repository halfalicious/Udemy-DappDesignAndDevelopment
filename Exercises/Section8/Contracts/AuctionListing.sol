//
// Simple auction smart contract for section 8 project 1 of the Udemy class
// "Ethereum: Decentralized Application Design & Development".
//
//      https://www.udemy.com/ethereum-dapp/learn/v4/t/lecture/6979728?start=0
//
pragma solidity ^0.4.13;

contract AuctionListing {
    modifier ownerOnly {
        require(msg.sender == auctionHouseOwner_ ||
                msg.sender == auctionOwner_);
        _;
    }

    function AuctionListing(string itemName, string itemDescription, uint minBid, uint endTime) public {
        itemName_ = bytes(itemName);
        itemDescription_ = bytes(itemDescription);
        minBid_ = minBid;
        endTime_ = now + endTime;
        auctionOwner_ = msg.sender;
        auctionHouseOwner_ = tx.origin;

        contractAddress = this;
    }

    function placeBid() payable public returns (bool highBid) {
        require(now < endTime_);
        require(msg.value >= minBid_);

        uint totalBids = bids_[tx.origin];
        totalBids += msg.value;
        bids_[tx.origin] = totalBids;

        // Check for new high bidder
        if (msg.value > bids_[highBidder_]) {
            highBidder_ = tx.origin;
            highBidAmount_ = msg.value;
            highBid = true;
            HighBid(highBidder_, highBidAmount_);
        } else {
            highBid = false;
            BidFailed(tx.origin, msg.value);
        }
    }

    function claimBidAmount() public returns (bool bidFound) {
        bidFound = false;
        uint bidAmount = bids_[tx.origin];
        if (bidAmount > 0) {
            bidFound = true;
            uint amountToRefund = bidAmount;
            if (tx.origin == highBidder_) {
                amountToRefund -= highBidAmount_;
            }
            bids_[tx.origin] = bidAmount - amountToRefund;
            tx.origin.transfer(amountToRefund);
        }
    }

    function bidEnd() ownerOnly public {
        require (now >= endTime_);
        selfdestruct(auctionOwner_);
    }

    function timeLeft() public constant returns (uint remaining) {
        if (endTime_ > now) {
            remaining = endTime_ - now;
        }
    }

    event HighBid(address indexed bidder, uint bidAmount);
    event BidFailed(address indexed bidder, uint bidAmount);

    mapping (address => uint) bids_;

    address highBidder_;
    uint highBidAmount_;

    // Required for factory access
    address public contractAddress;

    address auctionOwner_;
    address auctionHouseOwner_;

    // Auction metadata
    bytes itemName_;
    bytes itemDescription_;
    uint minBid_;
    uint endTime_;
}
