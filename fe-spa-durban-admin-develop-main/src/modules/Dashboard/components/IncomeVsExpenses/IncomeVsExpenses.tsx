import { IconRefresh } from '@tabler/icons-react';
import React from 'react';

const IncomeVsExpenses = () => {
  return (
    <div>
      {' '}
      <div className=" bg-white h-[500px] p-2">
        <div className="flex items-center justify-between text-sm font-semibold text-slate-400 uppercase">
          <div>Income vs Expenses</div> <IconRefresh />
        </div>
        <div className="flex items-center justify-center h-full text-center ">
          <div className="text-4xl font-semibold ">
            <div>Income</div>
            <div>0</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeVsExpenses;
