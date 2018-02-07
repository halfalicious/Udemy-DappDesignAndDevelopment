//
// Simple auction factory smart contract which implements the factory design pattern
// for section 8 project 1 of the Udemy class "Ethereum: Decentralized Application Design & Development".
//
//      https://www.udemy.com/ethereum-dapp/learn/v4/t/lecture/6979728?start=0
//

pragma solidity ^0.4.13;

import "./AuctionListing.sol";

contract AuctionListingFactory {
    modifier ownerOnly {
        require (msg.sender == owner);
        _;
    }

    event AuctionCreated(address indexed auction);
    event AuctionClosed(address indexed auction);

    function AuctionListingFactory () public {
        owner = msg.sender;
    }

    function newAuction(string name, string description, uint startingBid, uint endTime) public returns (address auctionListing_) {
        require(endTime > 0);

        AuctionListing auctionListing = new AuctionListing(name, description, startingBid, endTime);
        AuctionEntry storage auctionEntry = auctions[auctionListing.contractAddress()];
        auctionEntry.auctionListing = auctionListing;        
        auctionAddresses.push(auctionListing.contractAddress());
        auctionEntry.index = auctionAddresses.length - 1;
        auctions[auctionListing.contractAddress()] = auctionEntry;

        auctionListing_ = auctionListing;

        AuctionCreated(auctionListing);
    }

    //
    // Bidding functions
    //
    function placeBid(address auctionAddress) payable public returns (bool highBid) {
        require(auctions[auctionAddress].auctionListing.contractAddress() > 0);
        return auctions[auctionAddress].auctionListing.placeBid.value(msg.value)();
    }

    function bidEnd(address auctionAddress) public {
        require(auctions[auctionAddress].auctionListing.contractAddress() > 0);
        auctions[auctionAddress].auctionListing.bidEnd();
    }

    function claimBid(address auctionAddress) public returns (bool bidFound) {
        require(auctions[auctionAddress].auctionListing.contractAddress() > 0);
        return auctions[auctionAddress].auctionListing.claimBidAmount();
    }

    //
    // Auction removal
    //
    function closeExpiredAuctions() ownerOnly public {
        uint expiredAuctionCount = expiredAuctions();
        uint i = 0;
        while (expiredAuctionCount > 0) {
            AuctionListing auctionListing = auctions[auctionAddresses[i]].auctionListing;
            if (auctionListing.timeLeft() == 0) {
                removeAuction(auctionAddresses[i]);
                expiredAuctionCount--;
            } else {
                i++;
            }
        }
    }

    function removeAuction(address contractAddress) ownerOnly private {
        AuctionEntry storage auctionEntry = auctions[contractAddress];
        if (auctionAddresses.length > 1) {
            for (uint i = auctionEntry.index; i < auctionAddresses.length - 1; i++) {
                auctionAddresses[i] = auctionAddresses[i + 1];
            }
        }
        delete auctionAddresses[auctionAddresses.length - 1];
        auctionAddresses.length--;
        delete auctions[contractAddress];
        AuctionClosed(contractAddress);
    }

    //
    // Auction count getters
    //
    function auctionCount() ownerOnly constant public returns (uint) {
        return auctionAddresses.length;
    }

    function expiredAuctions() ownerOnly constant public returns (uint) {
        uint expiredAuctionCount = 0;
        for (uint i = 0; i < auctionAddresses.length; i++) {
            AuctionListing auctionListing = auctions[auctionAddresses[i]].auctionListing;
            if (auctionListing.timeLeft() == 0) {
                expiredAuctionCount++;
            }
        }
        return expiredAuctionCount;
    }

    function liveAuctions() ownerOnly constant public returns (uint) {
        uint liveAuctionCount = 0;
        for (uint i = 0; i < auctionAddresses.length; i++) {
            AuctionListing auctionListing = auctions[auctionAddresses[i]].auctionListing;
            if (auctionListing.timeLeft() > 0) {
                liveAuctionCount++;
            }
        }
        return liveAuctionCount;
    }

    struct AuctionEntry {
        AuctionListing auctionListing;
        uint index;
    }

    // Iterator pattern
    mapping (address => AuctionEntry) auctions;
    address[] auctionAddresses;
    
    // Auction factory owner
    address owner;
}

