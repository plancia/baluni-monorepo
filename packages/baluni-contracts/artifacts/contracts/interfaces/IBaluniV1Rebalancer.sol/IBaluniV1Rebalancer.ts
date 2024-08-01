const IBaluniV1Rebalancer = {
  "_format": "hh-sol-artifact-1",
  "contractName": "IBaluniV1Rebalancer",
  "sourceName": "contracts/interfaces/IBaluniV1Rebalancer.sol",
  "abi": [
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "balances",
          "type": "uint256[]"
        },
        {
          "internalType": "address[]",
          "name": "assets",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "weights",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "limit",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "baseAsset",
          "type": "address"
        }
      ],
      "name": "checkRebalance",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "length",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalValue",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "finalUsdBalance",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "overweightVaultsLength",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "underweightVaultsLength",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalActiveWeight",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "amountOut",
              "type": "uint256"
            },
            {
              "internalType": "uint256[]",
              "name": "overweightVaults",
              "type": "uint256[]"
            },
            {
              "internalType": "uint256[]",
              "name": "overweightAmounts",
              "type": "uint256[]"
            },
            {
              "internalType": "uint256[]",
              "name": "underweightVaults",
              "type": "uint256[]"
            },
            {
              "internalType": "uint256[]",
              "name": "underweightAmounts",
              "type": "uint256[]"
            },
            {
              "internalType": "uint256[]",
              "name": "balances",
              "type": "uint256[]"
            }
          ],
          "internalType": "struct IBaluniV1Rebalancer.RebalanceVars",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "fromToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "toToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "convert",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "balances",
          "type": "uint256[]"
        },
        {
          "internalType": "address[]",
          "name": "assets",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "weights",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "limit",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "baseAsset",
          "type": "address"
        }
      ],
      "name": "rebalance",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  "bytecode": "0x",
  "deployedBytecode": "0x",
  "linkReferences": {},
  "deployedLinkReferences": {}
} as const; export default IBaluniV1Rebalancer;