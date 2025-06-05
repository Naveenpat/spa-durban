import React, { ReactElement, ReactNode } from 'react';
import {
  Align,
  Density,
  SortValue,
  getAlignment,
  getPaddingY,
} from '../../molecules/MOLTable/MOLTable';
import { IconCaretDownFilled, IconCaretUpFilled } from '@tabler/icons-react';
import { useSearchParams } from 'react-router-dom';

const SortIcon: (props: { sortValue: SortValue }) => ReactElement = ({
  sortValue,
}) => {
  return (
    <div className="flex flex-col">
      <IconCaretUpFilled
        size={16}
        className={`-mb-[4px] ${
          sortValue === -1 ? 'text-slate-700' : 'text-slate-400'
        }`}
      />
      <IconCaretDownFilled
        size={16}
        className={`-mt-[4px] ${
          sortValue === 1 ? 'text-slate-700' : 'text-slate-400'
        }`}
      />
    </div>
  );
};

type Props = {
  headerName: string;
  sortable?: boolean;
  sortKey?: string;
  align?: Align;
  formatHeader?: () => ReactNode;
  density?: Density;
  flex?: string;
  extraClasses?: () => string;
  headerCellClasses?: () => string;
};

const ATMTableHeaderCell = ({
  sortable,
  sortKey = '',
  align = 'start',
  formatHeader,
  headerName,
  density = 1,
  flex = 'flex-[1_1_0%]',
  extraClasses,
  headerCellClasses,
}: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const className = {
    headerCell: `flex gap-1 items-center min-w-[100px] px-4 font-semibold tracking-wide  transition-all duration-300 text-xs text-primary uppercase ${flex} ${getPaddingY(
      density,
    )} ${extraClasses?.()} ${headerCellClasses?.()}`,
  };

  const handleSort = (sortBy: string, value: '1' | '-1') => {
    if (sortable) {
      searchParams?.set('sortBy', sortBy);
      searchParams?.set('sortOrder', value);
      setSearchParams(searchParams);
    }
  };

  return (
    <div
      onClick={() => {
        sortable &&
          handleSort?.(
            sortKey,
            searchParams?.get('sortOrder') === '1' ? '-1' : '1',
          );
      }}
      className={`${className?.headerCell} ${getAlignment(align)?.flex} ${
        sortKey === searchParams?.get('sortBy') && 'bg-primary-90'
      }  `}
    >
      {formatHeader ? formatHeader?.() : headerName}
      {sortable && sortKey === searchParams?.get('sortBy') && (
        <SortIcon
          sortValue={Number(searchParams?.get('sortOrder')) as SortValue}
        />
      )}
    </div>
  );
};

export default ATMTableHeaderCell;
