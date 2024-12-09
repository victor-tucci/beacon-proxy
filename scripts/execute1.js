const hre = require("hardhat");
const axios = require("axios");
const fs = require('fs');
// const { ethers } = require("ethers");

//new-passkey
const FACTORY_ADDRESS = "0x6edC2BBB344225A86a7940C02FFad62a0776737E";
const ERC20_contract = "0xF757Dd3123b69795d43cB6b58556b3c6786eAc13"

const second_address = "0xA69B64b4663ea5025549E8d7B90f167D6F0610B3"

const ENTRYPOINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const VERIFIERADDRESS = "0xa03603F1966d8AAE2b4528bC7946510F6EB79A22";
const passkeyId = "0xa31356f1d7fd1fe8d8d489b8133e842e0582585809f34f2cd1eba99ea5774481d1b2ffb315605224eb6247f68c38fdcfbe64be0f7ab9be24dc0dbf2e31d78c1b0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000001b5a74764558725f7070694d504b676e74774664563830315770426f0000000000";

const rawId = "ZtvEXr_ppiMPKgntwFdV801WpBo";
const pubkeyX ="0xa31356f1d7fd1fe8d8d489b8133e842e0582585809f34f2cd1eba99ea5774481";
const pubkeyY = "0xd1b2ffb315605224eb6247f68c38fdcfbe64be0f7ab9be24dc0dbf2e31d78c1b";

