// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract v1Contract is Initializable {

    uint256 public value;
    address public owner;

    function initialize(uint256 _val) external initializer {
        value = _val;
        owner = msg.sender;
    }

    function set(uint256 _val) external {
        value = _val;
    }
}
