const IBaluniV1Oracle = {
  "_format": "hh-sol-artifact-1",
  "contractName": "IBaluniV1Oracle",
  "sourceName": "contracts/interfaces/IBaluniV1Oracle.sol",
  "abi": [
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
          "name": "valuation",
          "type": "uint256"
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
      "name": "convertScaled",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "valuation",
          "type": "uint256"
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
} as const; export default IBaluniV1Oracle;