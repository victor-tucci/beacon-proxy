// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleAccountBeacon is Ownable, UpgradeableBeacon  {
    constructor(address initialImplementation) UpgradeableBeacon(initialImplementation) {
        // Transfer ownership of the beacon to the deployer (or another admin)
        transferOwnership(msg.sender);
    }

    /**
     * @dev Update the implementation contract to a new address.
     * Only callable by the owner.
     */
    function upgradeImplementation(address newImplementation) external onlyOwner {
        upgradeTo(newImplementation);
    }
}
