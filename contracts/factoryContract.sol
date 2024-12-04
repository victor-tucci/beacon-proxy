// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/utils/Create2.sol";

contract FactoryContract {
    address public immutable beacon; // The beacon contract managing the implementation address
    uint256 public salt = 15; // Default salt value for Create2 deployments

    event WalletCreated(address indexed proxy, address indexed owner);

    constructor(address _beaconAddress) {
        require(_beaconAddress != address(0), "Invalid beacon address");
        beacon = _beaconAddress;
    }

    /**
     * @dev Deploys a Beacon Proxy deterministically using Create2.
     * @param _owner The owner of the new v1Contract.
     * @param _value The initial value to initialize in the proxy.
     * @return proxy The address of the deployed Beacon Proxy.
     */
    function createWallet(address _owner, uint256 _value) external returns (address proxy) {
        require(_owner != address(0), "Owner cannot be zero address");

        address predictedAddress = getAddress(_owner, _value);

        // Check if the address is already deployed
        uint256 codeSize = predictedAddress.code.length;
        if (codeSize > 0) {
            return predictedAddress;
        }

        // Deploy the proxy deterministically using Create2
        proxy = Create2.deploy(
            0, // No ETH needed for deployment
            bytes32(salt),
            abi.encodePacked(
                type(BeaconProxy).creationCode,
                abi.encode(
                    address(beacon), // Address of the beacon contract
                    abi.encodeWithSelector(
                        bytes4(keccak256("initialize(uint256)")),
                        _value // Initialize the proxy with the initial value
                    )
                )
            )
        );

        emit WalletCreated(proxy, _owner);
    }

    /**
     * @dev Computes the deterministic address for the Beacon Proxy.
     * @param _owner The owner of the wallet.
     * @param _value The initial value for initialization.
     * @return The address where the proxy will be deployed.
     */
    function getAddress(address _owner, uint256 _value) public view returns (address) {
        require(_owner != address(0), "Owner cannot be zero address");

        return Create2.computeAddress(
            bytes32(salt),
            keccak256(
                abi.encodePacked(
                    type(BeaconProxy).creationCode,
                    abi.encode(
                        address(beacon),
                        abi.encodeWithSelector(
                            bytes4(keccak256("initialize(uint256)")),
                            _value
                        )
                    )
                )
            )
        );
    }
}
