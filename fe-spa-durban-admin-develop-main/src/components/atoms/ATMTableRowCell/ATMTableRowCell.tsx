import { ReactNode } from 'react';
import {
  Align,
  Density,
  getAlignment,
  getPaddingY,
} from '../../molecules/MOLTable/MOLTable';

type Props<T> = {
  align?: Align;
  formatRowCell?: (rowData: T) => ReactNode | undefined;
  density?: Density;
  wrap?: boolean;
  data: T;
  fieldName?: string;
  compact: boolean;
  flex?: string;
  highlight?: boolean;
  stopPropagation?: boolean;
  extraClasses?: () => string;
  dataCellClasses?: () => string;
  loaderElement?: ReactNode;
  isLoading?: boolean;
};

const ATMTableRowCell = <T,>({
  align = 'start',
  density = 1,
  data,
  fieldName = '',
  wrap = false,
  formatRowCell,
  compact,
  flex = 'flex-[1_1_0%]',
  highlight = false,
  stopPropagation = false,
  extraClasses,
  dataCellClasses,
  loaderElement,
  isLoading = false,
}: Props<T>) => {
  const className = {
    dataCell: `min-w-[100px]  overflow-hidden text-ellipsis text-slate-700 transition-all duration-300 text-xs ${
      stopPropagation && 'cursor-default'
    } ${highlight && 'font-semibold'} ${flex} ${!compact && 'px-4'} ${
      !compact && getPaddingY(density)
    } ${extraClasses?.()} ${dataCellClasses?.()} `,
  };

  return (
    <div
      onClick={(e) => {
        stopPropagation && e.stopPropagation();
      }}
      className={`${className?.dataCell} ${getAlignment(align)?.text} ${
        !wrap && 'whitespace-nowrap text-nowrap'
      } `}
    >
      {isLoading
        ? loaderElement || (
            <div className="w-[90%] h-[20px] bg-gray-200 animate-pulse rounded-full"></div>
          )
        : formatRowCell
          ? formatRowCell(data)
          : (data as any)?.[fieldName]}
    </div>
  );
};

export default ATMTableRowCell;
