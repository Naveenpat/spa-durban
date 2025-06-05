import { ReactNode, useRef } from 'react';

type Props = {
  onClose?: () => void;
  children: ReactNode;
};

const ATMDialog = ({ onClose, children }: Props) => {
  const dialogBoxRef = useRef<any>(null);

  const handleClickOutside = (e: any) => {
    if (!dialogBoxRef?.current?.contains(e.target)) {
      onClose?.();
    }
  };

  return (
    <div
      onClick={handleClickOutside}
      className={`absolute top-0 left-0 w-screen h-screen bg-black bg-opacity-50 z-[1000] flex justify-center items-center overflow-auto`}
    >
      <div
        ref={dialogBoxRef}
        className="flex items-center max-h-full overflow-auto bg-white rounded-md animate-scale"
      >
        {children}
      </div>
    </div>
  );
};

export default ATMDialog;
