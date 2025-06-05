import { IconX } from '@tabler/icons-react';
import { ReactNode, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ATMMenu, { MenuProps } from '../../atoms/ATMMenu/ATMMenu';
import ATMSearchBox from '../../atoms/ATMSearchBox/ATMSearchBox';
import MOLFilterChip from '../MOLFilterChip/MOLFilterChip';
import ATMDateFilterChip from '../../atoms/ATMDateFilterChip/ATMDateFilterChip';
import { format } from 'date-fns';

type Option = { value: string; [field: string]: string };
type DropdownFilter = {
  filterType: 'multi-select' | 'single-select';
  fieldName?: string;
  label: string;
  options: Option[];
  renderOption: (option: Option) => ReactNode;
  isOptionEqualToSearchValue: (option: Option, value: string) => boolean;
};

type DateFilter = {
  filterType: 'date';
  fieldName?: string;
  dateFilterKeyOptions: { label: string; value: string }[];
};

export type FilterType = DropdownFilter | DateFilter;

type Props = {
  filters?: FilterType[];
  searchPlaceHolder?: string;
  actionMenu?: MenuProps;
  hideSearch?: Boolean;
  prefixer?: string;
};

const MOLFilterBar = ({
  filters,
  actionMenu,
  searchPlaceHolder = 'Search...',
  hideSearch = false,
  prefixer,
}: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState('');

  const keyName = {
    searchKey: prefixer ? `${prefixer}_q` : 'q',
    dateFilterKey: prefixer ? `${prefixer}_dateFilterKey` : 'dateFilterKey',
    startDate: prefixer ? `${prefixer}_startDate` : 'startDate',
    endDate: prefixer ? `${prefixer}_endDate` : 'endDate',
    page: prefixer ? `${prefixer}_page` : 'page',
  };

  useEffect(() => {
    setSearchValue(searchParams?.get(keyName?.searchKey) || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid grid-cols-[1fr_0fr_0fr] md:grid-cols-[0fr_1fr_0fr] gap-2 sticky left-0 items-center p-2.5 bg-white">
      {/* Search */}
      {hideSearch ? (
        <div></div>
      ) : (
        <div
          className={`md:min-w-[300px] ${
            actionMenu ? '' : 'max-sm:col-span-full'
          }`}
        >
          <ATMSearchBox
            value={searchValue}
            onChange={(e) => {
              if (e.target?.value?.trim()?.length > 0) {
                setSearchValue(e.target?.value);
              } else {
                setSearchValue('');
              }
            }}
            onClear={() => {
              setSearchValue('');
              searchParams.delete(keyName?.searchKey);
              setSearchParams(searchParams);
            }}
            placeholder={searchPlaceHolder}
            extraClasses="bg-white"
            autoFocused
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                if (searchValue) {
                  searchParams.set(keyName?.searchKey, searchValue?.trim());
                } else {
                  searchParams.delete(keyName?.searchKey);
                }
                searchParams.set(keyName?.page, '1');
                setSearchParams(searchParams);
              }
            }}
          />
        </div>
      )}

      {/* Filter Icon */}
      {/* <div
        onClick={() =>
          setSearchParams?.({ sports: JSON.stringify(["bd1", "cr1"]) })
        }
        className={`cursor-pointer bg-secondary-container  shadow rounded flex justify-center items-center aspect-square border border-primary-70 ${getHeight(
          "small"
        )} `}
      >
        <IconFilter className="text-secondary-onContainer" size={18} />
      </div> */}

      {/* Filters */}
      <div className="overflow-auto md:col-auto col-span-full">
        {filters?.length ? (
          <div className="flex items-center gap-2 overflow-x-auto hide-scroll ">
            <div className="flex flex-wrap gap-2 overflow-x-auto hide-scroll">
              {filters?.map((filter, filterIndex) => {
                switch (filter.filterType) {
                  case 'single-select':
                    return (
                      <MOLFilterChip<Option>
                        key={filterIndex}
                        label={filter.label}
                        items={filter.options}
                        renderOption={filter.renderOption}
                        onSelect={(item) => {
                          searchParams.set(keyName.page, '1');
                          searchParams.set(filter?.fieldName || '', item.value);
                          setSearchParams(searchParams);
                        }}
                        isItemSelected={(item) =>
                          searchParams.get(filter?.fieldName || '') ===
                          item.value
                        }
                        selectedItems={[
                          searchParams.get(filter?.fieldName || '') || '',
                        ]}
                        onClear={() => {
                          searchParams.delete(filter?.fieldName || '');
                          setSearchParams(searchParams);
                        }}
                        isOptionEqualToSearchValue={
                          filter?.isOptionEqualToSearchValue
                        }
                      />
                    );

                  case 'multi-select':
                    return (
                      <MOLFilterChip<Option>
                        key={filterIndex}
                        label={filter.label}
                        items={filter.options}
                        renderOption={filter.renderOption}
                        onSelect={(item) => {
                          searchParams.set(keyName.page, '1');
                          if (
                            (searchParams as any).has(
                              filter?.fieldName || '',
                              item.value,
                            )
                          ) {
                            (searchParams as any).delete(
                              filter?.fieldName || '',
                              item.value,
                            );

                            setSearchParams(searchParams);
                          } else {
                            searchParams.append(
                              filter?.fieldName || '',
                              item.value,
                            );
                            setSearchParams(searchParams);
                          }
                        }}
                        isItemSelected={(item) => {
                          return (
                            searchParams
                              ?.getAll(filter?.fieldName || '')
                              ?.includes(item.value) || false
                          );
                        }}
                        selectedItems={searchParams?.getAll(
                          filter?.fieldName || '',
                        )}
                        onClear={() => {
                          searchParams.delete(filter?.fieldName || '');
                          setSearchParams(searchParams);
                        }}
                        isOptionEqualToSearchValue={
                          filter?.isOptionEqualToSearchValue
                        }
                      />
                    );

                  case 'date':
                    return (
                      <ATMDateFilterChip
                        key={filterIndex}
                        startDate={searchParams.get(keyName?.startDate) || null}
                        endDate={searchParams.get(keyName?.endDate) || null}
                        onSelectStartDate={(newDate) => {
                          newDate &&
                            searchParams.set(
                              keyName?.startDate,
                              format(newDate, 'yyyy-MM-dd') || '',
                            );
                          setSearchParams(searchParams);
                        }}
                        onSelectEndDate={(newDate) => {
                          newDate &&
                            searchParams.set(
                              keyName?.endDate,
                              format(newDate, 'yyyy-MM-dd') || '',
                            );
                          setSearchParams(searchParams);
                        }}
                        onClear={() => {
                          searchParams.delete(keyName?.startDate);
                          searchParams.delete(keyName?.endDate);
                          setSearchParams(searchParams);
                        }}
                        // dateFilterKeys={[
                        //   {
                        //     label: 'Due',
                        //     onClick: () => {
                        //       searchParams.set(keyName?.dateFilterKey, 'due');
                        //       setSearchParams(searchParams);
                        //     },
                        //     isSelected: () =>
                        //       searchParams.get(keyName?.dateFilterKey) ===
                        //       'due',
                        //   },
                        //   {
                        //     label: 'Payment',
                        //     onClick: () => {
                        //       searchParams.set(
                        //         keyName?.dateFilterKey,
                        //         'payment',
                        //       );
                        //       setSearchParams(searchParams);
                        //     },
                        //     isSelected: () =>
                        //       searchParams.get(keyName?.dateFilterKey) ===
                        //       'payment',
                        //   },
                        // ]}
                      />
                    );

                  default:
                    return null;
                }
              })}
            </div>

            <div
              onClick={() => {
                filters
                  // ?.filter((el) => el.filterType !== 'date')
                  ?.forEach((filter) => {
                    searchParams.delete(filter?.fieldName || '');
                    searchParams.delete(keyName?.searchKey);
                    searchParams.delete(keyName?.startDate);
                    searchParams.delete(keyName?.endDate);
                  });

                setSearchParams(searchParams);
              }}
              className=" right-0 p-2.5 rounded-md bg-white hover:bg-gray-100 text-sm  text-nowrap cursor-pointer flex gap-1 items-center font-medium text-primary"
            >
              Reset <IconX size={18} />
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </div>

      {/* <div className="flex gap-2 overflow-auto md:col-auto col-span-full hide-scroll">
        {filters?.map((filter) => (
          <div className="relative flex items-center gap-1.5 py-1 px-3 pr-1 border rounded-full h-fit border-primary-90 hover:border-primary-20 bg-primary-99 ">
            <div className="flex-1 text-xs"> {filter?.label} </div>
            <div className="p-1 transition-all rounded-full cursor-pointer hover:bg-red-100 text-neutral-40 hover:text-red-400">
              <IconX onClick={() => onRemoveFilter?.(filter)} size={16} />
            </div>
          </div>
        ))}
      </div> */}

      {/* Action Button */}
      {/* <ATMButton className="border border-primary-70 bg-primaryContainer text-onPrimaryContainer ">
          Import
          </ATMButton>
          <ATMButton className="border border-primary-70 bg-secondary-container text-secondary-onContainer ">
          
        </ATMButton> */}

      {actionMenu ? (
        <div className="col-start-3 gap-2 max-sm:row-start-1 md:col-start-4 ">
          <ATMMenu items={actionMenu?.items}>{actionMenu.children}</ATMMenu>
        </div>
      ) : null}
    </div>
  );
};

export default MOLFilterBar;
