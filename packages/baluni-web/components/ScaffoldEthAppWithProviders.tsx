'use client';

import {
  darkTheme,
  lightTheme,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import { ReactNode, useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { State, WagmiProvider } from 'wagmi';
import { Footer } from '~~/components/Footer';
import { Header } from '~~/components/Header';
import { BlockieAvatar } from '~~/components/scaffold-eth';
import { ProgressBar } from '~~/components/scaffold-eth/ProgressBar';
import { useInitializeNativeCurrencyPrice } from '~~/hooks/scaffold-eth';
import { wagmiConfig } from '~~/services/web3/wagmiConfig';

type Props = {
  children: ReactNode;
  initialState: State | undefined;
};

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  useInitializeNativeCurrencyPrice();

  return (
    <>
      <div className="flex flex-col min-h-screen font-reddit">
        <Header />
        <main className="relative flex flex-col flex-1 bg-base-200">
          {children}
        </main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const ScaffoldEthAppWithProviders = ({
  children,
  initialState,
}: Props) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <ProgressBar />
        <RainbowKitProvider
          avatar={BlockieAvatar}
          theme={
            mounted ? (isDarkMode ? darkTheme() : lightTheme()) : lightTheme()
          }
        >
          <ScaffoldEthApp>{children}</ScaffoldEthApp>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
