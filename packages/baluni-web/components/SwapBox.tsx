'use client';

import { useQuery } from '@tanstack/react-query';
import baluniPoolAbi from 'baluni-contracts/artifacts/contracts/pools/BaluniV1Pool.sol/BaluniV1Pool.json';
import poolPeripheryAbi from 'baluni-contracts/artifacts/contracts/pools/BaluniV1PoolPeriphery.sol/BaluniV1PoolPeriphery.json';
import poolRegistryAbi from 'baluni-contracts/artifacts/contracts/registry/BaluniV1PoolRegistry.sol/BaluniV1PoolRegistry.json';
import registryAbi from 'baluni-contracts/artifacts/contracts/registry/BaluniV1Registry.sol/BaluniV1Registry.json';
import { INFRA, NATIVETOKENS } from 'baluni-core/api';
import { ethers } from 'ethers';
import type React from 'react';
import { useMemo, useState } from 'react';
import { erc20Abi, formatUnits, getContract, parseUnits } from 'viem';
import { useReadContract, useWalletClient } from 'wagmi';
import { readContract } from 'wagmi/actions';
import Spinner from '~~/components/Spinner';
import useTokenList from '~~/hooks/useTokenList';
import { wagmiConfig } from '~~/services/web3/wagmiConfig';
import { clientToSigner } from '~~/utils/ethers';
import { notification } from '~~/utils/scaffold-eth';
import Loader from './Loader';

interface SwapData {
  fromToken?: `0x${string}`;
  toToken?: `0x${string}`;
  fromAmount?: string;
}

interface Token {
  address: string;
  symbol: string;
  logoURI: string;
  name: string;
}

const WETHAbi = [
  'function deposit() public payable',
  'function withdraw(uint wad) public',
  'function balanceOf(address owner) public view returns (uint256)',
  'function approve(address spender, uint256 amount) public returns (bool)',
  'function transfer(address to, uint256 value) public returns (bool)',
  'function transferFrom(address from, address to, uint256 value) public returns (bool)',
];

