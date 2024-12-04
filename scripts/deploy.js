const hre = require("hardhat");

const v1ContractAddress="0xA9f3458e3fCC5797ac9eDAc6FA8fDfCaa5fbB278";
const v2ContractAddress="0x4eF861C40Fd03C33715A7f803CC51eF62434bE86";
const v3ContractAddress="0x2aD7D0c1B34374c4B3cAca60Cd27F3eA647D2074";
const beaconAddress="0x16134a151e8DC5536db8e116719D89d5695cF20c";
const accountFactoryAddress="0xa6b169Fa230f1e211F033888BaE0CDCFE3356743";

async function main() {
  // Deploy the v1 contract
  // const v1Contract = await hre.ethers.deployContract("v1Contract");
  // await v1Contract.waitForDeployment();
 
  // Deploy the v2 contract
  // const v2Contract = await hre.ethers.deployContract("v2Contract");
  // await v2Contract.waitForDeployment();

    // Deploy the v2 contract
    const v3Contract = await hre.ethers.deployContract("v3Contract");
    await v3Contract.waitForDeployment();

  // Deploy the beacon contract
  // const beacon = await hre.ethers.deployContract("SimpleAccountBeacon",[v1Contract.target]);
  // await beacon.waitForDeployment();

  // Deploy the accounFactory contract
  // const AccountFactory = await hre.ethers.deployContract("FactoryContract",[beacon.target]);
  // await AccountFactory.waitForDeployment();

  // Log the deployed contract address
  // console.log("Deployed v1Contract to:", v1Contract.target);
  // console.log("Deployed V2contract to:",v2Contract.target);
  console.log("Deployed V3contract to:",v3Contract.target);
  // console.log("Deployed beacon to:", beacon.target);
  // console.log("Deployed AccountFactory to:", AccountFactory.target);
}

// Run the main function and catch any errors
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
