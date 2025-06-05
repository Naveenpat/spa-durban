import { IconMapPin, IconRefresh } from '@tabler/icons-react';
import React from 'react';

const StockAlert = ({ data }: any) => {
  return (
    <div>
      <div className="h-[500px] bg-white p-2 overflow-auto">
        <div className="flex items-center justify-between text-sm font-semibold uppercase text-slate-400">
          <div>STOCK ALERT</div> <IconRefresh />
        </div>

        <div className="flex flex-col gap-4 p-2">
          {data?.map((data: any) => {
            return (
              <div className="flex text-xs ">
                <span className="px-2 py-1 mr-2 text-white bg-red-400 rounded-md h-fit">
                  {data?.quantity}
                </span>
                <span className="text-sm font-medium text-primary-60">
                  {data?.item}
                  <span className="flex flex-wrap text-xs text-purple-500">
                    {data?.hotel}
                    {data?.address}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StockAlert;