const IERC20_ABI = [
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address recipient, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

async function main() {

  const IERC20Interface = new ethers.Interface(IERC20_ABI);

  // Get the EntryPoint contract
  const EPoint = await hre.ethers.getContractAt("IEntryPoint", ENTRYPOINT_ADDRESS);
  // Get the AccountFactory contract
  const AFactory = await hre.ethers.getContractAt("FactoryContract",FACTORY_ADDRESS);
  
  // Use the function from the LouiceAccount
  const Account = await hre.ethers.getContractFactory("LouiceAccount");
  
  // Use the function from the accountFactory
  const AccountFactory = await hre.ethers.getContractFactory("FactoryContract");
  const [signer0] = await hre.ethers.getSigners();
  const address0 = await signer0.getAddress();
  console.log("address0",address0);
  // const address1 = await signer1.getAddress();

  // check with accountFactory function

  const senderAddress = await AFactory.getAddress(
    ENTRYPOINT_ADDRESS,
    VERIFIERADDRESS,
    passkeyId,
    rawId);
  console.log('senderAddress from accountFactory(getAddress) :', senderAddress);

  var initCode = FACTORY_ADDRESS + AccountFactory.interface.encodeFunctionData("createWallet", [
    ENTRYPOINT_ADDRESS,
    VERIFIERADDRESS,
    passkeyId,
    rawId]).slice(2);  // its for initial account deployment
  

  //construct data for the token transaction
  const data = IERC20Interface.encodeFunctionData("transfer", [second_address, 500000000 ]);
  // console.log({data});

  var sender ;
  try {
    await EPoint.getSenderAddress(initCode);
  }
  catch(Ex)
  {
    sender = ethers.getAddress("0x" + Ex.data.slice(-40));
  }
  console.log({ sender });

  const codeLength = await hre.ethers.provider.getCode(sender);
  if(codeLength != "0x")
  {
    initCode = "0x";
  }
  

  console.log("nounce",await EPoint.getNonce(sender, 0));
  const value = ethers.parseEther('0.003');
  console.log("value", value);
  console.log("initcode length:",initCode.length);

  const userOp = {
    sender,
    nonce:  "0x" + (await EPoint.getNonce(sender, 0)).toString(16),
    initCode,
    // callData: Account.interface.encodeFunctionData("execute",[ERC20_contract, 0, data, "0x0000000000000000000000000000000000000000", "0x"]),
    // callData:Account.interface.encodeFunctionData("execute",[ERC20_contract, 0, data, ERC20_contract, dummyTokenApprove]),
    callData:Account.interface.encodeFunctionData("execute",[second_address,value,"0x", "0x0000000000000000000000000000000000000000", "0x"]),
    // callData:"0x",
    // paymasterAndData: PAYMASTER_ADDRESS + "F756Dd3123b69795d43cB6b58556b3c6786eAc13010000671a219600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000013b5e557e4601a264c654f3f0235ed381fc08b5ffea980e403bc807e27433586b0eb1abe122723125fc4d62ef605943f53a0c87893af3cfd6d33c3924cb0a4328ab0da981c", // we're not using a paymaster, for now
    paymasterAndData:"0x",
    signature: "0x643b8c4c46aaaf54fce00b774621525d0ea6402f8a4d344c2d2fc196b32b26098cbfccc3d902a21f601349d5956c34b02d3845d101edaea23c6080ec0287ea2300000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000002549960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97631d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000247b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a22000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000037222c226f726967696e223a22687474703a2f2f6c6f63616c686f73743a35313733222c2263726f73734f726967696e223a66616c73657d000000000000000000", // we're not validating a signature, for now
  }

  const { preVerificationGas, verificationGasLimit, callGasLimit} =
  await ethers.provider.send("eth_estimateUserOperationGas", [
    userOp,
    ENTRYPOINT_ADDRESS,
  ]);

  userOp.preVerificationGas = preVerificationGas;
  userOp.verificationGasLimit = verificationGasLimit;
  userOp.callGasLimit = callGasLimit;


  var { maxFeePerGas } = await ethers.provider.getFeeData();
  userOp.maxFeePerGas = "0x" + maxFeePerGas.toString(16);

  const {maxPriorityFeePerGas} = await ethers.provider.send(
    "skandha_getGasPrice"
  );
  userOp.maxPriorityFeePerGas = userOp.maxFeePerGas;

  const userOpHash = await EPoint.getUserOpHash(userOp);
  // console.log({userOp});
  console.log({userOpHash});

  const jsonString = JSON.stringify(userOp, null, 2); // Pretty print with 2 spaces
  const fileName = 'data.json';
  fs.writeFileSync(fileName, jsonString, 'utf8');
  console.log(`JSON file "${fileName}" has been created successfully.`);

  const userOp2 ={
    sender: "0x233e467DC8b70aD5644B969e3aD407C909fEef43",
    nonce: "0x1",
    initCode: "0x",
    callData: "0x04e745be000000000000000000000000a69b64b4663ea5025549e8d7b90f167d6f0610b3000000000000000000000000000000000000000000000000000aa87bee53800000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    paymasterAndData: "0x",
    signature: "0x5fbe910a9bac5c335f4992b62c199dedd29c2fdc7b0350d8727eb8dce55a0eaf298884595b81b522012abfdc22b3e9a03a1657cffd92a1a91249128fd5e0aef200000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000002549960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97631d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000247b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a22000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000037222c226f726967696e223a22687474703a2f2f6c6f63616c686f73743a35313733222c2263726f73734f726967696e223a66616c73657d000000000000000000",
    preVerificationGas: "0x1074c",
    verificationGasLimit: "0x85d35",
    callGasLimit: "0xdcb7",
    maxFeePerGas: "0xee451b673",
    maxPriorityFeePerGas: "0xee451b673"
  }
  console.log({userOp2});

  // Send the user operation to the bundler
  const opHash = await ethers.provider.send("eth_sendUserOperation", [
    userOp2,
    ENTRYPOINT_ADDRESS,
  ]);
  console.log("User Operation Hash:", opHash);
  
  async function getUserOperationByHash(opHash, delay = 2000) {
    for (let i = 0; true; i++) {
      const result = await ethers.provider.send("skandha_userOperationStatus", [opHash]);
      // console.log("User Operation Hash:", result);
      if (!(result === null) && result.status) {
        if (['Cancelled', 'Reverted'].includes(result.status)) {
          handleError(`Transaction is ${result.status}. Try again later.`);
          return;
        }

        if (result.status === 'OnChain') {
            console.log('Transaction completed successfully.');
            return result.transaction;
        }
      }
  
      // Wait for a specified delay before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  try {
    const transactionHash = await getUserOperationByHash(opHash);
    console.log("transaction hash:", transactionHash);
    // const tx = await EPoint.handleOps([userOp], address0)
    // const receipt = await tx.wait();
    // console.log("receipt:", receipt);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the main function and catch any errors
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
