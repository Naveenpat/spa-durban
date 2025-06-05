import React from 'react';

type ATMFormHeadingProps = {
  children: any;
  extraclasses?: string;
};

const ATMFormHeading = ({ children, extraclasses }: ATMFormHeadingProps) => {
  return (
    <div
      className={`border-l-[3px] border-primary px-3 py-2 text-slate-700 font-medium text-[15px] ${extraclasses}`}
    >
      {children}
    </div>
  );
};

export default ATMFormHeading;
