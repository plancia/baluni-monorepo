const IBaluniV1HyperUniProxy = {
  "_format": "hh-sol-artifact-1",
  "contractName": "IBaluniV1HyperUniProxy",
  "sourceName": "contracts/interfaces/IBaluniV1HyperUniProxy.sol",
  "abi": [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "deposit0",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "deposit1",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "pos",
          "type": "address"
        }
      ],
      "name": "deposit",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "shares",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pos",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_deposit",
          "type": "uint256"
        }
      ],
      "name": "getDepositAmount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amountStart",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountEnd",
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
} as const; export default IBaluniV1HyperUniProxy;