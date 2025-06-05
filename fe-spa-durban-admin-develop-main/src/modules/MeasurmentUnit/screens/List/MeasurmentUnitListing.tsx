import { IconPlus } from '@tabler/icons-react';
import ATMPageHeader from 'src/components/atoms/ATMPageHeader/ATMPageHeader';
import ATMPagination from 'src/components/atoms/ATMPagination/ATMPagination';
import MOLFilterBar from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import MOLTable, {
  TableHeader,
} from 'src/components/molecules/MOLTable/MOLTable';
import { MeasurmentUnit } from '../../models/MeasurmentUnit.model';
import { isAuthorized } from 'src/utils/authorization';
import Authorization from 'src/components/Authorization/Authorization';

type Props = {
  onAddNew: () => void;
  onEdit: (item: MeasurmentUnit) => void;
  onDelete: (item: MeasurmentUnit, closeDialog: () => void) => void;
  rowData: MeasurmentUnit[];
  tableHeaders: TableHeader<MeasurmentUnit>[];
  filterPaginationData: {
    totalCount: number;
    totalPages: number;
  };
  isLoading: boolean;
};

const MeasurmentUnitListing = ({
  onAddNew,
  onEdit,
  onDelete,
  tableHeaders,
  rowData,
  filterPaginationData: { totalCount, totalPages },
  isLoading = false,
}: Props) => {
  return (
    <>
      <div className="flex flex-col h-full gap-2 p-4">
        <ATMPageHeader
          heading="Measurment Units"
          buttonProps={{
            label: 'Add New',
            icon: IconPlus,
            onClick: onAddNew,
          }}
          hideButton={!isAuthorized('MEASURMENT_UNIT_ADD')}
        />
        <Authorization permission="MEASURMENT_UNIT_LIST">
          <div className="flex flex-col overflow-auto border rounded border-slate-300">
            {/* Table Toolbar */}
            <MOLFilterBar />

            <div className="flex-1 overflow-auto">
              <MOLTable<MeasurmentUnit>
                tableHeaders={tableHeaders}
                data={rowData}
                getKey={(item) => item?._id}
                onEdit={
                  isAuthorized('MEASURMENT_UNIT_UPDATE') ? onEdit : undefined
                }
                onDelete={
                  isAuthorized('MEASURMENT_UNIT_DELETE') ? onDelete : undefined
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

export default MeasurmentUnitListing;
