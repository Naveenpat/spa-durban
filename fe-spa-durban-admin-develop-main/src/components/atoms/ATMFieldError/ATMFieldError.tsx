import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

const ATMFieldError = ({ children }: Props) => {
  return <p className="absolute text-xs text-error-60"> {children} </p>;
};

export default ATMFieldError;
