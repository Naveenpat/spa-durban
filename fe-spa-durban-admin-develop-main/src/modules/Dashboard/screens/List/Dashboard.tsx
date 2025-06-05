import {
  IconFileInvoice,
  IconFlag,
  IconPinInvoke,
  IconRefresh,
} from '@tabler/icons-react';
import CashFlowWrapper from '../../components/CashFlow/CashFlowWrapper';
import ChartWrapper from '../../components/Chart/ChartWrapper';
import HeaderWrapper from '../../components/Header/HeaderWrapper';
import IncomeVsExpensesWrapper from '../../components/IncomeVsExpenses/IncomeVsExpensesWrapper';
import RecentBuyersWrapper from '../../components/RecentBuyers/RecentBuyersWrapper';
import RecentInvoicesWrapper from '../../components/RecentInvoices/RecentInvoicesWrapper';
import RecentTransactionsWrapper from '../../components/RecentTransactions/RecentTransactionsWrapper';
import StockAlertWrapper from '../../components/StockAlert/StockAlertWrapper';

type Props = {};

const Dashboard = ({}: Props) => {
  return (
    <>
      <div className="grid gap-4 p-4 bg-slate-50">
        <HeaderWrapper />
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <ChartWrapper />
          </div>
          <div>
            <RecentBuyersWrapper />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-3">
            <RecentInvoicesWrapper />
          </div>
          {/* <IncomeVsExpensesWrapper /> */}
        </div>
        {/* <div className="p-2 bg-white">
          <div className="flex justify-end text-slate-400">
            <IconRefresh />
          </div>
          <div className="grid grid-cols-4 font-medium">
            <div className="flex flex-col gap-1 p-3 text-sm bg-white border-r-2 ">
              <div className="flex items-center justify-between gap-4 text-primary-60">
                <div className="text-lg">0%</div>
                <IconFileInvoice size={40} />
              </div>
              <div className="text-slate-400">
                <div>July Income</div>
                <div>0.00/ 1.00</div>
              </div>
              <div className="border-2"></div>
            </div>
            <div className="flex flex-col gap-1 p-3 text-sm bg-white border-r-2 ">
              <div className="flex items-center justify-between gap-4 text-red-500">
                <div className="text-lg">0%</div>
                <IconPinInvoke size={40} />
              </div>
              <div className="text-slate-400">
                <div>July Income</div>
                <div>0.00/ 1.00</div>
              </div>
              <div className="border-2"></div>
            </div>
            <div className="flex flex-col gap-1 p-3 text-sm bg-white border-r-2 ">
              <div className="flex items-center justify-between gap-4 text-sky-500 ">
                <div className="text-lg">0%</div>
                <IconFlag size={40} />
              </div>
              <div className="text-slate-400">
                <div>July Income</div>
                <div>0.00/ 1.00</div>
              </div>
              <div className="border-2"></div>
            </div>
            <div className="flex flex-col gap-1 p-3 text-sm bg-white ">
              <div className="flex items-center justify-between gap-4 text-purple-500">
                <div className="text-lg">0%</div>
                <IconFileInvoice size={40} />
              </div>
              <div className="text-slate-400">
                <div>July Income</div>
                <div>0.00/ 1.00</div>
              </div>
              <div className="border-2"></div>
            </div>
          </div>
        </div> */}
        {/* <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <CashFlowWrapper />
          </div>
          <StockAlertWrapper />
        </div> */}
        {/* <div>
          <RecentTransactionsWrapper />
        </div> */}
      </div>
    </>
  );
};

export default Dashboard;
