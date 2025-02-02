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
        outputSelection: {
            "*": {
                "*": ["*"],
            },
        },
    },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

const campaignFactoryContract =
    output.contracts["Campaign.sol"]["CampaignFactory"];
const campaignContract = output.contracts["Campaign.sol"]["DonationCampaign"];

const campaignFactoryBuildPath = path.resolve(
    __dirname,
    "build",
    "CampaignFactory.json"
);
const campaignBuildPath = path.resolve(__dirname, "build", "Campaign.json");

if (!fs.existsSync(path.resolve(__dirname, "build"))) {
    fs.mkdirSync(path.resolve(__dirname, "build"));
}

fs.writeJsonSync(
    campaignFactoryBuildPath,
    {
        abi: campaignFactoryContract.abi,
        evm: campaignFactoryContract.evm,
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
