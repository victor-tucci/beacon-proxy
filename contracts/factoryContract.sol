// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/utils/Create2.sol";

contract FactoryContract {
    address public immutable beacon; // The beacon contract managing the implementation address
    string public salt = "LouiceWallet"; // Default salt value for Create2 deployments
    mapping (string => address) public userAddress;

    event WalletCreated(address indexed proxy, bytes indexed _passkeyId);

    constructor(address _beaconAddress) {
        require(_beaconAddress != address(0), "Invalid beacon address");
        beacon = _beaconAddress;
    }

    /**
     * @dev Deploys a Beacon Proxy deterministically using Create2.
     * @param _entrypoint The entrypoint of the new LouiceAccount.
     * @param _verifier The verifier of the new LouiceAccount.
     * @param _passkeyId The publickeys of the proxy wallet.
     * @return proxy The address of the deployed Beacon Proxy.
     */
    function createWallet(address _entrypoint, address _verifier, bytes memory _passkeyId, string memory rawId) external returns (address proxy) {
        require(((_entrypoint != address(0)) && (_verifier != address(0))), "_entrypoint and _verifier cannot be zero address");

        address predictedAddress = getAddress(_entrypoint,_verifier, _passkeyId);

        // Check if the address is already deployed
        uint256 codeSize = predictedAddress.code.length;
        if (codeSize > 0) {
            return predictedAddress;
        }

        // Deploy the proxy deterministically using Create2
        proxy = Create2.deploy(
            0, // No ETH needed for deployment
            keccak256(abi.encodePacked(salt)),
            abi.encodePacked(
                type(BeaconProxy).creationCode,
                abi.encode(
                    address(beacon), // Address of the beacon contract
                    abi.encodeWithSelector(
                        bytes4(keccak256("initialize(address,address,bytes)")),
                            _entrypoint,
                            _verifier,
                            _passkeyId
                    )
                )
            )
        );

        userAddress[rawId] = proxy;
        emit WalletCreated(proxy, _passkeyId);
    }

    /**
     * @dev Computes the deterministic address for the Beacon Proxy.
     * @param _entrypoint The entrypoint of the new LouiceAccount.
     * @param _verifier The verifier of the new LouiceAccount.
     * @param _passkeyId The publickeys of the proxy wallet.
     * @return The address where the proxy will be deployed.
     */
    function getAddress(address _entrypoint, address _verifier, bytes memory _passkeyId) public view returns (address) {
        require(((_entrypoint != address(0)) && (_verifier != address(0))), "_entrypoint and _verifier cannot be zero address");

        return Create2.computeAddress(
            keccak256(abi.encodePacked(salt)),
            keccak256(
                abi.encodePacked(
                    type(BeaconProxy).creationCode,
                    abi.encode(
                        address(beacon),
                        abi.encodeWithSelector(
                            bytes4(keccak256("initialize(address,address,bytes)")),
                            _entrypoint,
                            _verifier,
                            _passkeyId
                        )
                    )
                )
            )
        );
    }
}
