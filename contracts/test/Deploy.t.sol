// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { Deploy } from "../script/Deploy.s.sol";
import { Donate } from "../src/Donate.sol";

contract DeployTest is Test {
    function test_run_deploysWithConfiguredRoles() public {
        address owner = makeAddr("owner");
        address claimSigner = makeAddr("claimSigner");
        vm.setEnv("OWNER", vm.toString(owner));
        vm.setEnv("CLAIM_SIGNER", vm.toString(claimSigner));

        Deploy deploy = new Deploy();
        Donate donate = deploy.run();

        assertEq(donate.owner(), owner);
        assertEq(donate.claimSigner(), claimSigner);
    }
}
