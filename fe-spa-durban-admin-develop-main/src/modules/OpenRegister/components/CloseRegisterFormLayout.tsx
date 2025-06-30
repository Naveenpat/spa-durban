import { FormikProps } from 'formik';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import MOLFormDialog from 'src/components/molecules/MOLFormDialog/MOLFormDialog';
import { PaymentMode } from '../models/OpenRegister.model';
import ATMNumberField from 'src/components/atoms/FormElements/ATMNumberField/ATMNumberField';
import ATMSelect from 'src/components/atoms/FormElements/ATMSelect/ATMSelect';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';

type Props = {
  formikProps: FormikProps<PaymentMode>;
  onClose: () => void;
  formType: 'OPEN' | 'EDIT';
  isLoading?: boolean;
  opningData?: any;
};

const CloseRegisterFormLayout = ({
  formikProps,
  onClose,
  formType,
  isLoading = false,
  opningData,
}: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;
  const formHeading = formType === 'OPEN' ? 'Close Register' : 'Edit Register';
  //   console.log('opningData', opningData);
  let updatedResult: any[] = []; // `let` use kiya taki reassignment ho sake
  let cloedRegistered: any;
  if (opningData) {
    const formattedExistingRegister = {
      _id: opningData?.existingRegister?._id,
      totalAmount: opningData?.existingRegister?.openingBalance, // `openingBalance` -> `totalAmount`
      paymentModeName: 'Opening Balance', // Custom name for clarity
    };

    updatedResult = [formattedExistingRegister, ...(opningData?.result || [])];
    cloedRegistered = opningData?.closeRegister;
    // console.log(updatedResult);
  }

  const cashRow = updatedResult.find(
    (item) => item.paymentModeName?.toLowerCase() === 'cash'
  );
  const cashId = cashRow?._id;
  const manualCashValue = parseFloat(values.manual?.[cashId]) || 0;


  // Place this inside your component, before return
  const cashTotal = Array.isArray(updatedResult)
    ? updatedResult
      .filter(
        (item) =>
          item.paymentModeName &&
          item.paymentModeName.toLowerCase() === 'cash'
      )
      .reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0)
    : 0;


  console.log('----opningData', opningData)
  return (
    <MOLFormDialog
      title={formHeading}
      onClose={onClose}
      isSubmitting={isSubmitting}
      isSubmitButtonDisabled={
        !opningData?.result?.length || cloedRegistered?.isActive === false
      }
    >
      {isLoading ? (
        <div className="flex justify-center items-center max-w-[500px] h-[140px]">
          <ATMCircularProgress />
        </div>
      ) : cloedRegistered?.isActive === false ? (
        <div className="text-center text-red-600 font-semibold text-lg py-6">
          This register is already closed.
        </div>
      ) : (
        <>
          {/* ⬇ Your entire table + deposit section remains unchanged */}
          <div className="flex flex-col gap-4">
            <>
              <div className="flex flex-col gap-4">
                <div className="flex justify-center items-center">
                  <div className="rounded-2xl shadow-xl w-full max-w-5xl bg-white border border-gray-200">
                    {/* Table */}
                    <table className="w-full border-collapse rounded-2xl overflow-hidden">
                      <thead className="bg-gray-100 text-sm text-gray-800 uppercase tracking-wide">
                        <tr>
                          <th className="p-3 border">Payment Type</th>
                          <th className="p-3 border">Opening Register</th>
                          <th className="p-3 border">Close Register (Automatic)</th>
                          <th className="p-3 border">Manual Calculation</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm text-gray-700 font-medium">
                        {updatedResult?.map((row, index) => (
                          <tr key={index} className="border hover:bg-gray-50 transition-all">
                            <td className="p-3 border">{row.paymentModeName}</td>
                            <td className="p-3 border text-green-600 font-semibold">
                              {index === 0 && typeof row?.totalAmount === 'number'
                                ? `R ${row.totalAmount.toFixed(2)}`
                                : ''}
                            </td>
                            <td className="p-3 border text-blue-600 font-semibold">
                              {index > 0 && typeof row?.totalAmount === 'number'
                                ? `R ${row.totalAmount.toFixed(2)}`
                                : ''}
                            </td>

                            <td className="p-3 border">
                              {index > 0 ? (
                                <div className="flex flex-col gap-1">
                                  <ATMTextField
                                    name={`manual.${row._id}`}
                                    value={values.manual[row._id] || ''}
                                    onChange={(e) => {
                                      setFieldValue(`manual.${row._id}`, e.target.value)
                                    }
                                    }
                                    onBlur={handleBlur}
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                    placeholder="Enter amount"
                                  />
                                  {values.manual[row._id] && (
                                    <div className="text-xs font-medium">
                                      {parseFloat(values.manual[row._id]) === row.totalAmount ? (
                                        <span className="text-green-600">✅ Success</span>
                                      ) : parseFloat(values.manual[row._id]) > row.totalAmount ? (
                                        <span className="text-red-600">⬆ Greater</span>
                                      ) : (
                                        <span className="text-orange-600">⬇ Less</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Cash Deposit Section */}
                    {updatedResult && (
                      <div className="mt-6 p-4 border-t">
                        <label className="block mb-2 font-semibold text-gray-800 text-base">
                          Enter Cash to Deposit in Bank
                        </label>

                        {/** Get manual cash value for validation */}
                        {(() => {
                          const cashRow = updatedResult.find(
                            (item) => item.paymentModeName?.toLowerCase() === 'cash'
                          );
                          const cashId = cashRow?._id;
                          const manualCashValue = parseFloat(values.manual?.[cashId]) || 0;

                          return (
                            <>
                              <ATMTextField
                                name="bankDeposit"
                                value={values.bankDeposit}
                                onChange={(e) => {
                                  const input = e.target.value;
                                  const num = parseFloat(input);

                                  if (!isNaN(num) && num <= manualCashValue) {
                                    setFieldValue('bankDeposit', input);
                                  } else if (input === '') {
                                    setFieldValue('bankDeposit', '');
                                  }
                                }}
                                onBlur={handleBlur}
                                placeholder="Enter amount"
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                              />

                              {values.bankDeposit !== '' &&
                                parseFloat(values.bankDeposit) > manualCashValue && (
                                  <div className="text-red-600 text-sm mt-2">
                                    You cannot deposit more than R {manualCashValue.toFixed(2)}
                                  </div>
                                )}

                              {values.bankDeposit > 0 && (
                                <div className="mt-3 text-sm text-blue-700 font-semibold">
                                  Carry Forward to Next Day Opening Balance: R{' '}
                                  {(() => {
                                    const deposit = parseFloat(values.bankDeposit) || 0;
                                    const carryForward = Math.max(manualCashValue - deposit, 0);
                                    return carryForward.toFixed(2);
                                  })()}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </>
          </div>
        </>
      )}




    </MOLFormDialog>
  );
};

export default CloseRegisterFormLayout;
