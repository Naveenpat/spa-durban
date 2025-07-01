import { IconPlus } from '@tabler/icons-react';
import ATMPageHeader from 'src/components/atoms/ATMPageHeader/ATMPageHeader';
import ATMPagination from 'src/components/atoms/ATMPagination/ATMPagination';
import MOLFilterBar from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import MOLTable, {
  TableHeader,
} from 'src/components/molecules/MOLTable/MOLTable';
import { PurchaseOrder } from '../../models/PurchaseOrder.model';
import { useNavigate } from 'react-router-dom';
import { isAuthorized } from 'src/utils/authorization';
import Authorization from 'src/components/Authorization/Authorization';

type Props = {
  onAddNew: () => void;
  onEdit: (item: PurchaseOrder) => void;
  onDelete: (item: PurchaseOrder, closeDialog: () => void) => void;
  rowData: PurchaseOrder[];
  tableHeaders: TableHeader<PurchaseOrder>[];
  filterPaginationData: {
    totalCount: number;
    totalPages: number;
  };
  isTableLoading: boolean;
};

const PurchaseOrderListing = ({
  onAddNew,
    onEdit,
  onDelete,
  tableHeaders,
  rowData,
  filterPaginationData: { totalCount, totalPages },
  isTableLoading = true,
}: Props) => {
  const navigate = useNavigate();
  return (
    <>
      <div className="flex flex-col h-full gap-2 p-4">
        <ATMPageHeader
          heading="Purchase Orders"
          buttonProps={{
            label: 'Add New',
            icon: IconPlus,
            onClick: onAddNew,
          }}
          hideButton={!isAuthorized('PURCHASE_ORDER_ADD')}
        />
        <Authorization permission="PURCHASE_ORDER_LIST">
          <div className="flex flex-col overflow-auto border rounded border-slate-300">
            {/* Table Toolbar */}
            <MOLFilterBar />

            <div className="flex-1 overflow-auto">
              <MOLTable<PurchaseOrder>
                tableHeaders={tableHeaders}
                data={rowData}
                getKey={(item) => item?._id}
                isLoading={isTableLoading}
                onRowClick={
                  isAuthorized('PURCHASE_ORDER_VIEW')
                    ? (item) => navigate(`/purchase-order/view/${item?._id}`)
                    : undefined
                }
                onEdit={isAuthorized('OUTLET_UPDATE') ? onEdit : undefined}
                onDelete={isAuthorized('OUTLET_DELETE') ? onDelete : undefined}
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

export default PurchaseOrderListing;
