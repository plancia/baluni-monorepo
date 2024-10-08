const IBaluniV1Agent = {
  "_format": "hh-sol-artifact-1",
  "contractName": "IBaluniV1Agent",
  "sourceName": "contracts/interfaces/IBaluniV1Agent.sol",
  "abi": [
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "data",
              "type": "bytes"
            }
          ],
          "internalType": "struct IBaluniV1Agent.Call[]",
          "name": "calls",
          "type": "tuple[]"
        },
        {
          "internalType": "address[]",
          "name": "tokensReturn",
          "type": "address[]"
        }
      ],
      "name": "execute",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  "bytecode": "0x",
  "deployedBytecode": "0x",
  "linkReferences": {},
  "deployedLinkReferences": {}
} as const; export default IBaluniV1Agent;