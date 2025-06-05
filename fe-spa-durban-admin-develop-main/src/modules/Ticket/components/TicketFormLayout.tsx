import { FormikProps } from 'formik';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import MOLFormDialog from 'src/components/molecules/MOLFormDialog/MOLFormDialog';
import { TicketFormValues } from '../models/Ticket.model';
import { useFetchData } from 'src/hooks/useFetchData';
import { useGetCustomersQuery } from 'src/modules/Customer/service/CustomerServices';
import ATMSelect from 'src/components/atoms/FormElements/ATMSelect/ATMSelect';
import { useGetOutletsQuery } from 'src/modules/Outlet/service/OutletServices';
import ATMTextArea from 'src/components/atoms/FormElements/ATMTextArea/ATMTextArea';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';

const ticketTypeOption = [
  {
    label: 'Complain',
    value: 'COMPLAIN',
  },
  {
    label: 'General',
    value: 'GENERAL',
  },
  {
    label: 'Refund',
    value: 'REFUND',
  },
];

type Props = {
  formikProps: FormikProps<TicketFormValues>;
  onClose: () => void;
  formType: 'ADD' | 'EDIT';
  isLoading?: boolean;
};

const TicketFormLayout = ({
  formikProps,
  onClose,
  isLoading,
  formType,
}: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;
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
  const { data: customerData, isLoading: customerLoading } = useFetchData(
    useGetCustomersQuery,
    {
      body: {
        isPaginationRequired: false,
        filterBy: JSON.stringify([
          {
            fieldName: 'isActive',
            value: true,
          },
        ]),
      },
    },
  );
  return (
    <MOLFormDialog
      title={formType === 'ADD' ? 'Add Ticket' : 'Update Ticket'}
      onClose={onClose}
      isSubmitting={isSubmitting}
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-[380px]">
          <ATMCircularProgress />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Outlets */}
          <div className="">
            <ATMSelect
              name="outletId"
              value={values?.outletId || []}
              onChange={(newValue) => setFieldValue('outletId', newValue)}
              label="Outlet"
              options={outletsData}
              getOptionLabel={(options) => options?.name}
              valueAccessKey="_id"
              placeholder="Please Select Outlets"
            />
          </div>
          {/* Customer */}
          <div className="">
            <ATMSelect
              value={values?.customerId}
              onChange={(newValue) => {
                setFieldValue('customerId', newValue);
              }}
              placeholder="Select Customer"
              name="customerId"
              options={customerData}
              label="Customer"
              getOptionLabel={(option) => option?.customerName}
              valueAccessKey="_id"
              isLoading={customerLoading}
            />
          </div>
          {/* Customer */}
          <div className="">
            <ATMSelect
              value={values?.ticketType}
              onChange={(newValue) => {
                setFieldValue('ticketType', newValue);
              }}
              placeholder="Ticket Type"
              name="ticketType"
              options={ticketTypeOption}
              label="Ticket Type"
              valueAccessKey="value"
            />
          </div>
          {/* Name */}
          <div className="">
            <ATMTextField
              name="ticketTitle"
              value={values.ticketTitle}
              onChange={(e) => setFieldValue('ticketTitle', e.target.value)}
              label="Ticket Title"
              placeholder="Enter Ticket Title"
              onBlur={handleBlur}
              isTouched={touched?.ticketTitle}
              errorMessage={errors?.ticketTitle}
              isValid={!errors?.ticketTitle}
            />
          </div>
          {/* description */}
          <div className="">
            <ATMTextArea
              required
              name="description"
              value={values.description}
              onChange={(e) => setFieldValue('description', e.target.value)}
              label="Description"
              placeholder="Enter Description"
              onBlur={handleBlur}
              isTouched={touched?.description}
              errorMessage={errors?.description}
              isValid={!errors?.description}
            />
          </div>
        </div>
      )}
    </MOLFormDialog>
  );
};

export default TicketFormLayout;
