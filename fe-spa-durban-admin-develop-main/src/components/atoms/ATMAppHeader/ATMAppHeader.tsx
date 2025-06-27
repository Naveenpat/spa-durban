import {
  IconBan,
  IconCashBanknote,
  IconCopyX,
  IconCreditCardRefund,
  IconDotsVertical,
  IconHome,
  IconKey,
  IconLogout,
  IconMenu2,
  IconPrinter,
  IconUserPause,
} from '@tabler/icons-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ChangePasswordFormLayoutWrapper from 'src/modules/UserProfile/changePassword/ChangePasswordFormLayoutWrapper';
import SalseReportLayoutWrapper from 'src/modules/salesComparison/dailyReports/SalseReportLayoutWrapper';
import { resetState, setIsLogin, setOutlet } from '../../../slices/AuthSlice';
import { setIsNavBarExpanded } from '../../../slices/SideNavLayoutSlice';
import { AppDispatch, RootState } from '../../../store';
import { clearlocalStorage } from '../../../utils/auth/authUtils';
import ATMSelect from '../FormElements/ATMSelect/ATMSelect';
import { useFetchData } from 'src/hooks/useFetchData';
import { salesComparisonApi, useGetSalesReportDailyQuery } from 'src/modules/salesComparison/service/SalesComparisonServices';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import OpenRegisterFormWrapper from 'src/modules/OpenRegister/screens/Add/AddOpenRegisterFormWrapper';
import {
  setIsOpenAddDialog,
  setIsCloseAddDialog,
} from 'src/modules/OpenRegister/slice/OpenRegisterSlice';

import { format } from 'date-fns';
import { CURRENCY } from 'src/utils/constants';
import { SalesReport } from 'src/modules/Invoices/models/Invoices.model';
import ATMMenu from '../ATMMenu/ATMMenu';
import { setIsOpenEditDialog } from 'src/modules/Product/slice/ProductSlice';
import { useUpdateInvoiceMutation } from 'src/modules/Invoices/service/InvoicesServices';
import { showToast } from 'src/utils/showToaster';
import { IconArrowRight } from '@tabler/icons-react';
import { isAuthorized } from 'src/utils/authorization';
import { Tooltip } from '@mui/material';
type Props = {
  hideCollapseMenuButton?: boolean;
  showOutletDropdown?: boolean;
  showRegisterbutton?: boolean;
};

