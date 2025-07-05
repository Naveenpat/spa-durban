import { FormikProps } from 'formik';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import MOLFormDialog from 'src/components/molecules/MOLFormDialog/MOLFormDialog';
import { PaymentMode } from '../models/OpenRegister.model';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';
import { useEffect, useState } from 'react';
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

  const formHeading = formType === 'OPEN' ? 'Close Register' : 'Edit Register';
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [reasonText, setReasonText] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [showCashUsageModal, setShowCashUsageModal] = useState(false);
  const [cashUsageReason, setCashUsageReason] = useState('');
  const [cashUsageProof, setCashUsageProof] = useState<File | null>(null);


  console.log('---------cashUsageReason', cashUsageProof, cashUsageReason)



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

  const openingBalance = updatedResult?.[0]?.totalAmount || 0;
  const cashRow = updatedResult.find(
    (item) => item.paymentModeName?.toLowerCase() === 'cash'
  );
  const cashId = cashRow?._id;
  const cashAutoTotal = cashRow?.totalAmount || 0;
  console.log('------updatedResult', updatedResult);

  // Total of all cash rows
  const cashTotal = updatedResult
    .filter((row: any) => row.paymentModeName?.toLowerCase() === 'cash')
    .reduce((sum: number, row: any) => sum + (parseFloat(row.totalAmount) || 0), 0) + openingBalance;

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


  // console.log('------cashManual',updatedResult[0]?.totalAmount?.toFixed(2))

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
                    {(Object.entries(groupedResult) as [string, any[]][]).map(([date, rows]) => (
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

                              {/* Show Cash Total only after last cash row */}
                              {isLastCashRow && (
                                <tr>
                                  <td colSpan={5} className="p-3 border text-blue-800 text-sm font-semibold text-right">
                                    🧾 Available Cash: R {cashTotal.toFixed(2)}
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })}
                      </>
                    ))}
                  </tbody>




                </table>

                {/* Cash Deposit Section */}
                <div className="mt-6 p-4 border-t">
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

                  <ATMButton >PayOut</ATMButton>

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

      {showCashUsageModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold text-red-600">Opening Balance Used</h3>
            <p className="text-sm text-gray-700">
              You’ve entered a cash value less than the opening balance.
              Please provide a reason and upload payment slip.
            </p>

            <textarea
              className="w-full border p-2 rounded"
              placeholder="Enter reason"
              value={values?.cashUsageReason}
              onChange={(e) => setFieldValue('cashUsageReason', e.target.value)}
            />

            <ATMNumberField label='Enter Amount' name="cashUsageAmount" value={values?.cashUsageAmount} onChange={(newValue: any) => {
              setFieldValue('cashUsageAmount', newValue);
            }} />

            <div className="">
              <ATMFileUploader
                name="cashUsageProofUrl"
                value={values?.cashUsageProofUrl || ''}
                onChange={(file: string) => {
                  setFieldValue('cashUsageProofUrl', file);
                }}
                label="cash proof upload"
                accept=".jpg, .jpeg, .png, .gif"
                folderName='cashproof'
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              {/* <button
                onClick={() => setShowCashUsageModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button> */}
              <ATMButton variant='outlined' onClick={() => setShowCashUsageModal(false)}>
                Cancel
              </ATMButton>
              <ATMButton onClick={() => {
                if (!values?.cashUsageReason.trim()) {
                  showToast('error', 'Reason and proof are required.');
                  return;
                }
                // setFieldValue('cashUsageReason', cashUsageReason);
                // setFieldValue('cashUsageProof', cashUsageProof);
                setShowCashUsageModal(false);
              }}>
                Save
              </ATMButton>
              {/* <button
                onClick={() => {
                  if (!values?.cashUsageReason.trim()) {
                    showToast('error','Reason and proof are required.');
                    return;
                  }
                  // setFieldValue('cashUsageReason', cashUsageReason);
                  // setFieldValue('cashUsageProof', cashUsageProof);
                  setShowCashUsageModal(false);
                }}
                className="bg-primary-60 hover:bg-primary-70 text-white px-4 py-2 rounded"
              >
                Save
              </button> */}
            </div>
          </div>
        </div>
      )}
      {showSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center overflow-auto">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full space-y-6 shadow-lg">
            <h2 className="text-xl font-bold text-center">Register Summary</h2>

            <div className="space-y-4 text-sm text-gray-800">
              <p><strong>Opening Balance:</strong> R {openingBalance?.toFixed(2) || '0.00'}</p>
              <p><strong>Bank Deposit:</strong> R {formikProps.values.bankDeposit || '0.00'}</p>

              {Object.keys(groupedResult).map((date) => (
                <div key={date}>
                  <h3 className="text-base font-semibold text-primary-60 mb-2">
                    {new Date(date).toDateString()}
                  </h3>

                  <table className="w-full border text-sm mb-4">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="p-2 border text-left">Payment Mode</th>
                        <th className="p-2 border text-right">Auto Total</th>
                        <th className="p-2 border text-right">Manual Entry</th>
                        <th className="p-2 border text-left">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedResult[date].map((row: any) => {
                        const rowKey = `${row._id}_${date}`;
                        const manual = formikProps.values.manual?.[rowKey];
                        const reason = formikProps.values.reasons?.[rowKey];
                        const expected = parseFloat(row.totalAmount || 0);
                        const manualNum = parseFloat(manual || 0);
                        const isMismatch = manual && manualNum !== expected;

                        return (
                          <tr key={rowKey} className={isMismatch ? 'bg-red-50' : ''}>
                            <td className="p-2 border capitalize">{row.paymentModeName}</td>
                            <td className="p-2 border text-right">R {expected.toFixed(2)}</td>
                            <td className="p-2 border text-right">
                              {manual ? `R ${manual}` : '-'}
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

              {values.cashUsageReason && (
                <div className="mt-6 border-t pt-4">
                  <p className="text-red-600 font-semibold mb-1">⚠️ Opening Balance Used : R {parseFloat(updatedResult[0]?.totalAmount || '0') - parseFloat(values.manual?.[lastCashRowKey])}</p>
                  <p><strong>Reason:</strong> {values.cashUsageReason}</p>
                  {values.cashUsageProofUrl && (
                    <p className="text-blue-600">
                      Proof File: <a href={`${process.env.REACT_APP_BASE_URL}/${values.cashUsageProofUrl}`} target="_blank" rel="noreferrer" className="underline">View</a>
                    </p>
                  )}
                </div>
              )}
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
