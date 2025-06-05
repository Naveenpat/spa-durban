import React from 'react';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';

type Props = {};

const MOLLoader = (props: Props) => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <ATMCircularProgress />
    </div>
  );
};

export default MOLLoader;
