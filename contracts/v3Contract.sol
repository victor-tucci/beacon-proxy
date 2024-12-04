// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract v3Contract is Initializable {
    uint256 public value;
    address public owner;
    uint256 public valuePluss; // New state variable added
    uint256 public valueMull; // New state variable added

    // Initialization function for beacon proxies
    function initialize(uint256 _val) external initializer {
        value = _val;
        owner = msg.sender;
    }

    // Existing function with added functionality
    function set(uint256 _val) external {
        value = _val;
        valuePluss = _val + 100;
        valueMull = _val * 2;
    }

    // New function added in v2
    function setPlus(uint256 _val) external {
        valuePluss = _val + 100;
    }

    // New function added in v3
    function setMul(uint256 _val) external {
        valueMull = _val * 2;
    }
}
