import React from 'react';
import MintBox from '../../components/MintBox';
import type { NextPage } from 'next';

const Swap: NextPage = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 ">
      <div className="flex justify-center items-center">
        <div className="font-bold text-center my-10 text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-blue-600 via-slate-400 to-base-300 text-transparent bg-clip-text">
          Mint
        </div>
      </div>
      <MintBox />
    </div>
  );
};

export default Swap;
