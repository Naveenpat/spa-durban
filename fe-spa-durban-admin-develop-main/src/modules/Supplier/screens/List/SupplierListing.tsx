import { IconPlus } from '@tabler/icons-react';
import ATMPageHeader from 'src/components/atoms/ATMPageHeader/ATMPageHeader';
import ATMPagination from 'src/components/atoms/ATMPagination/ATMPagination';
import MOLFilterBar from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import MOLTable, {
  TableHeader,
} from 'src/components/molecules/MOLTable/MOLTable';
import { Supplier } from '../../models/Supplier.model';
import { isAuthorized } from 'src/utils/authorization';
import Authorization from 'src/components/Authorization/Authorization';

type Props = {
  onAddNew: () => void;
  onEdit: (item: Supplier) => void;
  onDelete: (item: Supplier, closeDialog: () => void) => void;
  rowData: Supplier[];
  tableHeaders: TableHeader<Supplier>[];
  filterPaginationData: {
    totalCount: number;
    totalPages: number;
  };
  isLoading: boolean;
};

const SupplierListing = ({
  onAddNew,
  tableHeaders,
  onEdit,
  onDelete,
  rowData,
  filterPaginationData: { totalCount, totalPages },
  isLoading,
}: Props) => {
  return (
    <>
      <div className="flex flex-col h-full gap-2 p-4">
        <ATMPageHeader
          heading="Suppliers"
          buttonProps={{
            label: 'Add New',
            icon: IconPlus,
            onClick: onAddNew,
          }}
          hideButton={!isAuthorized('SUPPLIER_ADD')}
        />
        <Authorization permission="SUPPLIER_LIST">
          <div className="flex flex-col overflow-auto border rounded border-slate-300">
            {/* Table Toolbar */}
            <MOLFilterBar />

            <div className="flex-1 overflow-auto">
              <MOLTable<Supplier>
                tableHeaders={tableHeaders}
                data={rowData}
                getKey={(item) => item?.supplierName}
                onEdit={isAuthorized('SUPPLIER_UPDATE') ? onEdit : undefined}
                onDelete={
                  isAuthorized('SUPPLIER_DELETE') ? onDelete : undefined
                }
                isLoading={isLoading}
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

export default SupplierListing;
