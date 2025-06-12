import { FormikProps } from 'formik';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import MOLFormDialog from 'src/components/molecules/MOLFormDialog/MOLFormDialog';
import { EmployeeFormValues } from '../models/Employee.model';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';
import ATMSelect from 'src/components/atoms/FormElements/ATMSelect/ATMSelect';
import ATMMultiSelect from 'src/components/atoms/FormElements/ATMMultiSelect/ATMMultiSelect';
import ATMNumberField from 'src/components/atoms/FormElements/ATMNumberField/ATMNumberField';
import ATMPasswordField from 'src/components/atoms/FormElements/ATMPasswordField/ATMPasswordField';
import { useFetchData } from 'src/hooks/useFetchData';
import { useGetAdminRolesQuery } from 'src/modules/AdminRole/service/AdminRoleServices';
import { useGetOutletsQuery } from 'src/modules/Outlet/service/OutletServices';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';
import { countries } from 'src/modules/Customer/components/CustomerFormLayout';
import { useEffect, useState } from 'react';
import { useGetCompaniesQuery } from 'src/modules/AdminRole copy/service/CompanyServices';

type Props = {
  formikProps: FormikProps<EmployeeFormValues>;
  onCancel: () => void;
  formType: 'ADD' | 'UPDATE';
  isLoading?: boolean;
  setOutletOrBranchOutlet:any;
  outletOrBranchOutlet:any;
};

const selectOption = [
  {
    label: 'Outlet',
    value: 'outlet',
  },
  {
    label: 'Company',
    value: 'company',
  },
];

