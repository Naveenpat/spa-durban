import { FormikProps } from 'formik';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import MOLFormDialog from 'src/components/molecules/MOLFormDialog/MOLFormDialog';
import { PaymentMode } from '../models/OpenRegister.model';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';
import { useEffect, useRef, useState } from 'react';
import { IconCalendar } from '@tabler/icons-react';
import ATMDialog from 'src/components/atoms/ATMDialog/ATMDialog';
import ATMFileUploader from 'src/components/atoms/FormElements/ATMFileUploader/ATMFileUploader';
import { showToast } from 'src/utils/showToaster';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';
import ATMNumberField from 'src/components/atoms/FormElements/ATMNumberField/ATMNumberField';

// types

type Props = {
  formikProps: FormikProps<PaymentMode>;
  onClose: () => void;
  formType: 'OPEN' | 'EDIT';
  isLoading?: boolean;
  opningData?: any;
  setShowSummary: any;
  showSummary: boolean;
};

const CloseRegisterFormLayout = ({
  formikProps,
  onClose,
  formType,
  isLoading = false,
  opningData,
  setShowSummary,
  showSummary
}: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur } = formikProps;
  const summaryRef = useRef<HTMLDivElement>(null);
  const formHeading = formType === 'OPEN' ? 'Close Register' : 'Edit Register';
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [reasonText, setReasonText] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [showCashUsageModal, setShowCashUsageModal] = useState(false);
  const [cashUsageReason, setCashUsageReason] = useState('');
  const [cashUsageProof, setCashUsageProof] = useState<File | null>(null);
  const [tempCashUsage, setTempCashUsage] = useState({
    reason: '',
    amount: '',
    proofUrl: '',
  });

  const [cashUsages, setCashUsages] = useState<{ reason: string; amount: string; proofUrl: string; createdAt: Date }[]>([]);



  console.log('---------values', values)



  let updatedResult: any[] = [];
  let cloedRegistered: any;

  if (opningData) {
    const formattedExistingRegister = {
      _id: opningData?.existingRegister?._id,
      totalAmount: opningData?.register?.openingBalance,
      paymentModeName: 'Opening Balance',
    };

    // Flatten result by date for frontend display
    const flattenedPayments = opningData?.result?.flatMap((entry: any) =>
      entry.payments.map((p: any) => ({ ...p, date: entry.date }))
    );

    updatedResult = [formattedExistingRegister, ...(flattenedPayments || [])];
    cloedRegistered = opningData?.register;
  }

  function getDateWiseCashTotal(cashUsage: any[]) {
    return cashUsage.reduce((acc, usage) => {
      const dateKey = new Date(usage.createdAt).toISOString().split("T")[0]; // yyyy-mm-dd
      if (!acc[dateKey]) acc[dateKey] = 0;
      acc[dateKey] += usage.amount;
      return acc;
    }, {} as Record<string, number>);
  }
  let cashUsageTotals: any;
  if (cloedRegistered) {
    cashUsageTotals = getDateWiseCashTotal(cloedRegistered?.cashUsage);
  }


  const openingBalance = updatedResult?.[0]?.totalAmount || 0;
  const cashRow = updatedResult.find(
    (item) => item.paymentModeName?.toLowerCase() === 'cash'
  );
  const cashId = cashRow?._id;
  const cashAutoTotal = cashRow?.totalAmount || 0;
  console.log('------updatedResult', updatedResult);

  // Total of all cash rows
  // const cashTotal = updatedResult
  //   .filter((row: any) => row.paymentModeName?.toLowerCase() === 'cash')
  //   .reduce((sum: number, row: any) => sum + (parseFloat(row.totalAmount) || 0), 0) + openingBalance;

  // sales से cash total
  const cashIn = updatedResult
    .filter((row: any) => row.paymentModeName?.toLowerCase() === 'cash')
    .reduce((sum: number, row: any) => sum + (parseFloat(row.totalAmount) || 0), 0);

  // payouts से cash usage निकालना (date-wise)
  const payoutTotal = opningData?.register?.cashUsage
    .reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);

  console.log('------payoutTotal', payoutTotal)
  // final cash total
  const cashTotal = cashIn + openingBalance - payoutTotal;


  // Last index where paymentMode is 'cash'
  const lastCashIndex = updatedResult
    .map((row: any, index: number) => ({
      isCash: row.paymentModeName?.toLowerCase() === 'cash',
      index
    }))
    .filter((r) => r.isCash)
    .map((r) => r.index)
    .pop() ?? -1;

  console.log('Cash Total:', cashTotal);
  console.log('Last Cash Index:', lastCashIndex);
  const openingManual = parseFloat(values.manual?.[updatedResult?.[0]?._id] || '0');
  const cashManual = parseFloat(values.manual?.[cashId] || '0');
  const totalManualCashAvailable = openingManual + cashManual;




  const isOpeningReduced =
    updatedResult?.[0] &&
    parseFloat(values.manual?.[updatedResult[0]._id] || '0') < updatedResult[0].totalAmount;

  const isReasonMissing =
    isOpeningReduced && !values.reasons?.[updatedResult[0]._id]?.trim();

  const isSubmitDisabled =
    !opningData?.result?.length ||
    cloedRegistered?.isClosed
    === true || !cloedRegistered?.isOpened;



  const groupedResult = updatedResult.slice(1).reduce((acc: Record<string, any[]>, row: any) => {
    if (!row?.date) return acc;
    acc[row.date] = acc[row.date] || [];
    acc[row.date].push(row);
    return acc;
  }, {});

  const lastCashRowInfo = Object.entries(groupedResult)
    .flatMap(([date, rows]) =>
      rows.map((row, i) => ({ ...row, date, flatIndex: `${date}_${row._id}` }))
    )
    .filter((row) => row.paymentModeName?.toLowerCase() === 'cash')
    .pop();

  const lastCashRowKey = lastCashRowInfo ? `${lastCashRowInfo._id}_${lastCashRowInfo.date}` : '';
  console.log('------cashManual', parseFloat(values.manual?.[lastCashRowKey] || '0'))
  const isCashLessThanOpening = parseFloat(values.manual?.[lastCashRowKey] || '0') < parseFloat(updatedResult[0]?.totalAmount || '0');

  const handleReviewBeforeSubmit = () => {
    setPreviewMode(true); // Switch to preview mode
  };

  // const allowedUsage = carryForwardBalance - openingBalance;
  // const isOpeningCashTouched = usedCash > allowedUsage;
  useEffect(() => {
    const timeout = setTimeout(() => {
      const openingBalance = parseFloat(updatedResult[0]?.totalAmount || '0');
      const manualCash = parseFloat(values.manual?.[lastCashRowKey]);

      if (!isNaN(manualCash) && manualCash < openingBalance) {
        setShowCashUsageModal(true);
      }
    }, 1000); // Wait 600ms after typing

    return () => clearTimeout(timeout); // Clear on new keystroke
  }, [values.manual?.[lastCashRowKey]]);


  const handlePrint = () => {
    if (!summaryRef.current) return;

    const content = summaryRef.current.innerHTML;
    const printWindow = window.open('', '_blank');

    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
      <html>
        <head>
          <title>Register Summary</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            html, body {
              font-family: Arial, sans-serif;
              padding: 0;
              margin: 0;
              background: white;
              color: #000;
            }
            body {
              width: 210mm;
              min-height: 297mm;
              padding: 20mm;
              box-sizing: border-box;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 1rem;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #999;
              padding: 6px;
              text-align: left;
            }
            h2, h3, h4 {
              margin-top: 1rem;
            }
            a, button {
              display: none !important;
            }
            ul {
              padding-left: 20px;
            }
            li {
              margin-bottom: 6px;
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      };
    }
  };




  return (
    <MOLFormDialog
      title={formHeading}
      onClose={onClose}
      isSubmitting={isSubmitting}
      isSubmitButtonDisabled={isSubmitDisabled}
    >
      {isLoading ? (
        <div className="flex justify-center items-center max-w-[500px] h-[140px]">
          <ATMCircularProgress />
        </div>
      )
        : !cloedRegistered?.isOpened ? (
          <div className="text-center text-yellow-600 font-semibold text-lg py-6">
            Please open register first.
          </div>
        ) : cloedRegistered?.isClosed === true ? (
          <div className="text-center text-red-600 font-semibold text-lg py-6">
            This register is already closed.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex justify-center items-center">
              <div className="rounded-2xl shadow-xl w-full max-w-5xl bg-white border border-gray-200">
                <table className="w-full border-collapse rounded-2xl overflow-hidden">
                  <thead className="bg-gray-100 text-sm text-gray-800 uppercase tracking-wide overflow-auto">
                    <tr>
                      <th className="p-3 border">Payment Type</th>
                      {/* <th className="p-3 border">Date</th> */}
                      <th className="p-3 border">Opening Register</th>
                      <th className="p-3 border">Close Register (Automatic)</th>
                      <th className="p-3 border">Manual Calculation</th>
                    </tr>
                  </thead>


                  <tbody className="text-sm text-gray-700 font-medium">
                    {/* Opening Balance Row */}
                    {updatedResult.length > 0 && (
                      <tr className="border hover:bg-gray-50 transition-all">
                        <td className="p-3 border font-semibold">Opening Balance</td>
                        <td className="p-3 border text-green-600 font-semibold text-center">
                          R {updatedResult[0]?.totalAmount?.toFixed(2)}
                        </td>
                      </tr>
                    )}

                    {/* Group by date */}
                    {(Object.entries(groupedResult) as [string, any[]][]).sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime()).map(([date, rows]) => (
                      <>
                        {/* Date Row */}
                        <tr className="bg-gray-100 text-sm text-blue-700">
                          <td colSpan={5} className="p-2 primary font-bold">
                            <div className="flex items-center gap-2">
                              <IconCalendar size={20} /> {new Date(date).toDateString()}
                            </div>
                          </td>
                        </tr>

                        {rows.map((row, index) => {
                          const uniqueKey = `${row._id}_${date}`;
                          const isLastCashRow = uniqueKey === lastCashRowKey;
                          const isCashRow = row.paymentModeName?.toLowerCase() === 'cash';

                          return (
                            <>
                              <tr key={uniqueKey} className="border hover:bg-gray-50 transition-all">
                                <td className="p-3 border">{row.paymentModeName?.charAt(0).toUpperCase() + row.paymentModeName?.slice(1)}</td>
                                <td className="p-3 border text-center">-</td>
                                <td className="p-3 border text-blue-600 font-semibold text-center">
                                  R {row?.totalAmount.toFixed(2)}
                                </td>
                                <td className="p-3 border">
                                  {/* Show input only for non-cash or last cash row */}
                                  {(!isCashRow || isLastCashRow) && (
                                    <ATMTextField
                                      name={`manual.${uniqueKey}`}
                                      value={values.manual?.[uniqueKey] || ''}
                                      onChange={(e) => setFieldValue(`manual.${uniqueKey}`, e.target.value)}
                                      onBlur={handleBlur}
                                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                      placeholder="Enter amount"
                                    />
                                  )}

                                  {values.manual?.[uniqueKey] && (
                                    <div className="text-xs font-medium">
                                      {isCashRow ? (
                                        isLastCashRow ? (
                                          parseFloat(values.manual[uniqueKey]) === cashTotal ? (
                                            <span className="text-green-600">✅ Success</span>
                                          ) : (
                                            <span
                                              onClick={() => {
                                                setActiveRowId(uniqueKey);
                                                setShowReasonModal(true);
                                                setReasonText(values.reasons?.[uniqueKey] || '');
                                              }}
                                              className={`cursor-pointer underline ${parseFloat(values.manual[uniqueKey]) > cashTotal
                                                ? 'text-red-600'
                                                : 'text-orange-600'
                                                }`}
                                            >
                                              {parseFloat(values.manual[uniqueKey]) > cashTotal
                                                ? '⬆ Greater'
                                                : '⬇ Less'}{' '}
                                              – Add Reason
                                            </span>
                                          )
                                        ) : null
                                      ) : (
                                        parseFloat(values.manual[uniqueKey]) === row.totalAmount ? (
                                          <span className="text-green-600">✅ Success</span>
                                        ) : (
                                          <span
                                            onClick={() => {
                                              setActiveRowId(uniqueKey);
                                              setShowReasonModal(true);
                                              setReasonText(values.reasons?.[uniqueKey] || '');
                                            }}
                                            className={`cursor-pointer underline ${parseFloat(values.manual[uniqueKey]) > row.totalAmount
                                              ? 'text-red-600'
                                              : 'text-orange-600'
                                              }`}
                                          >
                                            {parseFloat(values.manual[uniqueKey]) > row.totalAmount
                                              ? '⬆ Greater'
                                              : '⬇ Less'}{' '}
                                            – Add Reason
                                          </span>
                                        )
                                      )}
                                    </div>
                                  )}
                                </td>
                              </tr>

                              {isCashRow && (
                                <>
                                  {Object.entries(cashUsageTotals).map(([d, total]: any) => {
  if (d !== date) return null; // sirf current date ka payout show kare
  const uniqueKey = `payout_${d}`;
  return (
    <tr key={uniqueKey}>
      <td className="p-3 border">Payout</td>
      <td className="p-3 border text-center"></td>
      <td className="p-3 border text-blue-600 font-semibold text-center">
        R {total}
      </td>
      <td className="p-3 border">
        <ATMTextField
          name={`manual.${uniqueKey}`}
          value={values.manual?.[uniqueKey] || ''}
          onChange={(e) =>
            setFieldValue(`manual.${uniqueKey}`, e.target.value)
          }
          onBlur={handleBlur}
          className="w-full p-2 border border-gray-300 rounded-md text-sm"
          placeholder="Enter amount"
        />

        {values.manual?.[uniqueKey] && (
          <div className="text-xs font-medium">
            {parseFloat(values.manual[uniqueKey]) === total ? (
              <span className="text-green-600">✅ Success</span>
            ) : (
              <span
                onClick={() => {
                  setActiveRowId(uniqueKey);
                  setShowReasonModal(true);
                  setReasonText(values.reasons?.[uniqueKey] || '');
                }}
                className={`cursor-pointer underline ${
                  parseFloat(values.manual[uniqueKey]) > total
                    ? 'text-red-600'
                    : 'text-orange-600'
                }`}
              >
                {parseFloat(values.manual[uniqueKey]) > total
                  ? '⬆ Greater'
                  : '⬇ Less'}{' '}
                – Add Reason
              </span>
            )}
          </div>
        )}
      </td>
    </tr>
  );
})}

                                </>
                              )}

                              {/* Show Cash Total only after last cash row */}
                              {isLastCashRow && (
                                <>
                                  <tr>
                                    <td colSpan={5} className="p-3 border text-blue-800 text-sm font-semibold text-right">
                                      🧾 Total Cash: R {cashTotal.toFixed(2)}
                                    </td>
                                  </tr></>
                              )}
                            </>
                          );
                        })}
                      </>
                    ))}
                  </tbody>




                </table>

                {/* Cash Deposit Section */}
                {/* <div className="mt-6 p-4 border-t">
                  <label className="block mb-2 font-semibold text-gray-800 text-base">
                    Enter Cash to Deposit in Bank
                  </label>

                  <ATMTextField
                    name="bankDeposit"
                    value={values.bankDeposit}
                    onChange={(e) => {
                      const input = e.target.value;
                      const num = parseFloat(input);
                      if (!isNaN(num) && num <= cashTotal) {
                        setFieldValue('bankDeposit', input);
                      } else if (input === '') {
                        setFieldValue('bankDeposit', '');
                      }
                    }}
                    onBlur={handleBlur}
                    placeholder="Enter amount"
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />

                  <ATMButton >Pay Out</ATMButton>

                  {values.bankDeposit !== '' &&
                    parseFloat(values.bankDeposit) > cashTotal && (
                      <div className="text-red-600 text-sm mt-2">
                        You cannot deposit more than R {cashTotal}
                      </div>
                    )}

                  {values.bankDeposit > 0 && (
                    <div className="mt-3 text-sm text-blue-700 font-semibold">
                      Carry Forward to Next Day Opening Balance: R{' '}
                      {(() => {
                        const deposit = parseFloat(values.bankDeposit) || 0;
                        const carryForward = Math.max(cashTotal - deposit, 0);
                        return carryForward.toFixed(2);
                      })()}
                    </div>
                  )}
                </div> */}

                <div className="mt-6 p-4 border-t">
                  <label className="block mb-2 font-semibold text-gray-800 text-base">
                    Enter Cash to Deposit in Bank
                  </label>

                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div className='col-span-2'>
                      <ATMTextField
                        name="bankDeposit"
                        value={values.bankDeposit}
                        onChange={(e) => {
                          const input = e.target.value;
                          const num = parseFloat(input);
                          if (!isNaN(num) && num <= parseFloat(values.manual?.[lastCashRowKey] || '0')) {
                            setFieldValue('bankDeposit', input);
                          } else if (input === '') {
                            setFieldValue('bankDeposit', '');
                          }
                        }}
                        onBlur={handleBlur}
                        placeholder="Enter amount"
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>


                  </div>

                  {values.bankDeposit !== '' &&
                    parseFloat(values.bankDeposit) > parseFloat(values.manual?.[lastCashRowKey] || '0') && (
                      <div className="text-red-600 text-sm mt-2">
                        You cannot deposit more than R {cashTotal}
                      </div>
                    )}

                  {values.bankDeposit > 0 && (
                    <div className="mt-3 text-sm text-blue-700 font-semibold">
                      Carry Forward to Next Day Opening Balance: R{' '}
                      {(() => {
                        const deposit = parseFloat(values.bankDeposit) || 0;
                        const carryForward = Math.max(parseFloat(values.manual?.[lastCashRowKey] || '0') - deposit, 0);
                        return carryForward.toFixed(2);
                      })()}
                    </div>
                  )}
                </div>


              </div>
            </div>
          </div>
        )}

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-md w-full max-w-sm p-4">
            <h3 className="text-lg font-semibold mb-3">Reason Required</h3>
            <textarea
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder="Enter reason for discrepancy"
              className="w-full border border-gray-300 p-2 rounded h-24 resize-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowReasonModal(false);
                  setReasonText('');
                  setActiveRowId(null);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!reasonText.trim()) {
                    alert('Reason is required');
                    return;
                  }
                  setFieldValue(`reasons.${activeRowId}`, reasonText);
                  setShowReasonModal(false);
                  setReasonText('');
                  setActiveRowId(null);
                }}
                className="bg-primary-60 hover:bg-primary-70 text-white px-4 py-1 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}




      {showSummary && (
        <div ref={summaryRef} className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-lg">

            <h2 className="text-xl font-bold text-center mt-4">Register Closure Summary</h2>

            <div className="space-y-4 text-sm text-gray-800 overflow-auto">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {/* Left side - 3 items */}
                <div className="space-y-1">
                  <p><strong>Sequence No</strong>: {opningData?.register?._id}</p>
                  <p><strong>Open Date</strong>: {new Date(opningData?.register?.openedAt).toLocaleDateString()}</p>
                  <p><strong>Close Date</strong>: {new Date().toLocaleDateString()}</p>
                </div>

                {/* Right side - 1 item */}
                <div className="space-y-1">
                  <p><strong>Outlet</strong>: {opningData?.register?.outletId}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <p><strong>Opening Balance</strong>: R {openingBalance?.toFixed(2) || '0.00'}</p>
                <p><strong>Bank Deposit</strong>: R {formikProps.values.bankDeposit || '0.00'}</p>
                <p><strong>Carry Forward</strong>: R {(() => {
                  const deposit = parseFloat(values.bankDeposit) || 0;
                  const carryForward = Math.max(cashTotal - deposit, 0);
                  return carryForward.toFixed(2);
                })()}</p>
              </div>

              {Object.keys(groupedResult)
                .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()) // ✅ dates sorted
                .map((date) => (
                  <div key={date}>
                    <h3 className="text-base font-semibold text-primary-60 mb-2">
                      {new Date(date).toDateString()}
                    </h3>

                    <table className="w-full border text-sm mb-4">
                      <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          <th className="p-2 border text-left">Payment Mode</th>
                          <th className="p-2 border text-right">Expected</th>
                          <th className="p-2 border text-right">Counted</th>
                          <th className="p-2 border text-right">Difference</th>
                          <th className="p-2 border text-left">Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedResult[date].map((row: any) => {
                          const rowKey = `${row._id}_${date}`;
                          const manual = formikProps.values.manual?.[rowKey];
                          const reason = formikProps.values.reasons?.[rowKey];

                          // अगर cash row है तो expected को finalCashTotal से overwrite करो
                          let expected = parseFloat(row.totalAmount || 0);
                          if (row.paymentModeName?.toLowerCase() === "cash") {
                            expected = cashTotal; // ✅ यहाँ final cash total डालो
                          }

                          const manualNum = parseFloat(manual || '0');
                          const isMismatch = manual && manualNum !== expected;
                          const difference = manual ? manualNum - expected : 0;

                          return (
                            <tr key={rowKey} className={isMismatch ? 'bg-red-50' : ''}>
                              <td className="p-2 border capitalize">{row.paymentModeName}</td>
                              <td className="p-2 border text-right">R {expected.toFixed(2)}</td>
                              <td className="p-2 border text-right">
                                {manual ? `R ${manual}` : '-'}
                              </td>
                              <td className="p-2 border text-right">
                                {manual ? `R ${difference.toFixed(2)}` : '-'}
                              </td>
                              <td className="p-2 border">
                                {isMismatch && reason ? (
                                  <span className="text-orange-600">{reason}</span>
                                ) : (
                                  '-'
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
              <div>
                <h4 className='my-2 text-bold'><strong>Cash Movement</strong></h4>
                <table className="w-full border text-sm mb-4">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="p-2 border text-left">Type</th>
                      <th className="p-2 border text-left">Date and Time</th>
                      <th className="p-2 border text-left">User</th>
                      <th className="p-2 border text-left">Note</th>
                      <th className="p-2 border text-left">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="">
                      <td className="p-2 border text-left">Closing Float</td>
                      <td className="p-2 border text-left">
                        {new Date(opningData?.register?.createdAt).toLocaleDateString()}{" "}
                        {new Date(opningData?.register?.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="p-2 border text-left">
                        {opningData?.register?.userName || "-"}
                      </td>
                      <td className="p-2 border text-left">-</td>
                      <td className="p-2 border text-left">
                        R {opningData?.register?.openingBalance?.toFixed(2)}
                      </td>
                    </tr>

                    {(opningData as any)?.register?.cashUsage?.map((item: any, index: any) => (
                      <tr key={index}>
                        {/* Type */}
                        <td className="p-2 border text-left">Cash Out</td>

                        {/* Date and Time */}
                        <td className="p-2 border text-left">
                          {new Date(item.createdAt).toLocaleDateString()}{" "}
                          {new Date(item.createdAt).toLocaleTimeString()}
                        </td>

                        {/* User */}
                        <td className="p-2 border text-left">
                          {item.customerName || "-"}
                        </td>

                        {/* Note */}
                        <td className="p-2 border text-left">
                          {item.reason || "-"}
                        </td>

                        {/* Amount */}
                        <td className="p-2 border text-left">
                          R {item.amount?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="">
                      <td className="p-2 border text-left">Opening Float</td>
                      <td className="p-2 border text-left">
                        {new Date().toLocaleDateString()}{" "}
                        {new Date().toLocaleTimeString()}
                      </td>
                      <td className="p-2 border text-left">
                        {opningData?.register?.closedBy || "-"}
                      </td>
                      <td className="p-2 border text-left">-</td>
                      <td className={`p-2 border text-left ${(cashTotal - (parseFloat(values.bankDeposit) || 0)) < 0 ? "text-red-500" : ""}`}>
                        R {Math.max(cashTotal - (parseFloat(values.bankDeposit) || 0), 0).toFixed(2)}
                      </td>

                    </tr>
                  </tbody>
                </table>
              </div>


            </div>

            <div className="flex justify-end gap-4 pt-4 border-t pt-4">
              <ATMButton variant='outlined' onClick={() => setShowSummary(false)}>
                Back
              </ATMButton>
              {/* <button
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                onClick={() => setShowSummary(false)}
              >
              
              </button> */}
              <ATMButton variant='outlined' onClick={handlePrint}>
                Print
              </ATMButton>
              <ATMButton onClick={() => {
                setShowSummary(false);
                formikProps.submitForm();
              }}>
                Confirm & Submit
              </ATMButton>

            </div>
          </div>
        </div>
      )}



    </MOLFormDialog>
  );
};

export default CloseRegisterFormLayout;
