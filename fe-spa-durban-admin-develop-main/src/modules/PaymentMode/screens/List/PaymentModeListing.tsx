import { IconPlus } from '@tabler/icons-react';
import ATMPageHeader from 'src/components/atoms/ATMPageHeader/ATMPageHeader';
import ATMPagination from 'src/components/atoms/ATMPagination/ATMPagination';
import MOLFilterBar from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import MOLTable, {
  TableHeader,
} from 'src/components/molecules/MOLTable/MOLTable';
import { PaymentMode } from '../../models/PaymentMode.model';
import { Dispatch, SetStateAction } from 'react';
import Authorization from 'src/components/Authorization/Authorization';
import { isAuthorized } from 'src/utils/authorization';

type Props = {
  onAddNew: () => void;
  onEdit: (item: any) => void;
  rowData: PaymentMode[];
  tableHeaders: TableHeader<PaymentMode>[];
  filterPaginationData: {
    totalCount: number;
    totalPages: number;
  };
  onDelete: (
    item: PaymentMode,
    closeDialog: () => void,
    setIsLoading: Dispatch<SetStateAction<boolean>>,
  ) => void;
  isTableLoading: boolean;
};

const PaymentModeListing = ({
  onAddNew,
  tableHeaders,
  onEdit,
  rowData,
  filterPaginationData: { totalCount, totalPages },
  isTableLoading,
  onDelete,
}: Props) => {
  return (
    <>
      <div className="flex flex-col h-full gap-2 p-4">
        <ATMPageHeader
          heading="Payment Modes"
          buttonProps={{
            label: 'Add New',
            icon: IconPlus,
            onClick: onAddNew,
          }}
          hideButton={!isAuthorized('PAYMENT_MODE_ADD')}
        />
        <Authorization permission="PAYMENT_MODE_LIST">
          <div className="flex flex-col overflow-auto border rounded border-slate-300">
            {/* Table Toolbar */}
            <MOLFilterBar />

            <div className="flex-1 overflow-auto">
              <MOLTable<PaymentMode>
                tableHeaders={tableHeaders}
                data={rowData}
                getKey={(item) => item?._id}
                onEdit={
                  isAuthorized('PAYMENT_MODE_UPDATE') ? onEdit : undefined
                }
                onDelete={
                  isAuthorized('PAYMENT_MODE_DELETE') ? onDelete : undefined
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

export default PaymentModeListing;