const EmployeeFormLayout = ({
  formikProps,
  onCancel,
  formType,
  isLoading = false,
  setOutletOrBranchOutlet,
  outletOrBranchOutlet
}: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;
  const handleValidPercent = (event: any): boolean => {
    return !isNaN(event) && event >= 0 && event <= 100;
  };

  const { data } = useFetchData(useGetAdminRolesQuery, {
    body: {
      isPaginationRequired: false,
      filterBy: JSON.stringify([
        {
          fieldName: 'isActive',
          value: true,
        },
      ]),
    },
  });

  const { data:companyData } = useFetchData(
      useGetCompaniesQuery
    )

  const { data: outletsData } = useFetchData(useGetOutletsQuery, {
    body: {
      isPaginationRequired: false,
      filterBy: JSON.stringify([
        {
          fieldName: 'isActive',
          value: true,
        },
      ]),
    },
  });

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <ATMCircularProgress />
        </div>
      ) : (
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between w-[70%] m-auto">
            <div className="font-semibold">
              {formType === 'ADD' ? 'Add Employee' : 'Update Employee'}
            </div>
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
          <div className="border-t"></div>
          <div className="grid grid-cols-3 gap-4 w-[70%] m-auto">
            {/* User Name */}
            <div className="">
              <ATMTextField
                required
                name="userName"
                value={values.userName}
                onChange={(e) => setFieldValue('userName', e.target.value)}
                label="User Name (Use Only a-z0-9)"
                placeholder="Enter User Name"
                onBlur={handleBlur}
                isTouched={touched?.userName}
                errorMessage={errors?.userName}
                isValid={!errors?.userName}
              />
            </div>

             {/* Name */}
            <div className="">
              <ATMTextField
                required
                name="name"
                value={values.name}
                onChange={(e) => setFieldValue('name', e.target.value)}
                label="Name"
                placeholder="Enter Name"
                onBlur={handleBlur}
                isValid={!errors?.name}
                isTouched={touched?.name}
                errorMessage={errors?.name}
              />
            </div>
            
            {/* Email */}
            <div className="">
              <ATMTextField
                name="email"
                required
                value={values.email}
                onChange={(e) => setFieldValue('email', e.target.value)}
                label="Email"
                placeholder="Enter Email"
                onBlur={handleBlur}
                isTouched={touched?.email}
                errorMessage={errors?.email}
                isValid={!errors?.email}
              />
            </div>
            {/* Password */}

            <div className="">
              <ATMPasswordField
                required
                name="password"
                value={values.password}
                onChange={(e) => setFieldValue('password', e.target.value)}
                label="Password"
                placeholder="Enter Password"
                onBlur={handleBlur}
                isTouched={touched?.password}
                errorMessage={errors?.password}
                isValid={!errors?.password}
              />
            </div>

            
            {/* UserRole  */}
            <div>
              <ATMSelect
                required
                name="userRoleId"
                value={values?.userRoleId}
                onChange={(newValue) => setFieldValue('userRoleId', newValue)}
                label="User Role"
                getOptionLabel={(options) => options?.roleName}
                options={data}
                valueAccessKey="_id"
                placeholder="Please Select User Role"
              />
            </div>

<div>
              <ATMSelect
                required
                name="outletOrBranchOutlet"
                value={outletOrBranchOutlet}
                onChange={(newValue) => setOutletOrBranchOutlet(newValue?.value)}
                label="Select"
                getOptionLabel={(options) => options?.label}
                options={selectOption}
                valueAccessKey="value"
                placeholder="Please Outlet Or Branch"
              />
            </div>
            {outletOrBranchOutlet === "company" && (
              <div>
                <ATMSelect
                  required
                  name="companyId"
                  value={values?.companyId}
                  onChange={(newValue) => setFieldValue('companyId', newValue)}
                  label="Company"
                  getOptionLabel={(options) => options?.companyName}
                  options={companyData}
                  valueAccessKey="_id"
                  placeholder="Please Select Company"     
                />
              </div>
            )}

            {/* Outlets */}
            {outletOrBranchOutlet === "outlet" && (
              <div className="col-span-3">
                <ATMMultiSelect
                  name="outletsId"
                  value={values?.outletsId || []}
                  onChange={(newValue) => setFieldValue('outletsId', newValue)}
                  label="Outlets"
                  options={outletsData}
                  getOptionLabel={(options) => options?.name}
                  valueAccessKey="_id"
                  placeholder="Please Select Outlets"
                />
              </div>
            )}

           
            {/* Address */}
            <div className="">
              <ATMTextField
                required
                name="address"
                value={values.address}
                onChange={(e) => setFieldValue('address', e.target.value)}
                label="Address"
                placeholder="Enter Address"
                onBlur={handleBlur}
                isValid={!errors?.address}
                isTouched={touched?.address}
                errorMessage={errors?.address}
              />
            </div>
            {/* city */}
            <div className="">
              <ATMTextField
                required
                name="city"
                value={values.city}
                onChange={(e) => setFieldValue('city', e.target.value)}
                label="City"
                placeholder="Enter City"
                onBlur={handleBlur}
                errorMessage={errors?.city}
                isValid={!errors?.city}
                isTouched={touched?.city}
              />
            </div>
            {/* region */}
            <div className="">
              <ATMTextField
                required
                name="region"
                value={values.region}
                onChange={(e) => setFieldValue('region', e.target.value)}
                label="Region"
                placeholder="Enter Region"
                onBlur={handleBlur}
                isTouched={touched?.region}
                errorMessage={errors?.region}
                isValid={!errors?.region}
              />
            </div>

            {/*country */}
            <div className="">
              <ATMSelect
                name="country"
                value={values?.country}
                onChange={(newValue) => setFieldValue('country', newValue)}
                label="Country"
                placeholder="Select Country"
                options={countries}
                valueAccessKey="label"
                onBlur={handleBlur}
              />
            </div>
            {/* Phone */}
            <div className="">
              <ATMNumberField
                required
                name="phone"
                value={values.phone}
                onChange={(newValue) => setFieldValue('phone', newValue)}
                label="Phone"
                placeholder="Enter Phone Number"
                onBlur={handleBlur}
                isTouched={touched?.phone}
                errorMessage={errors?.phone}
                isValid={!errors?.phone}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeFormLayout;
