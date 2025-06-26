import ATMPageHeader from 'src/components/atoms/ATMPageHeader/ATMPageHeader';
import ATMPagination from 'src/components/atoms/ATMPagination/ATMPagination';
import MOLFilterBar from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import MOLTable, {
  TableHeader,
} from 'src/components/molecules/MOLTable/MOLTable';
import { Invoices } from '../../models/Invoices.model';
import Authorization from 'src/components/Authorization/Authorization';
import { useLocation, useNavigate } from 'react-router-dom';

type Props = {
  rowData: Invoices[];
  tableHeaders: TableHeader<Invoices>[];
  isLoading: boolean;
  filter: any;
  filterPaginationData: {
    totalCount: number;
    totalPages: number;
  };
};

const InvoicesListing = ({
  tableHeaders,
  rowData,
  filter,
  isLoading = false,
  filterPaginationData: { totalCount, totalPages },
}: Props) => {
  return (
    <>
      <div className="flex flex-col h-full gap-2 p-4">
        <ATMPageHeader heading="Invoices" hideButton />
        <Authorization permission="INVOICE_LIST">
          <div className="flex flex-col overflow-auto border rounded border-slate-300">
            {/* Table Toolbar */}
            <MOLFilterBar searchPlaceHolder={'Search Invoice No...'} filters={filter} />

            <div className="flex-1 overflow-auto">
              <MOLTable<Invoices>
                isLoading={isLoading}
                tableHeaders={tableHeaders}
                data={rowData}
                getKey={(item) => item?._id}
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

export default InvoicesListing;
