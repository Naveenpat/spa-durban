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

  if (opningData) {
    const formattedExistingRegister = {
      _id: opningData?.existingRegister?._id,
      totalAmount: opningData?.existingRegister?.openingBalance, // `openingBalance` -> `totalAmount`
      paymentModeName: 'Opening Balance', // Custom name for clarity
    };

    updatedResult = [formattedExistingRegister, ...(opningData?.result || [])];

    // console.log(updatedResult);
  }

  return (
    <MOLFormDialog
      title={formHeading}
      onClose={onClose}
      isSubmitting={isSubmitting}
    >
      {isLoading ? (
        <div className="flex justify-center items-center max-w-[500px] h-[140px]">
          <ATMCircularProgress />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2"></div>
          <div className="flex justify-center items-center ">
            <div className="rounded-lg shadow-md w-full max-w-3xl">
              <table className="w-full border-collapse border ">
                <thead>
                  <tr className=" text-left">
                    <th className="p-2 border ">Payment Type</th>
                    <th className="p-2 border ">Opening Register</th>
                    <th className="p-2 border ">Close Register (Automatic)</th>
                    <th className="p-2 border ">Manual Calculation</th>
                  </tr>
                </thead>
                <tbody>
                  {updatedResult &&
                    updatedResult.map((row, index) => (
                      <tr key={index} className="border">
                        <td className="p-2 border">{row.paymentModeName}</td>

                        <td className="p-2 border">
                          {index === 0 ? row?.totalAmount : ''}
                        </td>

                        {/* Close Register */}
                        <td className="p-2 border">
                          {index > 0 ? row?.totalAmount : ''}
                        </td>

                        {/* Manual Calculation */}
                        <td className="p-2 border">
                          {index > 0 ? (
                            <ATMTextField
                              name={`manual.${row._id}`}
                              value={values.manual[row._id] || ''}
                              onChange={(e) =>
                                setFieldValue(
                                  `manual.${row._id}`,
                                  e.target.value,
                                )
                              }
                              onBlur={handleBlur}
                              className="w-full p-1 border rounded"
                            />
                          ) : (
                            ''
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {/* Close Register Button */}
              {/* <div className="flex justify-end mt-4">
                <button className="bg-red-600 text-white px-6 py-2 rounded shadow-md hover:bg-red-700">
                  Close Register
                </button>
              </div> */}
            </div>
          </div>
        </>
      )}
    </MOLFormDialog>
  );
};

export default CloseRegisterFormLayout;
