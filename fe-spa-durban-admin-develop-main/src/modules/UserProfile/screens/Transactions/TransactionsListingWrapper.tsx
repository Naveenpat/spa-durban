import React from 'react';

import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { trasactionListingType } from '../../models/UserProfile.model';
import ATMMenu from 'src/components/atoms/ATMMenu/ATMMenu';
import { IconDotsVertical, IconEye, IconTrash } from '@tabler/icons-react';
import TransactionsListing from './TransactionsListing';
import ShowConfirmation from 'src/utils/ShowConfirmation';

type Props = {};

const listData: trasactionListingType[] = [
  {
    credit: '30.00',
    account: 'Sales Account',
    date: '2024-03-02',
    payer: 'Walk-in Client',
    method: 'Cash',
    debit: '0.00',
  },
  {
    credit: '10.00',
    account: 'Sales Account',
    date: '2024-05-15',
    payer: 'slindile slindile',
    method: 'Loyalty',
    debit: '0.00',
  },
  {
    credit: '850.00',
    account: 'Sales Account',
    date: '2024-06-04',
    payer: 'Customer Manish',
    method: 'Card',
    debit: '2.00',
  },
];

const tableHeaders: TableHeader<trasactionListingType>[] = [
  {
    fieldName: 'date',
    headerName: 'Date',
    flex: 'flex-[1_1_0%]',
    stopPropagation: true,
  },
  {
    fieldName: 'debit',
    headerName: 'Debit',
    flex: 'flex-[1_1_0%]',
    stopPropagation: true,
  },
  {
    fieldName: 'credit',
    headerName: 'Credit',
    flex: 'flex-[1_1_0%]',
    stopPropagation: true,
  },
  {
    fieldName: 'account',
    headerName: 'Account',
    flex: 'flex-[1_1_0%]',
    stopPropagation: true,
  },

  {
    fieldName: 'payer',
    headerName: 'Payer',
    flex: 'flex-[1_1_0%]',
    stopPropagation: true,
  },
  {
    fieldName: 'method',
    headerName: 'Method',
    flex: 'flex-[1_1_0%]',
    stopPropagation: true,
  },
  {
    fieldName: 'action',
    headerName: 'Action',
    flex: 'flex-[1_1_0%]',
    renderCell: (item: trasactionListingType) => (
      <div>
        <ATMMenu
          children={<IconDotsVertical />}
          items={[
            {
              label: 'View',
              icon: IconEye,
              onClick: () => {},
            },
            {
              label: 'Delete',
              icon: IconTrash,
              onClick: () => {
                ShowConfirmation({
                  title: 'Are you sure ?',
                  message: 'Do you really want to delete this Transcation ?',
                  onConfirm: () => console.log('Hello'),
                });
              },
            },
          ]}
        />
      </div>
    ),
  },
];

const TransactionsListingWrapper = (props: Props) => {
  return (
    <>
      <TransactionsListing
        tableHeaders={tableHeaders}
        rowData={listData}
        filterPaginationData={{
          totalCount: 100,
          totalPages: 5,
        }}
      />
    </>
  );
};

export default TransactionsListingWrapper;
