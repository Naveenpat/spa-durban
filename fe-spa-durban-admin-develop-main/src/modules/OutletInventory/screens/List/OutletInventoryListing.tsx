import ATMPageHeader from 'src/components/atoms/ATMPageHeader/ATMPageHeader';
import ATMPagination from 'src/components/atoms/ATMPagination/ATMPagination';
import MOLFilterBar from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import MOLTable, {
  TableHeader,
} from 'src/components/molecules/MOLTable/MOLTable';
import { OutletInventory } from '../../models/OutletInventory.model';
import Authorization from 'src/components/Authorization/Authorization';

type Props = {
  rowData: OutletInventory[];
  tableHeaders: TableHeader<OutletInventory>[];
  filters: any;
  filterPaginationData: {
    totalCount: number;
    totalPages: number;
  };
  isLoading: boolean;
};

const OutletInventoryListing = ({
  tableHeaders,
  rowData,
  filters,
  filterPaginationData: { totalCount, totalPages },
  isLoading = false,
}: Props) => {
  return (
    <>
      <div className="flex flex-col h-full gap-2 p-4">
        <ATMPageHeader heading="Outlet Inventory" hideButton />
        <Authorization permission="OUTLET_INVENTORY_LIST">
          <div className="flex flex-col overflow-auto border rounded border-slate-300">
            {/* Table Toolbar */}
            <MOLFilterBar
              searchPlaceHolder="Search by product..."
              hideSearch={true}
              filters={filters}
            />

            <div className="flex-1 overflow-auto">
              <MOLTable<OutletInventory>
                tableHeaders={tableHeaders}
                data={rowData}
                getKey={(item) => item?._id}
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

export default OutletInventoryListing;
