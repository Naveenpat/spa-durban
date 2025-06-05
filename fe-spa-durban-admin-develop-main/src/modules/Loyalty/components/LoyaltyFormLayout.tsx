import { IconArrowBigDownLine, IconArrowBigUpLine } from '@tabler/icons-react';
import { FormikProps } from 'formik';
import React, { useState } from 'react';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';
import ATMSelect from 'src/components/atoms/FormElements/ATMSelect/ATMSelect';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import { LoyaltyFormValues } from '../models/Loyalty.model';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';

export const transformedData = (rawData: any[]) => {
  const result = rawData?.map((data) => {
    return {
      outletId: data?.outlet?._id,
      earnPoint: Number(data?.earnPoint),
      spentAmount: Number(data?.spendAmount),
      mondaySpendAmount: Number(
        data?.daysWiseSetting?.[0]?.spendAmount || data?.spendAmount,
      ),
      mondayEarnPoint: Number(
        data?.daysWiseSetting?.[0]?.earnPoint || data?.earnPoint,
      ),
      tuesdaySpendAmount: Number(
        data?.daysWiseSetting?.[1]?.spendAmount || data?.spendAmount,
      ),
      tuesdayEarnPoint: Number(
        data?.daysWiseSetting?.[1]?.earnPoint || data?.earnPoint,
      ),
      wednesdaySpendAmount: Number(
        data?.daysWiseSetting?.[2]?.spendAmount || data?.spendAmount,
      ),
      wednesdayEarnPoint: Number(
        data?.daysWiseSetting?.[2]?.earnPoint || data?.earnPoint,
      ),
      thursdaySpendAmount: Number(
        data?.daysWiseSetting?.[3]?.spendAmount || data?.spendAmount,
      ),
      thursdayEarnPoint: Number(
        data?.daysWiseSetting?.[3]?.earnPoint || data?.earnPoint,
      ),
      fridaySpendAmount: Number(
        data?.daysWiseSetting?.[4]?.spendAmount || data?.spendAmount,
      ),
      fridayEarnPoint: Number(
        data?.daysWiseSetting?.[4]?.earnPoint || data?.earnPoint,
      ),
      saturdaySpendAmount: Number(
        data?.daysWiseSetting?.[5]?.spendAmount || data?.spendAmount,
      ),
      saturdayEarnPoint: Number(
        data?.daysWiseSetting?.[5]?.earnPoint || data?.earnPoint,
      ),
      sundaySpendAmount: Number(
        data?.daysWiseSetting?.[6]?.spendAmount || data?.spendAmount,
      ),
      sundayEarnPoint: Number(
        data?.daysWiseSetting?.[6]?.earnPoint || data?.earnPoint,
      ),
    };
  });

  return result;
};

