import { IconPlus } from '@tabler/icons-react';
import ATMPageHeader from 'src/components/atoms/ATMPageHeader/ATMPageHeader';
import ATMPagination from 'src/components/atoms/ATMPagination/ATMPagination';
import MOLFilterBar from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import MOLTable, {
  TableHeader,
} from 'src/components/molecules/MOLTable/MOLTable';
import { Employee } from '../../models/Employee.model';
import { Dispatch, SetStateAction } from 'react';
import { isAuthorized } from 'src/utils/authorization';
import Authorization from 'src/components/Authorization/Authorization';
import GlobalImportExport from 'src/utils/GlobalImportExport';

type Props = {
  onAddNew: () => void;
  onEdit: (item: any) => void;
  rowData: Employee[];
  tableHeaders: TableHeader<Employee>[];
  filterPaginationData: {
    totalCount: number;
    totalPages: number;
  };
  onDelete: (
    item: Employee,
    closeDialog: () => void,
    setIsLoading: Dispatch<SetStateAction<boolean>>,
  ) => void;
  isTableLoading: boolean;
  filter: any;
  importEmployeeExcelSheet: any;
  exportEmployeeExcelSheet: any;
};

const EmployeeListing = ({
  onAddNew,
  onEdit,
  tableHeaders,
  rowData,
  filterPaginationData: { totalCount, totalPages },
  isTableLoading,
  filter,
  onDelete,
  importEmployeeExcelSheet,
  exportEmployeeExcelSheet
}: Props) => {
  return (
    <>
      <div className="flex flex-col h-full gap-2 p-4">

        <ATMPageHeader
          heading="Employee"
          buttonProps={{
            label: 'Add New',
            icon: IconPlus,
            onClick: onAddNew,
          }}
          hideButton={!isAuthorized('EMPLOYEE_ADD')}
        />

        <Authorization permission="EMPLOYEE_LIST">
          <div className="flex flex-col overflow-auto border rounded border-slate-300">
            <div className="flex flex-wrap items-center justify-between gap-4 mr-2">
              {/* Left Side: Filter Bar + Start/End Date */}
              <div className="flex flex-wrap items-end gap-4">
                <MOLFilterBar filters={filter} />

              </div>
              {/* Right Side: Import/Export Buttons */}
              <div>
                <GlobalImportExport
                  onImport={(file: any) => importEmployeeExcelSheet(file)}
                  onExport={() => exportEmployeeExcelSheet()}
                  showImport={true}
                  showExport={true}
                />
              </div>
            </div>


            <div className="flex-1 overflow-auto">
              <MOLTable<Employee>
                tableHeaders={tableHeaders}
                data={rowData}
                getKey={(item) => item?._id}
                onEdit={isAuthorized('EMPLOYEE_UPDATE') ? onEdit : undefined}
                onDelete={
                  isAuthorized('EMPLOYEE_DELETE')
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

export default EmployeeListing;
