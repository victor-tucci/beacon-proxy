// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

import "@account-abstraction/contracts/core/BaseAccount.sol";
import "./TokenCallbackHandler.sol";

contract LouiceAccount is BaseAccount, TokenCallbackHandler, Initializable {
    using ECDSA for bytes32;

    struct PassKeyId {
        uint256 pubKeyX;
        uint256 pubKeyY;
        string keyId;
    }
    PassKeyId public passkey;

    address public verifierAddress;  // have to call when at the initialization process at the time of proxy generation

    IEntryPoint private _entryPoint;

    event LouiceAccountInitialized(IEntryPoint indexed entryPoint, PassKeyId indexed passKeyId);

    /// @inheritdoc BaseAccount
    function entryPoint() public view virtual override returns (IEntryPoint) {
        return _entryPoint;
    }


    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    function initialize(IEntryPoint anEntryPoint, address _verifierAddress, bytes memory _passkeyId) external initializer {
        _entryPoint = anEntryPoint;
        verifierAddress = _verifierAddress;
        _initializeKeys(_passkeyId);
    }

    /**
     * execute a transaction (called directly from owner, or by entryPoint)
     */
    function execute(address dest, uint256 value, bytes calldata data, address approveToken, bytes calldata approveData) external {
        _requireFromEntryPoint();
        _call(dest, value, data);
        //Todo - have to add the verification for erc20 availability
        if(approveToken != 0x0000000000000000000000000000000000000000){
            _call(approveToken, 0, approveData);
        }
    }

    /**
     * execute a sequence of transactions
     */
    function executeBatch(address[] calldata dest, bytes[] calldata func) external {
        _requireFromEntryPoint();
        require(dest.length == func.length, "wrong array lengths");
        for (uint256 i = 0; i < dest.length; i++) {
            _call(dest[i], 0, func[i]);
        }
    }

    
    function _initializeKeys(bytes memory _passkeyId) internal {
        (uint256 pubKeyX, uint256 pubKeyY, string memory keyId) = abi.decode(_passkeyId,(uint256,uint256,string));
        passkey = PassKeyId(pubKeyX, pubKeyY, keyId);

        emit LouiceAccountInitialized(_entryPoint, passkey);
    }

    /// implement template method of BaseAccount
    function _validateSignature(UserOperation calldata userOp, bytes32 userOpHash)
    internal override virtual returns (uint256 validationData) {
         // Encode the function call with the updated UserOperation struct
        bytes memory data = abi.encodeWithSignature(
            "validateUserOp((address,uint256,bytes,bytes,uint256,uint256,uint256,uint256,uint256,bytes,bytes),bytes32,uint256[2])",
            userOp,
            userOpHash,
            [passkey.pubKeyX,passkey.pubKeyY]
        );
          // Perform the staticcall
        (bool success, bytes memory result) = verifierAddress.staticcall(data);

        // Check if the call succeeded
        require(success, "Static call to validateUserOp failed");

        // Decode and return the result
        return abi.decode(result, (uint256)); 
    }

    function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value : value}(data);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    /**
     * check current account deposit in the entryPoint
     */
    function getDeposit() public view returns (uint256) {
        return entryPoint().balanceOf(address(this));
    }

    /**
     * deposit more funds for this account in the entryPoint
     */
    function addDeposit() public payable {
        entryPoint().depositTo{value : msg.value}(address(this));
    }

    /**
     * withdraw value from the account's deposit
     * @param withdrawAddress target to send to
     * @param amount to withdraw
     */
    function withdrawDepositTo(address payable withdrawAddress, uint256 amount) public {  // remove the only owner concept
        _requireFromEntryPoint();
        entryPoint().withdrawTo(withdrawAddress, amount);
    }

}