const IBaluniV1PoolRegistry = {
  "_format": "hh-sol-artifact-1",
  "contractName": "IBaluniV1PoolRegistry",
  "sourceName": "contracts/interfaces/IBaluniV1PoolRegistry.sol",
  "abi": [
    {
      "inputs": [],
      "name": "getAllPools",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "asset1",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "asset2",
          "type": "address"
        }
      ],
      "name": "getPoolByAssets",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        }
      ],
      "name": "getPoolsByAsset",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_pool",
          "type": "address"
        }
      ],
      "name": "poolExist",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ],
  "bytecode": "0x",
  "deployedBytecode": "0x",
  "linkReferences": {},
  "deployedLinkReferences": {}
} as const; export default IBaluniV1PoolRegistry;