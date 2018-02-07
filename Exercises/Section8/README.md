Section 8 covers smart contract design patterns. The coding exercise smart contracts implement a simple auction and auction factory (the auction factory naturally implements the factory design pattern)

Note that no Truffle deployment file is required for these tests since the tests use Truffle's beforeEach hook to deploy a new clean contract instance with the desired constructor argument values before each test is run.
