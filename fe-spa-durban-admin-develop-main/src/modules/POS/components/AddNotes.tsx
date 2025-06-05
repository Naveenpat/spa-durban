import { FormikProps } from 'formik';
import ATMTextArea from 'src/components/atoms/FormElements/ATMTextArea/ATMTextArea';
import MOLFormDialog from 'src/components/molecules/MOLFormDialog/MOLFormDialog';
import { CartFormValues } from '../models/POS.model';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';
import ATMDialog from 'src/components/atoms/ATMDialog/ATMDialog';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';
type Props = {
  formikProps: FormikProps<CartFormValues>;
  onClose: () => void;
  isLoading?: boolean;
  formType: 'ADD' | 'EDIT';
};

const AddNotes = ({
  formikProps,
  onClose,
  isLoading = false,
  formType,
}: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;

  const formHeading = formType === 'ADD' ? 'Add Notes' : 'Edit Notes';
  return (
    <ATMDialog>
      <div
        className={`flex md:min-w-[30rem] flex-col relative min-w-[95vw] max-h-[90vh] overflow-auto hide-scrollbar `}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-4 py-2 bg-white z-[10000]">
          <span className="text-lg font-semibold text-slate-700">
            {formHeading}
          </span>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 ">
          {/* <MOLFormDialog
      title={formHeading}
      onClose={onClose}
      isSubmitting={isSubmitting}
    > */}
          {isLoading ? (
            <div className="flex justify-center items-center  h-[185px]">
              <ATMCircularProgress />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* GiftCard Code */}
              <div className="">
                <ATMTextArea
                  required
                  name="notes"
                  value={values.notes}
                  onChange={(e) => setFieldValue('notes', e.target.value)}
                  label="Notes"
                  placeholder="Enter notes"
                  onBlur={handleBlur}
                  isTouched={touched?.notes}
                  errorMessage={errors?.notes}
                  isValid={!errors?.notes}
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 flex items-center justify-end gap-2 px-4 py-3 bg-white">
          <ATMButton onClick={onClose} variant="outlined" color="neutral">
            Cancel
          </ATMButton>

          <ATMButton onClick={onClose} type="button" isLoading={isSubmitting}>
            Submit
          </ATMButton>
        </div>
      </div>
    </ATMDialog>
  );
};

export default AddNotes;
