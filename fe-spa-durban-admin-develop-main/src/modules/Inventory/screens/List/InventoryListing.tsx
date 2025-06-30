import { IconPlus } from '@tabler/icons-react';
import ATMPageHeader from 'src/components/atoms/ATMPageHeader/ATMPageHeader';
import ATMPagination from 'src/components/atoms/ATMPagination/ATMPagination';
import MOLFilterBar from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import MOLTable, {
  TableHeader,
} from 'src/components/molecules/MOLTable/MOLTable';
import { Inventory } from '../../models/Inventory.model';
import Authorization from 'src/components/Authorization/Authorization';

type Props = {
  rowData: Inventory[];
  tableHeaders: TableHeader<Inventory>[];
  filters: any;
  isLoading: boolean;
  filterPaginationData: {
    totalCount: number;
    totalPages: number;
  };
};

const InventoryListing = ({
  tableHeaders,
  rowData,
  filters,
  isLoading = false,
  filterPaginationData: { totalCount, totalPages },
}: Props) => {
  return (
    <>
      <div className="flex flex-col h-full gap-2 p-4">
        <ATMPageHeader heading="Inventory" hideButton />
        <Authorization permission="INVENTORY_LIST">
          <div className="flex flex-col overflow-auto border rounded border-slate-300">
            {/* Table Toolbar */}
            <MOLFilterBar
              // searchPlaceHolder="Search by product..."
              hideSearch={true}
              filters={filters}
            />

            <div className="flex-1 overflow-auto">
              <MOLTable<Inventory>
                tableHeaders={tableHeaders}
                data={rowData}
                getKey={(item) => item?._id}
                isLoading={isLoading}
              />
            </div>

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

export default InventoryListing;
