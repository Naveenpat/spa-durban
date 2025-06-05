import { IconPlus } from '@tabler/icons-react';
import ATMPageHeader from 'src/components/atoms/ATMPageHeader/ATMPageHeader';
import ATMPagination from 'src/components/atoms/ATMPagination/ATMPagination';
import MOLFilterBar from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import MOLTable, {
  TableHeader,
} from 'src/components/molecules/MOLTable/MOLTable';
import { Tax } from '../../models/Tax.model';
import { Dispatch, SetStateAction } from 'react';
import Authorization from 'src/components/Authorization/Authorization';
import { isAuthorized } from 'src/utils/authorization';

type Props = {
  onAddNew: () => void;
  onEdit: (item: any) => void;
  rowData: Tax[];
  tableHeaders: TableHeader<Tax>[];
  filterPaginationData: {
    totalCount: number;
    totalPages: number;
  };
  isTableLoading: boolean;
  onDelete: (
    item: Tax,
    closeDialog: () => void,
    setIsLoading: Dispatch<SetStateAction<boolean>>,
  ) => void;
};

const TaxListing = ({
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
          heading="Taxes"
          buttonProps={{
            label: 'Add New',
            icon: IconPlus,
            onClick: onAddNew,
          }}
          hideButton={!isAuthorized('TAX_ADD')}
        />
        <Authorization permission="TAX_LIST">
          <div className="flex flex-col overflow-auto border rounded border-slate-300">
            {/* Table Toolbar */}
            <MOLFilterBar />

            <div className="flex-1 overflow-auto">
              <MOLTable<Tax>
                tableHeaders={tableHeaders}
                data={rowData}
                getKey={(item) => item?._id}
                onEdit={isAuthorized('TAX_UPDATE') ? onEdit : undefined}
                onDelete={
                  isAuthorized('TAX_DELETE')
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

export default TaxListing;
