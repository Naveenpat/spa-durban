import React from 'react';
import PageNotFoundImage from './PageNotFoundImage';

type Props = {
  message: string;
};

const ATMDataNotFoundPage = ({ message }: Props) => {
  return (
    <div
      className={`h-[500px] flex flex-col gap-2 justify-center items-center`}
    >
      <PageNotFoundImage />
      <div className="text-2xl font-semibold text-primary-30">
        Oh! data not found
      </div>
      <div className="font-semibold text-primary-30">{message}</div>
    </div>
  );
};

export default ATMDataNotFoundPage;
