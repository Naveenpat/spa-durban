import { IconRefresh } from '@tabler/icons-react';
import React from 'react';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';
import { CURRENCY } from 'src/utils/constants';
type Props = {
  buyersData: any[];
  isLoading: boolean;
  fetch: () => void;
};
const RecentBuyers = ({ buyersData, isLoading, fetch }: Props) => {
  return (
    <div className="bg-white h-[700px] overflow-auto">
      <div className="sticky top-0 z-10 flex items-center justify-between p-2 text-sm font-semibold uppercase bg-white text-slate-400">
        <div> RECENT BUYERS</div>{' '}
        <div onClick={fetch} className="cursor-pointer ">
          {' '}
          <IconRefresh />
        </div>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <ATMCircularProgress />
        </div>
      ) : (
        <div>
          <div className="flex flex-col gap-4 p-4">
            {buyersData?.map((buyer: any) => {
              return (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 ">
                    <div className="w-[50px] h-[50px] rounded-full">
                      <img
                        className="w-full h-full rounded-full"
                        src="https://www.freeiconspng.com/thumbs/human-icon-png/person-outline-icon-png-person-outline-icon-png-person-17.png"
                        alt=""
                      />
                    </div>
                    <div>
                      <div className="text-sm">
                        {buyer?.customerName || '-'}{' '}
                      </div>
                      <div className=" max-w-fit">
                        {!buyer?.balanceDue ? (
                          <div className="px-3 text-[10px] text-white bg-green-500 rounded-lg">
                            Paid
                          </div>
                        ) : (
                          <div className="px-3 text-[10px] text-white bg-red-500 rounded-lg">
                            UnPaid
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col text-xs font-semibold">
                    {CURRENCY} {(buyer?.amountPaid).toFixed(2) || '-'}
                    <div className="text-[10px] font-medium text-red-500 text-end">
                      {buyer?.balanceDue ? (
                        <div>
                          {CURRENCY} {(buyer?.balanceDue).toFixed(2)}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentBuyers;
