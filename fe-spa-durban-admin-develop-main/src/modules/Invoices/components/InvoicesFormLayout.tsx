import { FormikProps } from 'formik';
import ATMTextArea from 'src/components/atoms/FormElements/ATMTextArea/ATMTextArea';
import MOLFormDialog from 'src/components/molecules/MOLFormDialog/MOLFormDialog';
import { InvoicesFormValues } from '../models/Invoices.model';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';

type Props = {
  formikProps: FormikProps<InvoicesFormValues>;
  onClose: () => void;
  isLoading?: boolean;
};

const InvoicesFormLayout = ({
  formikProps,
  onClose,
  isLoading = false,
}: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;

  return (
    <MOLFormDialog
      title="Invoices"
      onClose={onClose}
      isSubmitting={isSubmitting}
    >
      {' '}
      {isLoading ? (
        <div className="flex justify-center items-center  h-[185px]">
          <ATMCircularProgress />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Name */}
          <div className="">
            <ATMTextArea
              name="voidNote"
              value={values.voidNote || ''}
              onChange={(e) => setFieldValue('voidNote', e.target.value)}
              label="Note"
              placeholder="Enter note"
              onBlur={handleBlur}
              isTouched={touched?.voidNote}
              errorMessage={errors?.voidNote}
              isValid={!errors?.voidNote}
            />
          </div>
        </div>
      )}
    </MOLFormDialog>
  );
};

export default InvoicesFormLayout;
