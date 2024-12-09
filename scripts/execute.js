const { ethers } = require("hardhat");

const v1Contract = "0x87CB24F96D0Cd2496208d3a0980008c54b08B5f2";
const beacon = "0x226f8A13B66e79f8d51BB7BD231bb8e9A8829DB1";
const AccountFactory = "0x6edC2BBB344225A86a7940C02FFad62a0776737E";

async function main() {
  const ENTRYPOINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
  const VERIFIERADDRESS = "0xa03603F1966d8AAE2b4528bC7946510F6EB79A22";
  const passkeyId = "0x3418496f23a78342484069c35e27e5677f302dbff64043940a6441f6506ccb0576528090b54403c3386bc25eefbe75563491fe3d888dfbf4c018b38f74dd3a000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000001b53714763434755646b6a462d4d5a6c646a43576a386767676c68630000000000";
  const rawId = "SqGcCGUdkjF-MZldjCWj8ggglhc";

  // Get FactoryContract instance
  const FContract = await ethers.getContractAt("FactoryContract", AccountFactory);

  // Retrieve salt from FactoryContract
  const salt = await FContract.salt();
  console.log("Salt from FactoryContract:", salt);

  // Compute predicted proxy address
  const predictedAddress = await FContract.getAddress(
    ENTRYPOINT_ADDRESS,
    VERIFIERADDRESS,
    passkeyId
  );
  console.log("Predicted proxy address:", predictedAddress);

  // Deploy proxy (if necessary)
  console.log("Deploying proxy...");
  const tx = await FContract.createWallet(
    ENTRYPOINT_ADDRESS,
    VERIFIERADDRESS,
    passkeyId,
    rawId
  );
  const receipt = await tx.wait();
  console.log("Proxy deployed at:", receipt);

  // Verify deployment matches prediction
  if (receipt.logs[0].address.toLowerCase() === predictedAddress.toLowerCase()) {
    console.log("Success! Deployed address matches predicted address.");
  } else {
    console.error(
      "Error: Deployed address does not match predicted address. Check parameters."
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
