const hre = require("hardhat");

const v1Contract = "0x87CB24F96D0Cd2496208d3a0980008c54b08B5f2";
const beacon = "0x226f8A13B66e79f8d51BB7BD231bb8e9A8829DB1";
const AccountFactory = "0x6edC2BBB344225A86a7940C02FFad62a0776737E";

async function main() {
  // Deploy the v1 contract
  const v1Contract = await hre.ethers.deployContract("LouiceAccount");
  await v1Contract.waitForDeployment();
 
  // Deploy the v2 contract
  // const v2Contract = await hre.ethers.deployContract("v2Contract");
  // await v2Contract.waitForDeployment();

    // Deploy the v3 contract
    // const v3Contract = await hre.ethers.deployContract("v3Contract");
    // await v3Contract.waitForDeployment();

  // Deploy the v3 contract
  // const v4Contract = await hre.ethers.deployContract("v4Contract");
  // await v4Contract.waitForDeployment();

  // Deploy the beacon contract
  const beacon = await hre.ethers.deployContract("SimpleAccountBeacon",[v1Contract.target]);
  await beacon.waitForDeployment();

  // Deploy the accounFactory contract
  const AccountFactory = await hre.ethers.deployContract("FactoryContract",[beacon.target]);
  await AccountFactory.waitForDeployment();

  // Log the deployed contract address
  console.log("Deployed v1Contract to:", v1Contract.target);
  // console.log("Deployed V2contract to:",v2Contract.target);
  // console.log("Deployed V4contract to:", v4Contract.target);
  console.log("Deployed beacon to:", beacon.target);
  console.log("Deployed AccountFactory to:", AccountFactory.target);
}

// Run the main function and catch any errors
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
