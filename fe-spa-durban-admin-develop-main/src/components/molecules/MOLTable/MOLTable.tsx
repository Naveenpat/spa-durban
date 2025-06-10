import { IconEdit, IconTrash } from '@tabler/icons-react';
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { PermissionType, isAuthorized } from '../../../utils/authorization';
import ATMTableHeaderCell from '../../atoms/ATMTableHeaderCell/ATMTableHeaderCell';
import ATMTableRowCell from '../../atoms/ATMTableRowCell/ATMTableRowCell';
import ATMCheckbox from '../../atoms/FormElements/ATMCheckbox/ATMCheckbox';
import { useSearchParams } from 'react-router-dom';
import ShowConfirmation from '../../../utils/ShowConfirmation';
import ATMDataNotFoundPage from '../../atoms/ATMDataNotFoundPage/ATMDataNotFoundPage';

export type Density = 1 | 2 | 3 | 4;
export type Align = 'start' | 'center' | 'end';
export type SortValue = 1 | -1;
export type SelectedState = 'ALL' | 'NONE' | 'PARTIAL';

export type TableHeader<T> = {
  fieldName?: keyof T;
  id?: string;
  headerName: string;
  compact?: boolean;
  formatHeader?: () => ReactNode;
  renderCell?: (item: T) => ReactNode;
  sortable?: boolean;
  sortKey?: string;
  wrap?: boolean;
  align?: Align;
  flex?: string;
  highlight?: boolean;
  omit?: boolean;
  stopPropagation?: boolean;
  extraClasses?: () => string;
  headerCellClasses?: () => string;
  dataCellClasses?: () => string;
  permissions?: PermissionType[];
  loaderElement?: ReactNode;
  render?: (row: T) => React.ReactNode;
};

type Props<T> = {
  tableHeaders: TableHeader<T>[];
  data: T[];
  stripped?: boolean;
  density?: Density;
  onSortChange?: (sortKey: string, sortValue: 1 | -1) => void;
  currentSortKey?: string;
  currentSortValue?: 1 | -1;
  freezeFirstColumn?: boolean;
  getKey: (item: T) => string;
  isCheckbox?: boolean;
  isRowSelected?: (item: T) => boolean;
  onRowClick?: (item: T) => void;
  onRowSelect?: (item: T, checked: boolean) => void;
  selectedState?: () => SelectedState;
  onSelectAll?: (selectedState: SelectedState) => void;
  disableRowSelection?: (item: T) => boolean;
  onEdit?: (item: T) => void;
  onDelete?: (
    item: T,
    closeDialog: () => void,
    setIsLoading: Dispatch<SetStateAction<boolean>>,
  ) => void;
  deleteConfirmationMessage?: (item: T) => string;
  isLoading?: boolean;
  noDataMessage?: string;
};

const permittedColumns = <T,>(columns: TableHeader<T>[]) => {
  return columns?.filter((column) => {
    return column?.permissions?.length
      ? column?.permissions?.every((permission) => isAuthorized(permission))
      : true;
  });
};

export const getPaddingY = (density: Density) => {
  switch (density) {
    case 4:
      return 'py-1';
    case 3:
      return 'py-2';
    case 2:
      return 'py-3';
    case 1:
      return 'py-3';
  }
};

export const getAlignment = (align: Align) => {
  switch (align) {
    case 'start':
      return {
        text: 'text-start',
        flex: 'justify-start',
      };
    case 'center':
      return {
        text: 'text-center',
        flex: 'justify-center',
      };
    case 'end':
      return {
        text: 'text-end',
        flex: 'justify-end',
      };

    default:
      break;
  }
};

