import { FormikProps } from 'formik';
import { AdminRoleFormValues } from '../models/AdminRole.model';
import UserAccess from './UserAccess/UserAccess';
import { ATMButton } from '../../../components/atoms/ATMButton/ATMButton';
import ATMTextField from '../../../components/atoms/FormElements/ATMTextField/ATMTextField';
import ATMFieldLabel from '../../../components/atoms/ATMFieldLabel/ATMFieldLabel';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';

type Props = {
  formikProps: FormikProps<AdminRoleFormValues>;
  // onClose: () => void;
  formType?: 'ADD' | 'EDIT';
  isLoading?: boolean;
  onCancel: () => void;
};

const AdminRoleFormLayout = ({
  formikProps,
  // onClose,
  formType = 'ADD',
  onCancel,
  isLoading=false
}: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;

  const onSelect = ({
    context = 'feature',
    data,
    isSelected,
  }: {
    context?: 'module' | 'feature' | 'field';
    data: any;
    isSelected: boolean;
    moduleData?: any;
  }) => {
    switch (context) {
      case 'feature':
        if (isSelected) {
          const newValue = values?.modules?.filter(
            (selected) => data?.featureId !== selected,
          );
          setFieldValue('modules', newValue);
        } else {
          const newValue = [...values?.modules, data?.featureId];
          setFieldValue('modules', newValue);
        }
        break;

      default:
        break;
    }
  };

  const isAllFeaturesSelected = (features: any[]) => {
    return features?.every((feature: any) =>
      values?.modules?.includes(feature?.featureId),
    );
  };

  const onSelectAll = (features: any[]) => {
    const isAllSelected = isAllFeaturesSelected(features);
    if (isAllSelected) {
      const newValue = values?.modules?.filter((access) => {
        return (
          features?.findIndex((feature) => feature?.featureId === access) === -1
        );
      });

      setFieldValue('modules', newValue);
    } else {
      let newValue: string[] = [];
      features?.forEach((feature: any) => {
        if (!values?.modules?.includes(feature?.featureId)) {
          newValue.push(feature?.featureId);
        }
      });

      setFieldValue('modules', [...values?.modules, ...newValue]);
    }
  };

  return (
  <>
   {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <ATMCircularProgress />
        </div>
      ) :( <div className="flex flex-col h-full gap-4 p-4">
        {/* Heading */}
        <div className="border-b">
          <div className="flex items-center justify-between py-4 mx-auto xl:w-2/3">
            <div className="text-xl font-semibold text-slate-700">
              {formType === 'ADD' ? 'Add Admin Role' : 'Update Admin Role'}
            </div>
            <div className="flex gap-2">
              <ATMButton variant="text" color="primary" onClick={onCancel}>
                Cancel
              </ATMButton>
              <ATMButton
                isLoading={isSubmitting}
                type="submit"
                variant="contained"
                color="primary"
              >
                Save
              </ATMButton>
            </div>
          </div>
        </div>
  
        <div className="flex flex-col w-full gap-4 mx-auto xl:w-2/3">
          <div className="">
            <ATMTextField
              name="roleName"
              value={values.roleName}
              onChange={(e) => setFieldValue('roleName', e.target.value)}
              label="Role Name"
              placeholder="Enter role name"
              onBlur={handleBlur}
              isTouched={touched?.roleName}
              errorMessage={errors?.roleName}
              isValid={!errors?.roleName}
            />
          </div>
  
          <div className="flex-1">
            <div>
              <ATMFieldLabel> Permissions </ATMFieldLabel>
            </div>
            <UserAccess
              selectedUserAccess={values?.modules}
              onSelect={onSelect}
              onSelectAll={onSelectAll}
              isAllSelected={isAllFeaturesSelected}
            />
          </div>
        </div>
      </div>)}
  
    </>
  );
};

export default AdminRoleFormLayout;
