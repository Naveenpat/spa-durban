import { IconRefresh } from '@tabler/icons-react';
import React, { useState } from 'react';

const CashFlow = () => {
  const [select, setSelect] = useState(false);
  return (
    <div className="flex flex-col gap-4 text-slate-400 h-[500px] bg-white p-2">
      <div className="flex items-center justify-between text-sm font-semibold text-slate-400 uppercase">
        <div>CashFlow</div> <IconRefresh />
      </div>
      <div className="text-xs">
        Graphical Presentation of income and expenses have done in the last 30
        days.
      </div>
      <div className="flex gap-1 border-b">
        <div
          className={`${select ? 'border-t border-x border-black ' : 'text-primary-60'} text-center h-[40px] w-[100px] cursor-pointer`}
          onClick={() => setSelect(true)}
        >
          Income
        </div>
        <div
          className={`${!select ? 'border-t border-x border-black ' : 'text-primary-60'} text-center h-[40px] w-[100px] cursor-pointer`}
          onClick={() => setSelect(false)}
        >
          Expenses
        </div>
      </div>
    </div>
  );
};

export default CashFlow;