const MOLTable = <T,>({
  tableHeaders: columns,
  data,
  density = 1,
  stripped = false,
  onSortChange,
  freezeFirstColumn = false,
  getKey,
  isCheckbox = false,
  isRowSelected,
  onRowSelect,
  selectedState = () => 'NONE',
  onSelectAll,
  onRowClick,
  disableRowSelection,
  onEdit,
  onDelete,
  deleteConfirmationMessage = () => 'Do you really want to delete ?',
  isLoading = false,
  noDataMessage = "We couldn't find any data",
}: Props<T>) => {
  const [searchParams] = useSearchParams();

  const className = {
    headerRow: `bg-[#fbfdf8] flex sticky top-0`,
    dataRow: `flex items-center bg-white hover:bg-gray-100 last:rounded-b ${
      stripped && 'odd:bg-gray-50'
    } ${onRowClick && 'cursor-pointer'}`,
  };

  const [tableHeaders, setTableHeaders] = useState(columns);

  useEffect(() => {
    setTableHeaders(permittedColumns(columns));
  }, [columns]);

  return (
    <div className="relative flex flex-col w-full h-full gap-2 overflow-auto">
      {/* Table */}
      <div className="border-gray-300 divide-y rounded min-w-fit">
        {/* Headers */}
        <div className={className?.headerRow}>
          {isCheckbox && (
            <div className={`px-2 ${getPaddingY(density)} `}>
              <ATMCheckbox
                checked={selectedState?.() !== 'NONE'}
                onChange={() => {
                  onSelectAll?.(selectedState());
                }}
                isPartialChecked={selectedState?.() === 'PARTIAL'}
              />
            </div>
          )}

          {freezeFirstColumn && !tableHeaders?.[0]?.omit && (
            <div
              className={`sticky bg-gray-200 shadow left-[1px] flex min-w-[100px] ${tableHeaders?.[0]?.extraClasses?.()} ${tableHeaders?.[0]?.headerCellClasses?.()} ${
                tableHeaders?.[0]?.flex || 'flex-[1_1_0%]'
              }`}
            >
              {tableHeaders?.slice(0, 1)?.map((header, headerIndex) => {
                return (
                  <ATMTableHeaderCell
                    key={headerIndex}
                    {...header}
                    density={density}
                  />
                );
              })}
            </div>
          )}
          {tableHeaders
            ?.slice(freezeFirstColumn ? 1 : 0)
            ?.map((header, headerIndex) => {
              return (
                !header?.omit && (
                  <ATMTableHeaderCell
                    key={headerIndex}
                    {...header}
                    density={density}
                  />
                )
              );
            })}

          {!isLoading && <div className={`min-w-[85px]`}></div>}
        </div>

        {/* Rows */}
        {isLoading || data?.length ? (
          (isLoading
            ? Array(Number(searchParams?.get('limit')) || 10)?.fill(null)
            : data
          )?.map((item, index) => {
            const isSelected = isRowSelected?.(item) as boolean;
            return (
              <div
                key={getKey?.(item) || index}
                className={`group group/action ${className?.dataRow} ${
                  isSelected && '!bg-primary-98'
                }`}
                onClick={() => onRowClick?.(item)}
              >
                {isCheckbox && (
                  <div className={`px-2 ${getPaddingY(density)} `}>
                    <ATMCheckbox
                      checked={isSelected}
                      onChange={() => {
                        onRowSelect?.(item, isSelected);
                      }}
                      disabled={disableRowSelection?.(item)}
                    />
                  </div>
                )}
                {freezeFirstColumn &&
                  tableHeaders?.slice(0, 1)?.map((header, headerIndex) => {
                    const {
                      fieldName,
                      align = 'start',
                      wrap,
                      renderCell,
                      compact = false,
                      flex,
                      highlight,
                      stopPropagation = false,
                      extraClasses,
                      dataCellClasses,
                      loaderElement,
                    } = header;
                    return (
                      !header?.omit && (
                        <div
                          className={`sticky left-[1px] bg-white group-odd:bg-gray-50 group-hover:bg-gray-100 shadow flex  min-w-[100px] ${extraClasses?.()} ${dataCellClasses?.()}  ${
                            tableHeaders?.[0]?.flex || 'flex-[1_1_0%]'
                          }`}
                        >
                          <ATMTableRowCell<T>
                            key={headerIndex}
                            data={item}
                            fieldName={fieldName as any}
                            align={align}
                            wrap={wrap}
                            density={density}
                            // formatRowCell={renderCell}
                            formatRowCell={header.render ?? renderCell}
                            compact={compact}
                            flex={flex}
                            highlight={highlight}
                            stopPropagation={stopPropagation}
                            extraClasses={extraClasses}
                            dataCellClasses={dataCellClasses}
                            loaderElement={loaderElement}
                            isLoading={isLoading}
                          />
                        </div>
                      )
                    );
                  })}

                {tableHeaders
                  ?.slice(freezeFirstColumn ? 1 : 0)
                  ?.map((header, headerIndex) => {
                    const {
                      fieldName,
                      align = 'start',
                      wrap,
                      renderCell,
                      compact = false,
                      flex,
                      highlight,
                      stopPropagation,
                      extraClasses,
                      dataCellClasses,
                      loaderElement,
                    } = header;
                    return (
                      !header?.omit && (
                        <ATMTableRowCell<T>
                          key={headerIndex}
                          data={item}
                          fieldName={fieldName as any}
                          align={align}
                          wrap={wrap}
                          density={density}
                          // formatRowCell={renderCell}
                           formatRowCell={header.render ?? renderCell}
                          compact={compact}
                          flex={flex}
                          highlight={highlight}
                          stopPropagation={stopPropagation}
                          extraClasses={extraClasses}
                          dataCellClasses={dataCellClasses}
                          loaderElement={loaderElement}
                          isLoading={isLoading}
                        />
                      )
                    );
                  })}

                {!isLoading && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className={`min-w-[85px] md:invisible md:group-hover/action:visible transition-all duration-75`}
                  >
                    <div className="flex items-center h-full gap-2 ">
                      {onEdit !== undefined && (
                        <button
                          type="button"
                          onClick={() => onEdit?.(item)}
                          className="p-2 rounded-full text-primary-onContainer bg-secondary-container "
                        >
                          <IconEdit className="size-[1rem]" />
                        </button>
                      )}
                      {onDelete !== undefined && (
                        <button
                          type="button"
                          onClick={() => {
                            ShowConfirmation({
                              title: 'Are you sure ?',
                              message: deleteConfirmationMessage?.(item),
                              onConfirm: (closeDialog, setIsLoading) =>
                                onDelete(item, closeDialog, setIsLoading),
                            });
                          }}
                          className="p-2 rounded-full bg-error-90 text-error"
                        >
                          <IconTrash className="size-[1rem]" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <ATMDataNotFoundPage message={noDataMessage} />
        )}
      </div>
    </div>
  );
};

export default MOLTable;
