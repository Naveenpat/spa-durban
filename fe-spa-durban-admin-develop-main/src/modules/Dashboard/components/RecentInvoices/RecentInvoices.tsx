import { IconRefresh } from '@tabler/icons-react';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';
import MOLTable, {
  TableHeader,
} from 'src/components/molecules/MOLTable/MOLTable';

type Props = {
  rowData: any[];
  tableHeaders: TableHeader<any>[];
  isLoading: boolean;
  fetch: () => void;
};

const RecentInvoices = ({ tableHeaders, rowData, isLoading, fetch }: Props) => {
  return (
    <>
      <div className="flex flex-col h-[500px] gap-2 p-2 bg-white">
        <div className="flex items-center justify-between text-sm font-semibold uppercase text-slate-400">
          <div>RECENT INVOICES</div>
          {/* <div className="flex items-center gap-1 text-xs text-white">
            <div>
              <div className="p-2 rounded-lg bg-primary-60"> Add Sale</div>
            </div>
            <div>
              <div className="p-2 bg-green-600 rounded-lg">Manage Invoices</div>
            </div>
            <div>
              <div className="p-2 bg-blue-600 rounded-lg"> POS</div>
            </div>
          </div> */}
          <div onClick={fetch} className="cursor-pointer ">
            {' '}
            <IconRefresh />
          </div>
        </div>

        <div className="flex flex-col overflow-auto border rounded border-slate-300">
          <div className="flex-1 overflow-auto ">
            <MOLTable<any>
              tableHeaders={tableHeaders}
              data={rowData}
              getKey={(item) => item?._id}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default RecentInvoices;
