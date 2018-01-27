# Udemy-DappDesignAndDevelopment-Section7-Solidity
This repo contains my coding exercise solutions and final project for Section 7 ("Ethereum smart contract development using Solidity") of the Udemy class "Ethereum: Decentralized Application Design and Development" (https://www.udemy.com/ethereum-dapp/learn/v4/content). The goal of the section is to implement a simple betting smart contract, with each exercise being targeted at a specific concept (e.g. exercise 4 covers enums/mappings/structs) and the final project putting everything together and enabling user interaction via a web interface. All smart contracts are written in Solidity and all tests are written for the Truffle automated test framework. The web interface is written in HTML/CSS/JS and JS interacts with the Ethereum blockchain via the Web3 JavaScript APIs.

CODING EXERCISES
There's 1 smart contract for each coding exercise (starting with exercise 3: "Global Variables") and associated Truffle tests. I've also checked in the Truffle deployment file since the tests depend on the smart contracts being deployed with specific constructor argument values. 

All of the tests have been successfully run (i.e. tests complete and pass) via Truffle 3.4.7 against TestRPC. 

The tests require NodeJS, Truffle, and TestRPC (which is included with Truffle). 

FINAL PROJECT
There's 1 smart contract file, 1 JavaScript file (containing the Web3 calls and supporting code for interacting with the contract and updating the UI), 1 HTML file, and 1 CSS file. I've tested the smart contract both by deploying it via Remix and Web3 and interacting with it via the web UI. I deployed the web UI portion of the project locally using NodeJS, Yeoman, the Yeoman WebApp generator, Gulp, and Bower.
