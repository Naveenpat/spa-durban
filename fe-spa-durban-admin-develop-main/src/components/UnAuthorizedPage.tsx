import React from 'react';

type Props = {};

const UnAuthorizedPage = (props: Props) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-2xl font-semibold text-error"> Not Authorized </div>
      <div className="text-lg font-medium text-slate-500">
        It seems that you are not Authorized!
      </div>
      <div className="text-lg font-medium text-slate-500">
        Please Contact Admin
      </div>
    </div>
  );
};

export default UnAuthorizedPage;
