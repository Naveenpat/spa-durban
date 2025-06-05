import React from 'react';
import RecentTransactions from './RecentTransactions';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
const transactionsData = [
  {
    date: '2023-07-01',
    credit: 0,
    debit: 50,
    account: 'Coastlands Umhlanga Hotel',
    method: 'Credit Card',
  },
  {
    date: '2023-07-02',
    credit: 0,
    debit: 50,
    account: 'Coastlands Skye Hotel',
    method: 'Credit Card',
  },
  {
    date: '2023-07-03',
    credit: 0,
    debit: 50,
    account: 'Royal Hotel',
    method: 'Credit Card',
  },
  {
    date: '2023-07-04',
    credit: 0,
    debit: 50,
    account: 'Hilton Durban',
    method: 'Credit Card',
  },
  {
    date: '2023-07-05',
    credit: 0,
    debit: 50,
    account: 'Beverly Hills Hotel',
    method: 'Credit Card',
  },
  {
    date: '2023-07-06',
    credit: 0,
    debit: 50,
    account: 'Oyster Box Hotel',
    method: 'Credit Card',
  },
  {
    date: '2023-07-07',
    credit: 0,
    debit: 50,
    account: 'Protea Hotel Fire & Ice! by Marriott Durban Umhlanga Ridge',
    method: 'Credit Card',
  },
  {
    date: '2023-07-08',
    credit: 0,
    debit: 50,
    account: 'The Capital Pearls',
    method: 'Credit Card',
  },
  {
    date: '2023-07-09',
    credit: 0,
    debit: 50,
    account: 'Fairmont Zimbali Resort',
    method: 'Credit Card',
  },
  {
    date: '2023-07-10',
    credit: 0,
    debit: 50,
    account: 'The Benjamin Hotel',
    method: 'Credit Card',
  },
];

const tableHeaders: TableHeader<any>[] = [
  {
    fieldName: 'date',
    headerName: 'Date#',
    flex: 'flex-[1_0_0%]',
  },
  {
    fieldName: 'account',
    headerName: 'Account',
    flex: 'flex-[1_0_0%]',
  },
  {
    fieldName: 'credit',
    headerName: 'Credit',
    flex: 'flex-[1_0_0%]',
  },
  {
    fieldName: 'debit',
    headerName: 'Debit',
    flex: 'flex-[1_0_0%]',
  },
  {
    fieldName: 'method',
    headerName: 'Method',
    flex: 'flex-[1_0_0%]',
  },
];
const RecentTransactionsWrapper = () => {
  return (
    <div>
      <RecentTransactions
        tableHeaders={tableHeaders}
        rowData={transactionsData}
      />
    </div>
  );
};

export default RecentTransactionsWrapper;
