// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Script } from "forge-std/Script.sol";
import { Donate } from "../src/Donate.sol";

/// @title Deploy Donate
/// @notice Broadcasts Donate with `OWNER` from the environment. Does not use `msg.sender` as owner.
contract Deploy is Script {
    function run() external returns (Donate donate) {
        address owner_ = vm.envAddress("OWNER");
        vm.startBroadcast();
        donate = new Donate(owner_);
        vm.stopBroadcast();
    }
}
