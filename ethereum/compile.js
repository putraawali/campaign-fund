const path = require("path");
const fs = require("fs-extra");
const solc = require("solc");

const campaignPath = path.resolve(__dirname, "contracts", "Campaign.sol");
const source = fs.readFileSync(campaignPath, "utf8");

const input = {
    language: "Solidity",
    sources: {
        "Campaign.sol": {
            content: source,
        },
    },
    settings: {
        optimizer: {
            enabled: true,
            runs: 200,
        },
        outputSelection: {
            "*": {
                "*": ["*"],
            },
        },
    },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

const contract = output.contracts["Campaign.sol"];

const factoryContract = contract["Factory"];
const campaignContract = contract["DonationCampaign"];

const factoryBuildPath = path.resolve(__dirname, "build", "Factory.json");
const campaignBuildPath = path.resolve(__dirname, "build", "Campaign.json");

if (!fs.existsSync(path.resolve(__dirname, "build"))) {
    fs.mkdirSync(path.resolve(__dirname, "build"));
}

fs.writeJsonSync(
    factoryBuildPath,
    {
        abi: factoryContract.abi,
        evm: factoryContract.evm,
    },
    {
        spaces: 2,
    }
);

fs.writeJsonSync(
    campaignBuildPath,
    {
        abi: campaignContract.abi,
        evm: campaignContract.evm,
    },
    {
        spaces: 2,
    }
);
