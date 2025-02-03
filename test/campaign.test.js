const assert = require("assert");
const ganache = require("ganache");
const { Web3 } = require("web3");
const web3 = new Web3(ganache.provider());

const { abi, evm } = require("../ethereum/build/Campaign.json");

let campaign;
let accounts;

beforeEach(async () => {
    // Get list of all accounts
    accounts = await web3.eth.getAccounts();
    let bytecode = evm.bytecode.object;

    // Deploy the contract
    campaign = await new web3.eth.Contract(abi)
        .deploy({
            data: bytecode,
            arguments: [web3.utils.toWei("0.0001", "ether"), accounts[0]],
        })
        .send({ from: accounts[0], gas: "1000000" });
});

describe("Verify deployment contract", async () => {
    it("deploy campaign", async () => {
        assert.ok(campaign.options.address, "contract not deployed yet!");
    });
});

describe("Test contribute method", async () => {
    it("Success contribute", async () => {
        try {
            await campaign.methods.contribute().send({
                from: accounts[1],
                value: web3.utils.toWei("0.001", "ether"),
            });
        } catch (error) {
            assert(false, error.message);
        }
    });

    it("Failed: Not reaching out the minimum contribution amount", async () => {
        try {
            await campaign.methods.contribute().send({
                from: accounts[1],
                value: web3.utils.toWei("0.001", "ether"),
            });
            assert(false, "Should be error");
        } catch (error) {
            assert.ok(error, "Should be not error");
        }
    });
});

describe("Test createRequest method", async () => {
    it("Success create request", async () => {
        try {
            await campaign.methods
                .createRequest("Test description", 0, accounts[2])
                .send({
                    from: accounts[0],
                    gas: "1000000",
                });
        } catch (error) {
            assert(false, error);
        }
    });

    it("Failed: Unsufficient funds", async () => {
        try {
            await campaign.methods
                .createRequest(
                    "Test description",
                    "10000000000000000000",
                    accounts[2]
                )
                .send({
                    from: accounts[0],
                });
            assert(false, "Should be error");
        } catch (error) {
            assert.ok(error, "Should be not error");
        }
    });

    it("Failed: Manager can't be the recipitient", async () => {
        try {
            await campaign.methods.contribute().send({
                from: accounts[1],
                value: web3.utils.toWei("0.01", "ether"),
            });

            await campaign.methods
                .createRequest("Test description", "0", accounts[0])
                .send({
                    from: accounts[0],
                });
            assert(false, "Should be error");
        } catch (error) {
            assert.ok(error, "Should be not error");
        }
    });

    it("Failed: Manager access only", async () => {
        try {
            await campaign.methods
                .createRequest("Test description", "0", accounts[3])
                .call({
                    from: accounts[1],
                });
            assert(false, "Should be error");
        } catch (error) {
            assert.ok(error, "Should be not error");
        }
    });
});

describe("Test approveRequest method", async () => {
    it("Success approve request", async () => {
        try {
            await campaign.methods.contribute().send({
                from: accounts[1],
                value: web3.utils.toWei("0.001", "ether"),
            });
        } catch (error) {
            assert(false, "Should be not error when contribute");
        }

        try {
            await campaign.methods
                .createRequest(
                    "Test description",
                    web3.utils.toWei("0.00001", "ether"),
                    accounts[2]
                )
                .send({
                    from: accounts[0],
                    gas: "1000000",
                });

            await campaign.methods.approveRequest(0, true).send({
                from: accounts[1],
            });
        } catch (error) {
            assert(false, error.message);
        }
    });

    it("Failed: Sender not contributed yet to campaign", async () => {
        try {
            await campaign.methods.contribute().send({
                from: accounts[1],
                value: web3.utils.toWei("0.001", "ether"),
            });
        } catch (error) {
            assert(false, "Should be not error when contribute");
        }

        try {
            await campaign.methods
                .createRequest(
                    "Test description",
                    web3.utils.toWei("0.00001", "ether"),
                    accounts[2]
                )
                .send({
                    from: accounts[0],
                    gas: "1000000",
                });

            await campaign.methods.approveRequest(0, true).send({
                from: accounts[3],
            });
            assert(false, "Should be error");
        } catch (error) {
            assert.ok(error, "Should be error");
        }
    });

    it("Failed: sender already approve the request", async () => {
        try {
            await campaign.methods.contribute().send({
                from: accounts[1],
                value: web3.utils.toWei("0.001", "ether"),
            });
        } catch (error) {
            assert(false, "Should be not error when contribute");
        }

        try {
            await campaign.methods
                .createRequest(
                    "Test description",
                    web3.utils.toWei("0.00001", "ether"),
                    accounts[2]
                )
                .send({
                    from: accounts[0],
                    gas: "1000000",
                });

            await campaign.methods.approveRequest(0, true).send({
                from: accounts[1],
            });

            await campaign.methods.approveRequest(0, true).send({
                from: accounts[1],
            });
            assert(false, "Should be error");
        } catch (error) {
            assert.ok(error, "Should be error");
        }
    });
});

describe("Test finalizeRequest method", async () => {
    it("Success finalize request", async () => {
        try {
            await campaign.methods.contribute().send({
                from: accounts[1],
                value: web3.utils.toWei("0.001", "ether"),
            });

            await campaign.methods
                .createRequest(
                    "Test description",
                    web3.utils.toWei("0.00001", "ether"),
                    accounts[2]
                )
                .send({
                    from: accounts[0],
                    gas: "1000000",
                });

            await campaign.methods.approveRequest(0, true).send({
                from: accounts[1],
            });

            await campaign.methods.finalizeRequest(0).send({
                from: accounts[0],
            });
        } catch (error) {
            assert(false, error.message);
        }
    });

    it("Failed: manager access only", async () => {
        try {
            await campaign.methods.contribute().send({
                from: accounts[1],
                value: web3.utils.toWei("0.001", "ether"),
            });

            await campaign.methods
                .createRequest(
                    "Test description",
                    web3.utils.toWei("0.00001", "ether"),
                    accounts[2]
                )
                .send({
                    from: accounts[0],
                    gas: "1000000",
                });

            await campaign.methods.approveRequest(0, true).send({
                from: accounts[1],
            });

            await campaign.methods.finalizeRequest(0).send({
                from: accounts[1],
            });
            assert(false, "Should be error");
        } catch (error) {
            assert.ok(error);
        }
    });

    it("Failed: less than 50% of contributors doesn't approve this request yet", async () => {
        try {
            await campaign.methods.contribute().send({
                from: accounts[1],
                value: web3.utils.toWei("0.001", "ether"),
            });

            await campaign.methods
                .createRequest(
                    "Test description",
                    web3.utils.toWei("0.00001", "ether"),
                    accounts[2]
                )
                .send({
                    from: accounts[0],
                    gas: "1000000",
                });

            await campaign.methods.finalizeRequest(0).send({
                from: accounts[0],
            });
            assert(false, "Should be error");
        } catch (error) {
            assert.ok(error);
        }
    });
});