type Props = {
  formikProps: FormikProps<LoyaltyFormValues>;
  formType: 'ADD' | 'EDIT';
  onCancel: () => void;
  isLoading?: boolean;
};
const weekdays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
const LoyaltyFormLayout = ({
  formikProps,
  formType,
  onCancel,
  isLoading,
}: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;

  const [visibleoutletes, setVisibleoutletes] = useState<{
    [key: number]: boolean;
  }>({});

  const toggleVisibility = (index: number) => {
    setVisibleoutletes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <ATMCircularProgress />
        </div>
      ) : (
        <div className="p-4">
          <div className="sticky -top-2  flex items-center justify-between py-2 bg-white z-[10000]">
            <span className="text-lg font-semibold text-slate-700">
              {formType === 'ADD' ? 'Add' : 'Edit'} Loyalty
            </span>
            <div className="flex items-center gap-2">
              <div>
                <ATMButton
                  children="Cancel"
                  variant="outlined"
                  onClick={onCancel}
                />
              </div>
              <div>
                <ATMButton
                  type="submit"
                  isLoading={isSubmitting}
                  children="Submit"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="w-[300px]">
              <ATMTextField
                required
                label="Loyalty Program Name"
                name={`loyaltyProgramName`}
                value={values.loyaltyProgramName}
                onChange={(e) =>
                  setFieldValue(`loyaltyProgramName`, e.target.value)
                }
                placeholder="Enter Loyalty Program Name"
                onBlur={handleBlur}
                isTouched={touched.loyaltyProgramName}
                errorMessage={errors.loyaltyProgramName}
                isValid={!errors.loyaltyProgramName}
              />
            </div>
            <div className="mt-2 text-xs font-medium text-gray-500">
              Business Location
            </div>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-xs font-medium text-gray-500 border">
                    Outlet Name
                  </th>
                  <th className="px-4 py-2 text-xs font-medium text-gray-500 border">
                    Spend Amount
                  </th>
                  <th className="px-4 py-2 text-xs font-medium text-gray-500 border">
                    Earn Point
                  </th>
                  <th className="px-4 py-2 text-xs font-medium text-gray-500 border">
                    Days Wise Setting
                  </th>
                </tr>
              </thead>
              <tbody>
                {values.outlets.map((outlet: any, index: number) => (
                  <React.Fragment key={index}>
                    <tr className="even:bg-gray-100">
                      <td className="px-4 py-2 text-xs text-gray-500 border">
                        {formType === 'ADD'
                          ? ` ${outlet?.outlet?.name}`
                          : `${outlet?.outlet}`}
                      </td>
                      <td className="px-4 py-2 border">
                        <ATMTextField
                          label=""
                          name={`outlets[${index}].spendAmount`}
                          value={outlet?.spendAmount}
                          onChange={(e) =>
                            setFieldValue(
                              `outlets[${index}].spendAmount`,
                              e.target.value,
                            )
                          }
                          placeholder="Enter Spend Amount"
                          onBlur={handleBlur}
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <ATMTextField
                          label=""
                          name={`outlets[${index}].earnPoint`}
                          value={outlet?.earnPoint}
                          onChange={(e) =>
                            setFieldValue(
                              `outlets[${index}].earnPoint`,
                              e.target.value,
                            )
                          }
                          placeholder="Enter Earn Amount"
                          onBlur={handleBlur}
                        />
                      </td>
                      <td className="px-4 py-2 text-center text-gray-500 border">
                        <button
                          type="button"
                          onClick={() => toggleVisibility(index)}
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none"
                        >
                          {visibleoutletes[index] ? (
                            <IconArrowBigUpLine />
                          ) : (
                            <IconArrowBigDownLine />
                          )}
                        </button>
                      </td>
                    </tr>
                    {visibleoutletes[index] &&
                      weekdays.map((day: any, dayIndex: number) => (
                        <tr key={dayIndex} className="even:bg-gray-100">
                          <td className="px-4 py-2 pl-8 text-xs border">
                            {day}
                          </td>
                          <td className="px-4 py-2 border">
                            <ATMTextField
                              label=""
                              name={`outlets[${index}].daysWiseSetting.${dayIndex}.spendAmount`}
                              value={
                                outlet.daysWiseSetting?.[dayIndex]?.spendAmount
                              }
                              onChange={(e) =>
                                setFieldValue(
                                  `outlets[${index}].daysWiseSetting.${dayIndex}.spendAmount`,
                                  e.target.value,
                                )
                              }
                              placeholder="Enter Spend Amount"
                              onBlur={handleBlur}
                            />
                          </td>
                          <td className="px-4 py-2 border">
                            <ATMTextField
                              label=""
                              name={`outlets[${index}].daysWiseSetting.${dayIndex}.earnPoint`}
                              value={
                                outlet?.daysWiseSetting?.[dayIndex]?.earnPoint
                              }
                              onChange={(e) =>
                                setFieldValue(
                                  `outlets[${index}].daysWiseSetting.${dayIndex}.earnPoint`,
                                  e.target.value,
                                )
                              }
                              placeholder="Enter Earn Point"
                              onBlur={handleBlur}
                            />
                          </td>
                          <td className="px-4 py-2 border"></td>
                        </tr>
                      ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default LoyaltyFormLayout;
