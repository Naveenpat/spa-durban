import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
interface ATMPaginationPropTypes {
  rowCount: number;
  rowsPerPageOptions?: number[];
  rows: any[];
  hideRowsPerPage?: boolean;
  totalPages: number;
  prefixer?: string;
}

const ATMPagination: React.FC<ATMPaginationPropTypes> = ({
  rows,
  rowCount,
  rowsPerPageOptions = [10, 20, 50, 100],
  totalPages,
  prefixer,
}: ATMPaginationPropTypes) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(
    searchParams.get(prefixer ? `${prefixer}_page` : 'page'),
  );
  const rowsPerPage = Number(
    searchParams.get(prefixer ? `${prefixer}_limit` : 'limit'),
  );

  const handlePageChange = (action: 'increment' | 'decrement') => {
    action === 'increment'
      ? searchParams.set(
          prefixer ? `${prefixer}_page` : 'page',
          `${currentPage + 1}`,
        )
      : searchParams.set(
          prefixer ? `${prefixer}_page` : 'page',
          `${currentPage - 1}`,
        );

    setSearchParams(searchParams);
  };

  return (
    <div
      className={`flex items-center justify-between gap-2 p-2 border-t ${
        rows?.length ? '' : 'hidden'
      }`}
    >
      <div className="text-xs text-slate-700">
        <p>
          {rowsPerPage * (currentPage - 1) + 1}-
          {rowsPerPage * (currentPage - 1) + rows.length} of {rowCount}
        </p>
      </div>
      <div className="flex items-center gap-2 text-slate-700 ">
        <select
          value={rowsPerPage}
          onChange={(e) => {
            searchParams?.set(
              prefixer ? `${prefixer}_limit` : 'limit',
              e.target.value,
            );
            searchParams?.set(prefixer ? `${prefixer}_page` : 'page', '1');
            setSearchParams(searchParams);
          }}
          className={` border bg-gray-200 rounded-md p-1 text-xs`}
        >
          {rowsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1 text-xs rounded-lg ">
          <select
            value={currentPage}
            onChange={(e) => {
              searchParams?.set(
                prefixer ? `${prefixer}_page` : 'page',
                e.target.value,
              );
              setSearchParams(searchParams);
            }}
            className="p-1 text-xs bg-gray-200 border rounded-md"
          >
            {Array(totalPages)
              .fill(null)
              ?.map((_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1}
                </option>
              ))}
          </select>
          of {totalPages} pages
        </div>

        <button
          type="button"
          onClick={() => {
            handlePageChange('decrement');
          }}
          disabled={currentPage === 1}
          className={`outline-0 font-medium text-slate-700 p-1 bg-gray-200 rounded-md shadow `}
        >
          <IconChevronLeft size={18} />
        </button>

        <button
          type="button"
          onClick={() => handlePageChange('increment')}
          disabled={currentPage === totalPages}
          className={`outline-0 font-medium text-slate-700 p-1 bg-gray-200 rounded-md shadow `}
        >
          <IconChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default ATMPagination;
