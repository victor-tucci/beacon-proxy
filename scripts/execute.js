const { ethers } = require("hardhat");

const accountFactoryAddress = "0xa6b169Fa230f1e211F033888BaE0CDCFE3356743";
const v1ContractProxyAddress="0x23896D3869c7006af06B2134798E61eF21F98A85";

async function main() {
  const ownerAddress = "0xb87a472325C42BfC137499539C1A966Bce9ce10A"; // Replace with the owner's address
  const initialValue = 20;

  const FContract = await ethers.getContractAt("FactoryContract", accountFactoryAddress);
  const proxyContract = await ethers.getContractAt("v1Contract", v1ContractProxyAddress);

  // Debugging: Print salt
  const salt = await FContract.salt();
  console.log("Salt from FactoryContract:", salt.toString());

  // Debugging: Call getAddress
  const predictedAddress = await FContract.getAddress(ownerAddress, initialValue);
  console.log("Predicted Address from FactoryContract:", predictedAddress);

  // Ensure correct inputs for Create2.deploy
  console.log("Beacon Address:", await FContract.beacon());

  console.log("value of proxy",await proxyContract.value());
  
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
