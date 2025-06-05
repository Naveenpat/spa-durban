import React from 'react';
import { Size } from '../../../utils';
type ATMCircularProgressProps = {
  size?: Size;
};
const ATMCircularProgress = ({ size = 'small' }: ATMCircularProgressProps) => {
  const getSize = (size: Size) => {
    switch (size) {
      case 'small':
        return 'h-[40px]';
      case 'medium':
        return 'h-[60px]';
      case 'large':
        return 'h-[80px]';
    }
  };

  return (
    <>
      <svg className={`${getSize(size)} animate-spin`} viewBox="0 0 50 50">
        <circle
          r="15"
          cx="25"
          cy="25"
          fill="transparent"
          strokeWidth="5px"
          strokeDasharray="70px"
          className={'stroke-blue-500'}
        />
      </svg>
    </>
  );
};

export default ATMCircularProgress;
