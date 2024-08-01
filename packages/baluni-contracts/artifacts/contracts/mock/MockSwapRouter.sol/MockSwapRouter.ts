const MockSwapRouter = {
  "_format": "hh-sol-artifact-1",
  "contractName": "MockSwapRouter",
  "sourceName": "contracts/mock/MockSwapRouter.sol",
  "abi": [
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "address[]",
              "name": "path",
              "type": "address[]"
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "deadline",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "amountIn",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "amountOutMinimum",
              "type": "uint256"
            }
          ],
          "internalType": "struct MockSwapRouter.ExactInputParams",
          "name": "params",
          "type": "tuple"
        }
      ],
      "name": "exactInput",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amountOut",
          "type": "uint256"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "tokenIn",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "tokenOut",
              "type": "address"
            },
            {
              "internalType": "uint24",
              "name": "fee",
              "type": "uint24"
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "deadline",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "amountIn",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "amountOutMinimum",
              "type": "uint256"
            },
            {
              "internalType": "uint160",
              "name": "sqrtPriceLimitX96",
              "type": "uint160"
            }
          ],
          "internalType": "struct MockSwapRouter.ExactInputSingleParams",
          "name": "params",
          "type": "tuple"
        }
      ],
      "name": "exactInputSingle",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amountOut",
          "type": "uint256"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    }
  ],
  "bytecode": "0x608060405234601c57600e6020565b6101d761002b82396101d790f35b6026565b60405190565b5f80fdfe60806040526004361015610013575b610148565b61001d5f3561003c565b8063414bf389146100375763c96b921f0361000e5761011d565b6100ac565b60e01c90565b60405190565b5f80fd5b5f80fd5b5f80fd5b90816101009103126100635790565b610050565b90610100828203126100825761007f915f01610054565b90565b610048565b90565b61009390610087565b9052565b91906100aa905f6020850194019061008a565b565b6100d36100c26100bd366004610068565b610171565b6100ca610042565b91829182610097565b0390f35b908160a09103126100e55790565b610050565b90602082820312610118575f82013560018060401b0381116101135761011092016100d7565b90565b61004c565b610048565b61014461013361012e3660046100ea565b610189565b61013b610042565b91829182610097565b0390f35b5f80fd5b5f90565b61015981610087565b0361016057565b5f80fd5b3561016e81610150565b90565b60a06101869161017f61014c565b5001610164565b90565b606061019e9161019761014c565b5001610164565b9056fea26469706673582212205baa7c8ab08d65d0c012807bc8389df36fbc927899127b53bdd4971b0636bb8464736f6c63430008190033",
  "deployedBytecode": "0x60806040526004361015610013575b610148565b61001d5f3561003c565b8063414bf389146100375763c96b921f0361000e5761011d565b6100ac565b60e01c90565b60405190565b5f80fd5b5f80fd5b5f80fd5b90816101009103126100635790565b610050565b90610100828203126100825761007f915f01610054565b90565b610048565b90565b61009390610087565b9052565b91906100aa905f6020850194019061008a565b565b6100d36100c26100bd366004610068565b610171565b6100ca610042565b91829182610097565b0390f35b908160a09103126100e55790565b610050565b90602082820312610118575f82013560018060401b0381116101135761011092016100d7565b90565b61004c565b610048565b61014461013361012e3660046100ea565b610189565b61013b610042565b91829182610097565b0390f35b5f80fd5b5f90565b61015981610087565b0361016057565b5f80fd5b3561016e81610150565b90565b60a06101869161017f61014c565b5001610164565b90565b606061019e9161019761014c565b5001610164565b9056fea26469706673582212205baa7c8ab08d65d0c012807bc8389df36fbc927899127b53bdd4971b0636bb8464736f6c63430008190033",
  "linkReferences": {},
  "deployedLinkReferences": {}
} as const; export default MockSwapRouter;