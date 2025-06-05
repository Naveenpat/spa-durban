import React, { ReactNode, useState } from 'react';

interface ATMTooltipProps {
  children: ReactNode;
  tooltipText: ReactNode;
}

const ATMTooltip: React.FC<ATMTooltipProps> = ({ children, tooltipText }) => {
  const [visible, setVisible] = useState(false);

  const showTooltip = () => {
    setVisible(true);
  };

  const hideTooltip = () => {
    setVisible(false);
  };

  return (
    <div className="relative inline-block" onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
      {children}
      {visible && (
        <div className="absolute p-2 mb-2 text-sm text-white bg-gray-800 rounded shadow-lg bottom-full w-max">
          {tooltipText}
        </div>
      )}
    </div>
  );
};

export default ATMTooltip;
