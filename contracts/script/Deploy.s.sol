// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Script } from "forge-std/Script.sol";
import { Donate } from "../src/Donate.sol";

/// @title Deploy Donate
/// @notice Broadcasts Donate with `OWNER` and `CLAIM_SIGNER` from the environment.
///         Does not use `msg.sender` as owner.
contract Deploy is Script {
    function run() external returns (Donate donate) {
        address owner_ = vm.envAddress("OWNER");
        address claimSigner_ = vm.envAddress("CLAIM_SIGNER");
        vm.startBroadcast();
        donate = new Donate(owner_, claimSigner_);
        vm.stopBroadcast();
    }
}
