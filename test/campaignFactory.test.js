const assert = require("assert");
const ganache = require("ganache");
const { Web3 } = require("web3");
const web3 = new Web3(ganache.provider());

const { abi, evm } = require("../ethereum/build/Factory.json");
// const { abi, evm } = require("../ethereum/compile");

let factory;
let accounts;

beforeEach(async () => {
    // Get list of all accounts
    accounts = await web3.eth.getAccounts();
    let bytecode = evm.bytecode.object;

    // Deploy the contract
    factory = await new web3.eth.Contract(abi)
        .deploy({
            data: bytecode,
        })
        .send({ from: accounts[0], gas: "1000000" });
});

describe("Verify deploying factory", async () => {
    it("deploy factory", async () => {
        assert.ok(factory.options.address, "contract not deployed yet!");
    });
});

describe("Test deploy new campaign", async () => {
    it("Create new campaign", async () => {
        try {
            await factory.methods.createCampaign(100000).send({
                from: accounts[0],
                gas: "1000000",
            });
        } catch (error) {
            assert(false, error.message);
        }

        try {
            let deployedCampaigns = await factory.methods
                .getDeployedCampaigns()
                .call();
            assert(deployedCampaigns.length > 0, "No campaign deployed");
        } catch (error) {
            console.log(error);
            assert(false, error.message);
        }
    });
});
