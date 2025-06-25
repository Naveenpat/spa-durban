import { IconPlus } from '@tabler/icons-react';
import ATMPageHeader from 'src/components/atoms/ATMPageHeader/ATMPageHeader';
import ATMPagination from 'src/components/atoms/ATMPagination/ATMPagination';
import MOLFilterBar from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import MOLTable, {
  TableHeader,
} from 'src/components/molecules/MOLTable/MOLTable';
import { SalesComparisonList } from '../models/SalesComparison.model';
import Authorization from 'src/components/Authorization/Authorization';
import MOLFormDialog from 'src/components/molecules/MOLFormDialog/MOLFormDialog';

type Props = {
  rowData: {
    sales: any;
    outletName: string;
    totalSales: any;
    totalRefunds: any;
  };
  tableHeaders: TableHeader<SalesComparisonList>[];
  filterPaginationData: {
    totalCount: number;
    totalPages: number;
  };
  filter: any;
  isLoading: boolean;
  onClose: () => void;
};

const SalseReportLayoutWrapper = ({
  tableHeaders,
  rowData,
  filterPaginationData: { totalCount, totalPages },
  filter,
  isLoading,
  onClose
}: Props) => {
  const da = rowData?.sales;
  return (
    <MOLFormDialog
      title="Salse Report"
      onClose={onClose}
      isSubmitting={false}
      size={'medium'}
      isSubmitButtonHide={false}
    >
      <div style={{ textAlign: 'start' }}>
        <strong>Branch:</strong> {rowData?.outletName} |  <strong>Date:</strong> : {new Date().toLocaleDateString()} | <strong>Total: R </strong> {rowData?.totalSales || 0}
        {rowData?.totalRefunds ? <> | <strong>Refund:</strong> R {rowData?.totalRefunds}</> : ''}
      </div>


      <div className="flex flex-col h-full gap-2 p-4">
        <Authorization permission="SALES_COMPARISON_LIST">
          <div className="flex flex-col overflow-auto border rounded border-slate-300">
            {/* Table Toolbar */}
            <MOLFilterBar filters={filter} hideSearch />

            <div className="flex-1 overflow-auto">
              <MOLTable<SalesComparisonList>
                tableHeaders={tableHeaders}
                data={da}
                getKey={(item) => item?._id}
                freezeFirstColumn
                isLoading={isLoading}
              />
            </div>

            {/* Pagination */}
            {/* <ATMPagination
              totalPages={totalPages}
              rowCount={totalCount}
              rows={da}
            /> */}
          </div>

        </Authorization>
      </div>
    </MOLFormDialog>
  );
};

export default SalseReportLayoutWrapper;
