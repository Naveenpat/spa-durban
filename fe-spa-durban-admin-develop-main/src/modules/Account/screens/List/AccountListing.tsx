import { IconPlus } from '@tabler/icons-react';
import ATMPageHeader from 'src/components/atoms/ATMPageHeader/ATMPageHeader';
import ATMPagination from 'src/components/atoms/ATMPagination/ATMPagination';
import MOLFilterBar from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import MOLTable, {
  TableHeader,
} from 'src/components/molecules/MOLTable/MOLTable';
import { Account } from '../../models/Account.model';
import { Dispatch, SetStateAction } from 'react';
import { isAuthorized } from 'src/utils/authorization';
import Authorization from 'src/components/Authorization/Authorization';

type Props = {
  onAddNew: () => void;
  onEdit: (item: Account) => void;
  rowData: Account[];
  tableHeaders: TableHeader<Account>[];
  filterPaginationData: {
    totalCount: number;
    totalPages: number;
  };
  isTableLoading: boolean;
  onDelete: (
    item: Account,
    closeDialog: () => void,
    setIsLoading: Dispatch<SetStateAction<boolean>>,
  ) => void;
};

const AccountListing = ({
  onAddNew,
  onEdit,
  tableHeaders,
  rowData,
  filterPaginationData: { totalCount, totalPages },
  isTableLoading,
  onDelete,
}: Props) => {
  return (
    <>
      <div className="flex flex-col h-full gap-2 p-4">
        <ATMPageHeader
          heading="Accounts"
          buttonProps={{
            label: 'Add New',
            icon: IconPlus,
            onClick: onAddNew,
          }}
          hideButton={!isAuthorized('ACCOUNT_ADD')}
        />
        <Authorization permission="ACCOUNT_LIST">
          <div className="flex flex-col overflow-auto border rounded border-slate-300">
            {/* Table Toolbar */}
            <MOLFilterBar />

            <div className="flex-1 overflow-auto">
              <MOLTable<Account>
                tableHeaders={tableHeaders}
                data={rowData}
                getKey={(item) => item?._id}
                onEdit={isAuthorized('ACCOUNT_UPDATE') ? onEdit : undefined}
                onDelete={
                  isAuthorized('ACCOUNT_DELETE')
                    ? (item, closeDialog, setIsLoading) =>
                        onDelete(item, closeDialog, setIsLoading)
                    : undefined
                }
                isLoading={isTableLoading}
              />
            </div>

            {/* Pagination */}
            <ATMPagination
              totalPages={totalPages}
              rowCount={totalCount}
              rows={rowData}
            />
          </div>
        </Authorization>
      </div>
    </>
  );
};

export default AccountListing;