const SwapBox = () => {
  const { data: signer } = useWalletClient();
  const { tokens } = useTokenList();

  const [swapData, setSwapData] = useState<SwapData>({});

  const poolFactoryQuery = useReadContract({
    address: INFRA[137].REGISTRY,
    functionName: 'getBaluniPoolRegistry',
    abi: registryAbi.abi,
    query: {
      enabled: !!signer,
    },
  });

  const poolPeripheryQuery = useReadContract({
    address: INFRA[137].REGISTRY,
    functionName: 'getBaluniPoolPeriphery',
    abi: registryAbi.abi,
    query: {
      enabled: !!signer,
    },
  });

  const poolFactory = poolFactoryQuery.data;
  const poolPeriphery = poolPeripheryQuery.data;

  const poolsQuery = useReadContract({
    address: poolFactory,
    functionName: 'getAllPools',
    abi: poolRegistryAbi.abi,
  });
  // console.log('pools query data', poolsQuery.data);

  const assetsQuery = useQuery({
    queryKey: ['assets', poolsQuery.data],
    queryFn: async () => {
      const promises = (poolsQuery.data ?? []).map((poolAddress) => {
        return readContract(wagmiConfig, {
          address: poolAddress,
          abi: baluniPoolAbi.abi,
          functionName: 'getAssets',
        });
      });
      try {
        const data = await Promise.all(promises);
        return (data ?? []).flat();
      } catch (err) {
        console.error('Error fetching assets:', err);
        return [];
      }
    },
  });

  /**
   * This query depends on the assetsQuery.data, so it will be refetched whenever the assetsQuery.data changes.
   */
  const symbolsQuery = useQuery({
    queryKey: ['symbols', assetsQuery.data],
    queryFn: async () => {
      const promises = (assetsQuery.data ?? []).map((asset: any) => {
        return readContract(wagmiConfig, {
          address: asset,
          abi: erc20Abi,
          functionName: 'symbol',
        });
      });

      try {
        const symbols = await Promise.all(promises);
        return ['USDC.e', ...symbols];
      } catch (err) {
        console.error('Error fetching symbols:', err);
        return [];
      }
    },
  });

  // console.log('symbolsQuery', symbolsQuery.status, symbolsQuery.data);

  const filteredTokens = useMemo(() => {
    return tokens.filter((token: Token) =>
      symbolsQuery.data?.includes(token.symbol)
    );
  }, [symbolsQuery.data, tokens]);

  const fetchTokenBalance = async (
    tokenAddress: `0x${string}`,
    account: `0x${string}`
  ) => {
    // const tokenContract = new ethers.Contract(
    //   tokenAddress,
    //   erc20Abi,
    //   clientToSigner(signer as any)
    // );
    const tokenContract = getContract({
      client: signer!,
      abi: erc20Abi,
      address: tokenAddress,
    });
    const [balance, decimals] = await Promise.all([
      tokenContract.read.balanceOf([account]),
      tokenContract.read.decimals(),
    ]);
    // const balance = await tokenContract.balanceOf(account);
    // const decimals = await tokenContract.decimals();
    return formatUnits(balance, decimals);
  };

  const fromBalanceQuery = useQuery({
    queryKey: ['fromBalance', swapData.fromToken, signer],
    queryFn: async () => {
      const balance = await fetchTokenBalance(
        swapData.fromToken!,
        signer!.account.address
      );
      // setFromBalance(balance);
      return balance;
    },
    
    enabled: !!signer && !!swapData.fromToken,
    staleTime: 0,
    
  });
  
  const toBalanceQuery = useQuery({
    queryKey: ['toBalance', swapData.toToken, signer],
    queryFn: async () => {
      const balance = await fetchTokenBalance(
        swapData.toToken!,
        signer!.account.address
      );
      // setToBalance(balance);
      return balance;
    },
    enabled: !!signer && !!swapData.toToken,
    staleTime: 0,
  });

  const handleInputChange = async (
    e:
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!signer) return;

    const { name, value } = e.target;

    if (name === 'fromToken' || name === 'toToken' || name === 'fromAmount') {
      setSwapData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const poolAddressQuery = useQuery({
    queryKey: [
      'poolChecker',
      swapData.fromToken,
      swapData.toToken,
      poolFactory,
    ],
    enabled: !!signer && !!swapData.fromToken && !!swapData.toToken,
    queryFn: async () => {
      const fromToken = swapData.fromToken;
      const toToken = swapData.toToken;

      if (
        (fromToken == NATIVETOKENS[137].WRAPPED &&
          toToken == NATIVETOKENS[137].NATIVE) ||
        (fromToken == NATIVETOKENS[137].NATIVE &&
          toToken == NATIVETOKENS[137].WRAPPED)
      ) {
        return true;
      }

      if (poolFactory) {
        const factory = new ethers.Contract(
          poolFactory!,
          poolRegistryAbi.abi,
          clientToSigner(signer)
        );
        try {
          const poolAddress = await factory.getPool(fromToken, toToken);
          return poolAddress !== ethers.constants.AddressZero
            ? poolAddress
            : null;
        } catch (err) {
          console.error('Error fetching pool address:', err);
          return null;
        }
      }
      return null;
    },
  });

  const toReserve = useQuery({
    queryKey: ['toReserve', poolAddressQuery.data, swapData.toToken],
    enabled: !!poolAddressQuery.data,
    queryFn: async () => {
      if (!signer) return;
      const pool = new ethers.Contract(
        poolAddressQuery.data,
        baluniPoolAbi.abi,
        clientToSigner(signer)
      );
      const liquidity = await pool.getAssetReserve(swapData.toToken);

      if (liquidity.eq(0)) {
        notification.error('Pool has no liquidity');
        throw new Error('Pool has no liquidity');
      }
      return liquidity;
    },
  });

  const previewQuery = useQuery({
    queryKey: [
      'preview',
      poolPeriphery,
      swapData.fromToken,
      swapData.toToken,
      swapData.fromAmount,
    ],
    enabled:
      !!signer &&
      !!swapData.fromToken &&
      !!swapData.toToken &&
      !!swapData.fromAmount &&
      !!poolPeriphery,
    queryFn: async () => {
      try {
        const fromToken = swapData.fromToken;
        const toToken = swapData.toToken;
        const fromAmount = swapData.fromAmount;
        if (!signer || !fromToken || !toToken || !fromAmount || !poolPeriphery)
          return;

        if (
          (fromToken == NATIVETOKENS[137].WRAPPED &&
            toToken == NATIVETOKENS[137].NATIVE) ||
          (fromToken == NATIVETOKENS[137].NATIVE &&
            toToken == NATIVETOKENS[137].WRAPPED)
        ) {
          return fromAmount;
        }

        const amountsPromises = [
          readContract(wagmiConfig, {
            address: fromToken,
            abi: erc20Abi,
            functionName: 'decimals',
            args: [],
          }),
          readContract(wagmiConfig, {
            address: toToken,
            abi: erc20Abi,
            functionName: 'decimals',
            args: [],
          }),
        ];

        const [decimalsFrom, decimalsTo] = await Promise.all(amountsPromises);

        const amountOut = await readContract(wagmiConfig, {
          address: poolPeriphery,
          abi: poolPeripheryAbi.abi,
          functionName: 'getAmountOut',
          args: [fromToken, toToken, parseUnits(fromAmount, decimalsFrom)],
        });

        if (amountOut > BigInt(toReserve.data)) {
          notification.error('Insufficient liquidity in pool');
          return 'Insufficient liquidity in pool';
        }

        return formatUnits(amountOut, decimalsTo);
      } catch (err) {
        console.error('Error fetching preview:', err);
        return 'error';
      }
    },
  });

  const handleSwap = async () => {
    const { fromToken, toToken, fromAmount } = swapData;
    if (!signer || !fromToken || !toToken || !fromAmount) return;
    if (
      (fromToken == NATIVETOKENS[137].WRAPPED &&
        toToken == NATIVETOKENS[137].NATIVE) ||
      (fromToken == NATIVETOKENS[137].NATIVE &&
        toToken == NATIVETOKENS[137].WRAPPED)
    ) {
      try {
        const token = new ethers.Contract(
          NATIVETOKENS[137].WRAPPED,
          WETHAbi,
          clientToSigner(signer)
        );
        const tx = await token.withdraw(
          ethers.utils.parseUnits(fromAmount, 18)
        );
        await tx.wait();
        notification.success('Swap completed successfully!');
        return;
      } catch (error: any) {
        notification.error(
          error && error.reason
            ? String(error.reason)
            : 'An error occurred while swapping tokens.'
        );
      }
    }

    if (
      !signer ||
      !fromToken ||
      !toToken ||
      !fromAmount ||
      !poolPeriphery ||
      !toReserve
    )
      return;

    const fromTokenContract = new ethers.Contract(
      fromToken,
      erc20Abi,
      clientToSigner(signer)
    );
    const decimals = await fromTokenContract.decimals();
    const allowance = await fromTokenContract.allowance(
      signer.account.address,
      poolPeriphery
    );

    if (allowance.lt(ethers.utils.parseUnits(fromAmount, decimals))) {
      const approveTx = await fromTokenContract.approve(
        poolPeriphery,
        ethers.utils.parseUnits(fromAmount, decimals)
      );
      await approveTx.wait();
    }

    const deadline = Math.floor(Date.now() / 1000) + 30; // 10 minutes from now
    const periphery = new ethers.Contract(
      poolPeriphery,
      poolPeripheryAbi.abi,
      clientToSigner(signer)
    );

    if (
      toToken == NATIVETOKENS[137].WRAPPED &&
      toToken == NATIVETOKENS[137].NATIVE
    ) {
      try {
        const token = new ethers.Contract(
          NATIVETOKENS[137].WRAPPED,
          WETHAbi,
          clientToSigner(signer)
        );
        const tx = await token.deposit({
          value: ethers.utils.parseUnits(fromAmount, decimals),
        });
        await tx.wait();
        notification.success('Swap completed successfully!');
      } catch (error: any) {
        notification.error(
          error && error.reason
            ? String(error.reason)
            : 'An error occurred while swapping tokens.'
        );
      }
    } else {
      try {
        const tx = await periphery.swapTokenForToken(
          fromToken,
          toToken,
          ethers.utils.parseUnits(fromAmount, decimals),
          0,
          signer.account.address,
          signer.account.address,
          deadline
        );
        await tx.wait();
        notification.success('Swap completed successfully!');
      } catch (error: any) {
        notification.error(
          error && error.reason
            ? String(error.reason)
            : 'An error occurred while swapping tokens.'
        );
      }
    }
  };

  const getTokenIcon = (tokenAddress: string): string => {
    const token = tokens.find(
      (token: Token) => token.address === tokenAddress
    ) as unknown as Token;
    return token ? token.logoURI : 'Unknown Token';
  };

  if (symbolsQuery.isLoading) {
    return <Spinner />;
  }

  return (
    <div className="card bg-base-100 shadow-xl p-6 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 mx-auto">
      <h2 className="card-title text-3xl mb-8">Swap</h2>
      <div className="mb-4 mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          From Token
        </label>
        {NATIVETOKENS && (
          <div className="relative">
            <select
              name="fromToken"
              className="select select-bordered w-full mb-2"
              value={swapData.fromToken}
              onChange={handleInputChange}
            >
              <option disabled value="">
                Select From Token
              </option>
              <option value={NATIVETOKENS[137].NATIVE}>NATIVE</option>
              {filteredTokens.map((token: Token) => (
                <option key={token.address} value={token.address}>
                  {token.symbol}
                </option>
              ))}
            </select>
            {swapData.fromToken && (
              <img
                src={getTokenIcon(swapData.fromToken)}
                alt="From Token"
                className="absolute top-1/2 right-3 transform -translate-y-1/2 w-5 h-5"
              />
            )}
          </div>
        )}
        <p className="text-sm">
          Balance: {fromBalanceQuery.data || ''}
          {!!fromBalanceQuery.isLoading && <Loader />}
        </p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          To Token
        </label>
        <div className="relative">
          <select
            name="toToken"
            className="select select-bordered w-full mb-2"
            value={swapData.toToken}
            onChange={handleInputChange}
          >
            <option disabled value="">
              Select To Token
            </option>
            <option value={NATIVETOKENS[137].NATIVE}>NATIVE</option>

            {filteredTokens.map((token: Token) => (
              <option key={token.address} value={token.address}>
                {token.symbol}
              </option>
            ))}
          </select>
          {swapData.toToken && (
            <img
              src={getTokenIcon(swapData.toToken)}
              alt="To Token"
              className="absolute top-1/2 right-3 transform -translate-y-1/2 w-5 h-5"
            />
          )}
        </div>
        <p className="text-sm">
          Balance: {toBalanceQuery.data || ''}
          {!!toBalanceQuery.isLoading && <Loader />}
        </p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount
        </label>
        <input
          type="text"
          name="fromAmount"
          className="input input-bordered w-full"
          placeholder="Amount"
          value={swapData.fromAmount}
          onChange={(e) => {
            handleInputChange(e);
            // previewSwap(swapData.fromToken, swapData.toToken, e.target.value);
          }}
        />
      </div>
      <div className="mb-4">
        <strong>Estimated Amount Out:</strong> {previewQuery.data || ''}
      </div>

      {!!poolAddressQuery.isLoading && <Loader />}
      {!poolAddressQuery.data && poolAddressQuery.status == 'success' && (
        <div
          className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800"
          role="alert"
        >
          <svg
            className="flex-shrink-0 inline w-4 h-4 me-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
          <span className="sr-only">Info</span>
          <div>
            <span className="font-medium"></span> Pool does not exist for the
            selected tokens.
          </div>
        </div>
      )}
      <button
        className="btn btn-primary w-full"
        onClick={handleSwap}
        disabled={!poolAddressQuery.data}
      >
        Swap
      </button>
    </div>
  );
};

export default SwapBox;
