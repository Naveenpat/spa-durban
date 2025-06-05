import { IconShoppingBag } from '@tabler/icons-react';
import React from 'react';

type Props = {};

const NoItemFound = (props: Props) => {
  return (
    <div className="flex flex-col items-center w-full gap-2 py-8 text-gray-400">
      <div>
        <IconShoppingBag size={80} />
      </div>

      <div className="font-medium text-center ">
        No roduct or service found
      </div>
    </div>
  );
};

export default NoItemFound;