const ATMAppHeader = ({
  hideCollapseMenuButton = false,
  showOutletDropdown = false,
  showRegisterbutton = false,
}: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isNavBarExpanded } = useSelector(
    (state: RootState) => state.sideNavLayout,
  );
  const { userData, outlet, outlets, permissions } = useSelector(
    (state: RootState) => state.auth,
  );

  const { isOpenEditDialog } = useSelector(
    (state: RootState) => state?.invoices,
  );


  // console.log('-----userData', userData)


  const [storeOutletId, setStoreOutletId] = useState<string>();
  const [invoiceId, setInvoiceId] = useState('');
  const [isSearch, setIsSearch] = useState(true);
  // console.log('--isSearch', isSearch)
  // const [getSalesReportDaily] = useGetSalesReportDailyQuery();
  // const { data, isLoading, totalData, totalPages } = useFetchData(
  //   useGetSalesReportDailyQuery,
  //   { outletId: storeOutletId },
  //   { skip: !storeOutletId }
  // );

  const { data, isLoading, refetch, totalData, totalPages } = useFetchData(useGetSalesReportDailyQuery, {
    body: {

      outletId: (outlet as any)?._id,
    },
    options: {
      skip: !isSearch,
    },
  });






  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const storeId = searchParams.get('storeId');

  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isOpenChangePasswordDialog, setIsOpenChangePassword] = useState(false);
  const [isOpenSalseReportDialog, setIsOpenSalseReportDialog] = useState(false);
  const [isOpenRegistertDialog, setIsOpenRegistertDialog] = useState(false);

  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });
  const buttonRef = useRef<HTMLDivElement>(null);
  const [updateInvoice] = useUpdateInvoiceMutation();

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (buttonRef.current && !buttonRef?.current?.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  // useEffect(() => {
  //   const store_id = localStorage.getItem('store_id')
  //   if (store_id) {
  //     const outletId = outlets?.find(
  //       (item, index) => item.bookingStoreId === store_id,
  //     );

  //     dispatch(setOutlet(outletId));
  //   }
  // }, [storeId]);

  //   useEffect(() => {
  //   if (isSearch && outlet?._id) {
  //     refetch(); // manually refetch data
  //   }
  // }, [outlet, isSearch]);


  // Step 1: When location or outlets change, set outlet info
  useEffect(() => {
    const urlStoreId = searchParams.get('storeId');
    const localStoreId = localStorage.getItem('store_Id');
    const finalStoreId = urlStoreId || localStoreId;

    if (finalStoreId && outlets?.length) {
      const outlet = outlets.find(
        (item) => item.bookingStoreId === finalStoreId
      );
      if (outlet) {
        dispatch(setOutlet(outlet));
        if (urlStoreId) {
          localStorage.setItem('store_Id', urlStoreId);
        }
        setStoreOutletId(outlet?._id); // triggers next effect
        setIsSearch(true);             // triggers next effect
      }
    }
  }, [location.pathname, outlets]);

  // Step 2: Trigger API when both `storeOutletId` and `isSearch` are valid
  useEffect(() => {
    if (storeOutletId && isSearch && isOpenSalseReportDialog) {
      refetch(); // or whatever function you use to fetch
    }
  }, [storeOutletId, isSearch, isOpenSalseReportDialog]);




  const togglePortal = (e: any) => {
    const buttonRect = e.currentTarget.getBoundingClientRect();

    setDropdownPosition({
      top: buttonRect.bottom + 4,
      right: document.body.getBoundingClientRect().width - buttonRect.right,
    });
    setDropdownOpen(!dropdownOpen);
  };

  const handleSignOut = useCallback(() => {
    clearlocalStorage();
    dispatch(resetState(''));
    dispatch(setIsLogin(false));
    navigate('/login');
  }, [dispatch, navigate]);

  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate],
  );


  const currentPath = location.pathname.split('/')[1];
  const safeData = data ?? [];

  // const yearMonths = Array.from(
  //   new Set(
  //     safeData?.flatMap((outlet: any) =>
  //       outlet?.sales.map(
  //         (sale: any) => sale?.yearMonth || sale?.week || sale?.date,
  //       ),
  //     ),
  //   ),
  // );

  const handleUpdate = async (item: any) => {
    try {
      await updateInvoice({
        invoiceId: item?._id,
        body: { status: item?.status === "" ? 'refund' : "" },
      }).unwrap();
      // alert('Invoice updated successfully!');
      refetch();
      if (item?.status == "refund") {
        showToast('success', 'Unrefund Process successfully!')

      }
      else {
        showToast('success', 'Refund Process successfully!')
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      // alert('Failed to update invoice.');

      showToast('error', 'Failed to update invoice.')
    }
  };

  const handleCancelVoidWithConfirmation = (invoiceId: any) => {
    updateInvoice({ body: { status: "", voidNote: "" }, invoiceId }).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message)
      } else {
        if (res?.data?.status) {
          refetch();
          showToast('success', res?.data?.message)
        } else {
          showToast('error', res?.data?.message)
        }
      }
    });
  }

  const toTitleCase = (str: string = '') => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };


  const tableHeaders: TableHeader<any>[] = [
    {
      fieldName: 'invoiceNumber',
      headerName: 'invoice',
      flex: 'flex-[1_1_0%]',
    },
    {
      fieldName: 'customerName',
      headerName: 'Customer',
      flex: 'flex-[3_1_0%]',
      renderCell: (row: any) => toTitleCase(row.customerName),
    },
    {
      fieldName: 'paymentMode',
      headerName: 'Mode',
      flex: 'flex-[2_1_0%]',
      renderCell: (row: any) => toTitleCase(row.paymentMode),
    },
    {
      fieldName: 'totalAmount',
      headerName: 'Total',
      flex: 'flex-[1_1_0%]',
      renderCell: (item) => (
        <div>
          {' '}
          {CURRENCY}{' '}
          {item?.totalAmount ? Number(item?.totalAmount).toFixed(2) : '0'}
        </div>
      ),
    },
    {
      fieldName: 'date',
      headerName: 'Date',
      flex: 'flex-[2_1_0%]',
      renderCell: (row: any) => toTitleCase(row.date),
    },
    {
      fieldName: 'status',
      headerName: 'Status',
      align: 'center',
      flex: 'flex-[1_1_0%]',
      renderCell: (item) => (
        <div>
          {item.status && item.status.trim() !== '' ? (
            <span className="text-red-700 bg-red-100 py-[3px] font-medium px-2 rounded-lg border-slate-300">
              {item.status}
            </span>
          ) : item?.balanceDue > 0 ? (
            <span className="text-yellow-700 bg-yellow-100 py-[3px] font-medium px-2 rounded-lg border-slate-300">
              Unpaid
            </span>
          ) : (
            <span className="text-green-700 bg-green-100 py-[3px] font-medium px-2 rounded-lg border-slate-300">
              Paid
            </span>
          )}
        </div>
      ),
    },
    {
      fieldName: 'action',
      headerName: 'Action',
      flex: 'flex-[1_1_0%]',
      renderCell: (item: SalesReport) => (
        <div className="flex items-center gap-2">
          <Tooltip title="View" arrow>
            <button
              type="button"

              onClick={() =>
                navigate(`/invoice/receipt/${item?._id}`, {
                  state: { from: location },
                })
              }
              className="text-blue-600 hover:text-blue-800"
            >
              <IconPrinter size={18} />
            </button>
          </Tooltip>

          <Tooltip title={item?.status === 'refund' ? 'Cancel Refund' : 'Refund'} arrow>
            <button
              type="button"
              onClick={() => handleUpdate(item)}
              className="text-green-600 hover:text-green-800"
            >
              <IconCreditCardRefund size={18} />
            </button>
          </Tooltip>
        </div>
      ),
    }
  ];

  // const tableHeaders: TableHeader<any>[] = [
  //   {
  //     fieldName: 'outletName',
  //     headerName: 'Name',
  //     flex: 'flex-[1_1_0%]',
  //     extraClasses: () => ' capitalize',
  //   },
  //   ...yearMonths?.map((yearMonth: string) => ({
  //     fieldName: yearMonth,
  //     headerName: yearMonth,
  //     flex: 'flex-[1_0_0%]',
  //     extraClasses: () => 'min-w-[210px]',
  //     renderCell: (row: any) => {
  //       const sale = row?.sales.find(
  //         (sale: any) =>
  //           sale?.yearMonth === yearMonth ||
  //           sale?.week === yearMonth ||
  //           sale.date === yearMonth,
  //       );
  //       return <div>{sale?.totalSales && sale?.totalSales.toFixed(2)}</div>;
  //     },
  //   })),
  // ];

  const isPOS = location.pathname === '/pos'

  return (
    <div className="flex items-center justify-between h-full px-4 border-b bg-gray-50">
      <div className="flex items-center gap-4">
        {!hideCollapseMenuButton && (
          <button
            type="button"
            onClick={() => dispatch(setIsNavBarExpanded(!isNavBarExpanded))}
            className={`text-primary-dark ${isNavBarExpanded ? 'text-primary-darker' : ''}`}
          >
            <IconMenu2 />
          </button>
        )}
        <img
          src="/logo-header.png"
          alt="logo"
          className="w-[165px] h-[48px] text-center"
        />
      </div>



      {showRegisterbutton && (
        <div className="flex items-center gap-4">
          <button
            type="button"
            style={{
              height: '35px',
              fontSize: '11px',
              width: '125px',
            }}
            onClick={() => dispatch(setIsOpenAddDialog(true))}
            className="font-semibold rounded-lg w-full h-full flex items-center justify-center text-sm px-4 transition-all duration-300 shadow bg-primary text-white border border-primary hover:bg-primary-30"
          >
            <span>Open Registers</span>
          </button>
          <button
            type="button"
            style={{
              height: '35px',
              fontSize: '11px',
              width: '125px',
            }}
            onClick={() => dispatch(setIsCloseAddDialog(true))}
            className="font-semibold rounded-lg w-full h-full flex items-center justify-center text-sm px-4 transition-all duration-300 shadow bg-primary text-white border border-primary hover:bg-primary-30"
          >
            <span>Close Registers</span>
          </button>
          <button
            type="button"
            style={{
              height: '35px',
              fontSize: '11px',
              width: '125px',
            }}
            className="font-semibold rounded-lg w-full h-full flex items-center justify-center text-sm px-4 transition-all duration-300 shadow bg-primary text-white border border-primary hover:bg-primary-30"
            onClick={() => setIsOpenSalseReportDialog(true)}
          >
            <span>Sales Reporting</span>
          </button>
        </div>
      )}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              // navigate(isPOS ? '/dashboard' : '/pos');
              const canNavigate = isPOS
                ? isAuthorized('NAV_DASHBOARD')
                : isAuthorized('NAV_POS');

              if (canNavigate) {
                navigate(isPOS ? '/dashboard' : '/pos');
              } else {
                showToast("error", 'You are not authorized to access this page.');
              }
            }}
            type="button"
            style={{
              height: '35px',
              fontSize: '11px',
              width: '125px',
            }}
            className="font-semibold rounded-lg w-full h-full flex items-center justify-center text-sm px-4 transition-all duration-300 shadow bg-primary text-white border border-primary hover:bg-primary-30"
          >
            {isPOS ? <IconHome size={16} className="mr-1" /> : <IconCashBanknote size={16} className="mr-1" />}
            {isPOS ? 'Dashboard' : 'POS'}
          </button>

        </div>
        {(userData?.userType === 'EMPLOYEE' || showOutletDropdown) && (
          <div className="w-[300px]">
            <ATMSelect
              value={outlet}
              onChange={(newValue) => {
                dispatch(setOutlet(newValue))
                localStorage.setItem('store_Id', newValue.bookingStoreId)
              }}
              options={outlets}
              valueAccessKey="_id"
              getOptionLabel={(option) => option?.name}
              placeholder="Please Select Type"
              isClearable={false}
            />
          </div>
        )}
        <div className="relative" onClick={(e) => togglePortal(e)}>
          <div className="size-[30px] bg-primary flex justify-center items-center text-white font-medium rounded-full text-xs capitalize cursor-pointer">
            {userData?.name?.[0]}
          </div>

          {dropdownOpen &&
            createPortal(
              <div
                ref={buttonRef}
                style={{
                  top: dropdownPosition.top,
                  right: dropdownPosition.right,
                }}
                className="absolute bg-white border border-gray-200 rounded-md w-[250px] z-[100000]"
              >
                <div className="flex items-center gap-2 p-2 capitalize bg-gray-100">
                  <div className="size-[25px] bg-primary flex justify-center items-center text-white font-medium rounded text-xs capitalize">
                    {userData?.name?.[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-700">
                      {userData?.name}
                    </div>
                    <div className="text-[0.60rem] text-slate-600 font-medium">
                      {userData?.email}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div
                    onClick={() => {
                      navigate('/user-profile/?tab=details');
                    }}
                    className={`flex items-center gap-2 p-2 text-xs font-medium border-t cursor-pointer  hover:font-semibold border-b  ${currentPath === 'user-profile' ? 'text-primary-50 font-semibold' : 'text-slate-600'}`}
                  >
                    <IconUserPause className="size-4" />
                    My Profile
                  </div>
                  <div
                    className="flex items-center gap-2 p-2 text-xs font-medium cursor-pointer text-slate-600"
                    onClick={() => setIsOpenChangePassword(true)}
                  >
                    <IconKey className="size-4" /> Change Password
                  </div>
                  <div
                    onClick={handleSignOut}
                    className="flex items-center gap-2 p-2 text-xs font-medium border-t cursor-pointer text-slate-600 hover:font-semibold"
                  >
                    <IconLogout className="size-4" /> Sign Out
                  </div>
                </div>
              </div>,
              document.body,
            )}
        </div>
      </div>
      {isOpenChangePasswordDialog && (
        <ChangePasswordFormLayoutWrapper
          onClose={() => setIsOpenChangePassword(false)}
        />
      )}

      {isOpenSalseReportDialog && (
        <SalseReportLayoutWrapper
          onClose={() => setIsOpenSalseReportDialog(false)}
          rowData={safeData as any}
          tableHeaders={tableHeaders}
          filterPaginationData={{
            totalCount: totalData,
            totalPages: totalPages,
          }}
          filter={undefined}
          isLoading={false}
        />
      )}

      {/* {isOpenEditDialog && (
        <EditInvoicesVoidFormWrapper
          onClose={() => dispatch(setIsOpenEditDialog(false))}
          invoiceId={invoiceId}
        />
      )} */}

      {/* {isOpenAddDialog && (
        <OpenRegisterFormWrapper
          onClose={() => dispatch(setIsOpenAddDialog(false))}
        />
      )} */}
    </div>
  );
};

export default React.memo(ATMAppHeader);
