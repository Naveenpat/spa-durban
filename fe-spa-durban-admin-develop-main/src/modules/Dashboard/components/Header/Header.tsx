import {
  IconFileInvoice,
  IconGardenCart,
  IconWallet,
} from '@tabler/icons-react';
import React from 'react';
import { CURRENCY } from 'src/utils/constants';

const Header = ({ data }: any) => {
  return (
    <div>
      {' '}
      <div className="grid grid-cols-4 gap-2 font-semibold text-white ">
        <div className="flex items-center gap-4 p-3 text-sm rounded-lg bg-gradient-to-r from-primary-40 to-primary-60">
          <IconFileInvoice size={50} />
          <div>
            <div>Today Invoices</div>
            <div>+{data?.todayInvoices || '0'}</div>
          </div>
        </div>
        <div className="flex items-center gap-4 p-3 text-sm rounded-lg bg-gradient-to-r from-red-600 to-red-400">
          <IconFileInvoice size={50} />
          <div>
            <div>This Month Invoices</div>
            <div>+{data?.thisMonthInvoices || '0'}</div>
          </div>
        </div>
        <div className="flex items-center gap-4 p-3 text-sm rounded-lg bg-gradient-to-r from-orange-600 to-orange-400">
          <IconGardenCart size={50} />
          <div>
            <div>Today Sales</div>
            <div>
              + {CURRENCY}{' '}
              {(data?.todaySales && data?.todaySales.toFixed(2)) || '0'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 p-3 text-sm rounded-lg bg-gradient-to-r from-green-600 to-green-400">
          <IconWallet size={50} />
          <div>
            <div>This Month Sales</div>
            <div>
              + {CURRENCY}{' '}
              {(data?.thisMonthSales && data?.thisMonthSales.toFixed(2)) || '0'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
