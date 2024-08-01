const IStaticOracle = {
  "_format": "hh-sol-artifact-1",
  "contractName": "IStaticOracle",
  "sourceName": "contracts/interfaces/IStaticOracle.sol",
  "abi": [
    {
      "inputs": [],
      "name": "CARDINALITY_PER_MINUTE",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "UNISWAP_V3_FACTORY",
      "outputs": [
        {
          "internalType": "contract IUniswapV3Factory",
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
          "internalType": "uint24",
          "name": "feeTier",
          "type": "uint24"
        }
      ],
      "name": "addNewFeeTier",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "tokenA",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "tokenB",
          "type": "address"
        }
      ],
      "name": "getAllPoolsForPair",
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
          "name": "tokenA",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "tokenB",
          "type": "address"
        }
      ],
      "name": "isPairSupported",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "tokenA",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "tokenB",
          "type": "address"
        },
        {
          "internalType": "uint16",
          "name": "cardinality",
          "type": "uint16"
        }
      ],
      "name": "prepareAllAvailablePoolsWithCardinality",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "preparedPools",
          "type": "address[]"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "tokenA",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "tokenB",
          "type": "address"
        },
        {
          "internalType": "uint32",
          "name": "period",
          "type": "uint32"
        }
      ],
      "name": "prepareAllAvailablePoolsWithTimePeriod",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "preparedPools",
          "type": "address[]"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "tokenA",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "tokenB",
          "type": "address"
        },
        {
          "internalType": "uint24[]",
          "name": "feeTiers",
          "type": "uint24[]"
        },
        {
          "internalType": "uint16",
          "name": "cardinality",
          "type": "uint16"
        }
      ],
      "name": "prepareSpecificFeeTiersWithCardinality",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "preparedPools",
          "type": "address[]"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "tokenA",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "tokenB",
          "type": "address"
        },
        {
          "internalType": "uint24[]",
          "name": "feeTiers",
          "type": "uint24[]"
        },
        {
          "internalType": "uint32",
          "name": "period",
          "type": "uint32"
        }
      ],
      "name": "prepareSpecificFeeTiersWithTimePeriod",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "preparedPools",
          "type": "address[]"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "pools",
          "type": "address[]"
        },
        {
          "internalType": "uint16",
          "name": "cardinality",
          "type": "uint16"
        }
      ],
      "name": "prepareSpecificPoolsWithCardinality",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "pools",
          "type": "address[]"
        },
        {
          "internalType": "uint32",
          "name": "period",
          "type": "uint32"
        }
      ],
      "name": "prepareSpecificPoolsWithTimePeriod",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint128",
          "name": "baseAmount",
          "type": "uint128"
        },
        {
          "internalType": "address",
          "name": "baseToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "quoteToken",
          "type": "address"
        },
        {
          "internalType": "uint32",
          "name": "period",
          "type": "uint32"
        }
      ],
      "name": "quoteAllAvailablePoolsWithTimePeriod",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "quoteAmount",
          "type": "uint256"
        },
        {
          "internalType": "address[]",
          "name": "queriedPools",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint128",
          "name": "baseAmount",
          "type": "uint128"
        },
        {
          "internalType": "address",
          "name": "baseToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "quoteToken",
          "type": "address"
        },
        {
          "internalType": "uint24[]",
          "name": "feeTiers",
          "type": "uint24[]"
        },
        {
          "internalType": "uint32",
          "name": "period",
          "type": "uint32"
        }
      ],
      "name": "quoteSpecificFeeTiersWithTimePeriod",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "quoteAmount",
          "type": "uint256"
        },
        {
          "internalType": "address[]",
          "name": "queriedPools",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint128",
          "name": "baseAmount",
          "type": "uint128"
        },
        {
          "internalType": "address",
          "name": "baseToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "quoteToken",
          "type": "address"
        },
        {
          "internalType": "address[]",
          "name": "pools",
          "type": "address[]"
        },
        {
          "internalType": "uint32",
          "name": "period",
          "type": "uint32"
        }
      ],
      "name": "quoteSpecificPoolsWithTimePeriod",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "quoteAmount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "supportedFeeTiers",
      "outputs": [
        {
          "internalType": "uint24[]",
          "name": "",
          "type": "uint24[]"
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
} as const; export default IStaticOracle;