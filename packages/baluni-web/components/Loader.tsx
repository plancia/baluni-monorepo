import { SpinnerCircular } from 'spinners-react';

import React from 'react';

type Props = {
  size?: number;
  color?: string;
};

const Loader = ({ color, size = 20 }: Props) => {
  return <SpinnerCircular color={color} size={size} />;
};

export default Loader;
