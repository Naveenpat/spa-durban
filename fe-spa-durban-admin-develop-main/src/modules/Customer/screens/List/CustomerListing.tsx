import { IconPlus } from '@tabler/icons-react';
import ATMPageHeader from 'src/components/atoms/ATMPageHeader/ATMPageHeader';
import ATMPagination from 'src/components/atoms/ATMPagination/ATMPagination';
import MOLFilterBar from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import MOLTable, {
  TableHeader,
} from 'src/components/molecules/MOLTable/MOLTable';
import { Customer } from '../../models/Customer.model';
import { isAuthorized } from 'src/utils/authorization';
import Authorization from 'src/components/Authorization/Authorization';
import GlobalImportExport from 'src/utils/GlobalImportExport';

type Props = {
  onAddNew: () => void;
  onEdit: (item: Customer) => void;
  onDelete: (item: Customer, closeDialog: () => void) => void;
  rowData: Customer[];
  tableHeaders: TableHeader<Customer>[];
  filterPaginationData: {
    totalCount: number;
    totalPages: number;
  };
  isLoading: boolean;
  exportEmployeeExcelSheet:any;
  importEmployeeExcelSheet:any;
};

const CustomerListing = ({
  onAddNew,
  onEdit,
  onDelete,
  tableHeaders,
  rowData,
  filterPaginationData: { totalCount, totalPages },
  isLoading = false,
  importEmployeeExcelSheet,
  exportEmployeeExcelSheet
}: Props) => {
  return (
    <>
      <div className="flex flex-col h-full gap-2 p-4">
        <ATMPageHeader
          heading="Customers"
          buttonProps={{
            label: 'Add New',
            icon: IconPlus,
            onClick: onAddNew,
          }}
          hideButton={!isAuthorized('CUSTOMER_ADD')}
        />
         <GlobalImportExport
          onImport={(file:any) => importEmployeeExcelSheet(file)}
          onExport={() => exportEmployeeExcelSheet()}
          showImport={true}
          showExport={true}
        />
        <Authorization permission="CUSTOMER_LIST">
          <div className="flex flex-col overflow-auto border rounded border-slate-300">
            {/* Table Toolbar */}
            <MOLFilterBar />

            <div className="flex-1 overflow-auto">
              <MOLTable<Customer>
                tableHeaders={tableHeaders}
                data={rowData}
                getKey={(item) => item?._id}
                onEdit={isAuthorized('CUSTOMER_UPDATE') ? onEdit : undefined}
                onDelete={
                  isAuthorized('CUSTOMER_DELETE') ? onDelete : undefined
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

export default CustomerListing;
