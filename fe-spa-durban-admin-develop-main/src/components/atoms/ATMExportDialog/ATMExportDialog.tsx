import { ReactNode, useRef, useEffect } from 'react';

type Props = {
  onClose?: () => void;
  children: ReactNode;
  title?: string;
};

const ATMExportDialog = ({ onClose, children, title }: Props) => {
  const dialogBoxRef = useRef<any>(null);

  const handleClickOutside = (e: MouseEvent) => {
    if (dialogBoxRef.current && !dialogBoxRef.current.contains(e.target)) {
      onClose?.();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fixed inset-0 z-[1000] bg-black bg-opacity-50 flex justify-center items-center p-6 overflow-auto">
      <div
        ref={dialogBoxRef}
        className="bg-white w-full max-w-[90vw] max-h-[95vh] overflow-auto rounded-lg shadow-xl p-8 animate-fadeIn"
      >
        {title && <h2 className="text-2xl font-semibold text-center mb-6">{title}</h2>}

        <div className="print-preview">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ATMExportDialog;
