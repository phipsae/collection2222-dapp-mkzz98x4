// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Collection2222.sol";

/**
 * @notice Deploy script for Collection2222
 * @dev Run with: forge script script/Deploy.s.sol --rpc-url <rpc_url> --broadcast
 */
contract DeployScript is Script {
    function run() external returns (Collection2222) {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        Collection2222 instance = new Collection2222();
        
        vm.stopBroadcast();
        
        console.log("Collection2222 deployed at:", address(instance));
        
        return instance;
    }
}
