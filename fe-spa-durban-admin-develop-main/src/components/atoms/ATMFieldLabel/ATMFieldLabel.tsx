import React, { ReactNode } from 'react';

type Props = {
  htmlFor?: string;
  children: ReactNode;
  hidden?: boolean;
};

const ATMFieldLabel = ({ htmlFor, children, hidden = false }: Props) => {
  return (
    <label
      className={`text-xs font-medium tracking-wide text-slate-500  ${
        hidden && 'hidden'
      } `}
      htmlFor={htmlFor}
    >
      {children}
    </label>
  );
};

export default ATMFieldLabel;
