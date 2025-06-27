import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { PaymentMode } from '../../models/OpenRegister.model';
// import OpenRegisterFormLayout from '../../components/OpenRegisterFormLayout';
import CloseRegisterFormLayout from '../../components/CloseRegisterFormLayout';
import { object, number, string } from 'yup';
import {
  useAddCloseRegisterMutation,
  useGetRegisterByCurrentDateQuery,
  useSendPdfBYEmailMutation,
} from '../../service/OpenRegisterServices';
import { showToast } from 'src/utils/showToaster';
import { RootState } from 'src/store';
import { useSelector } from 'react-redux';
import { useFetchData } from 'src/hooks/useFetchData';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';

type Props = {
  onClose: () => void;
};

const AddCloseRegisterFormWrapper = ({ onClose }: Props) => {
  const [closeRegister] = useAddCloseRegisterMutation();
  const [sendPdfBYEmail] = useSendPdfBYEmailMutation();
  const { userData, outlet, outlets } = useSelector(
    (state: RootState) => state.auth,
  );
  const { data, isLoading,refetch } = useFetchData(useGetRegisterByCurrentDateQuery, {
    body: outlet && (outlet as any)._id,
    dataType: 'VIEW',
  });

  console.log('data========', data);

  const initialValues: PaymentMode = {
    _id: '',
    totalAmount: 0,
    paymentModeName: '',
    manual: {},
    bankDeposit: 0
  };

  // const validationSchema = object().shape({
  //   openingBalance: number()
  //     .typeError('Opening balance must be a number')
  //     .required('Please enter opening balance')
  //     .min(0, 'Balance cannot be negative'),
  //   // registerId: string().required('Please select a register'),
  // });




  // const handleSendEmail = async (closeRegisterData: any[], carryForward: number, bankDeposit: number) => {
  //   console.log('---------callll')
  //   const receiptElement = document.querySelector('.receipt-print');
  //   if (!receiptElement) return;

  //   try {
  //     const canvas = await html2canvas(receiptElement as HTMLElement, { scale: 2 });
  //     const imgData = canvas.toDataURL('image/png', 0.6);

  //     const pdf = new jsPDF('p', 'mm', 'a4');
  //     const pageWidth = 210;
  //     const pageHeight = 297;
  //     const padding = 10;
  //     const imgWidth = pageWidth - 2 * padding;
  //     const imgHeight = (canvas.height * imgWidth) / canvas.width;

  //     let heightLeft = imgHeight;
  //     let position = 0;

  //     // First page with invoice
  //     pdf.addImage(imgData, 'PNG', padding, position, imgWidth, imgHeight);
  //     heightLeft -= pageHeight - 2 * padding;

  //     while (heightLeft > 0) {
  //       position = heightLeft - imgHeight - 10 - padding;
  //       pdf.addPage();
  //       pdf.addImage(imgData, 'PNG', padding, position, imgWidth, imgHeight);
  //       heightLeft -= pageHeight - 10 - padding;
  //     }

  //     // Add Close Register Table
  //     pdf.addPage();
  //     autoTable(pdf, {
  //       head: [['Payment Type', 'Opening Register', 'Close Register (Automatic)', 'Manual Calculation']],
  //       body: closeRegisterData,
  //       startY: 20,
  //     });

  //     const afterTableY = (pdf as any).lastAutoTable.finalY;

  //     pdf.setFontSize(12);
  //     pdf.text(`Carry Forward Balance: R${carryForward}`, 14, afterTableY + 10);
  //     pdf.text(`Bank Deposit Balance: R${bankDeposit}`, 14, afterTableY + 20);

  //     // Generate PDF blob
  //     const pdfBlob = pdf.output('blob');
  //     const formData = new FormData();
  //     formData.append('file', pdfBlob, 'invoice.pdf');
  //     formData.append('emailBody', 'Dear Customer,\n\nThank you for your purchase. Please find the attached invoice and register summary.\n\nBest regards,\nYour Company Name');

  //     // Send to backend
  //     const res = await sendPdfBYEmail({
  //       outletId:"67c5c54b88910b9e3e672c4e",
  //       body: formData,
  //     });

  //     console.log('------res',res)

  //     if ('error' in res) {
  //       showToast('error', 'Failed to send email');
  //     } else {
  //       showToast('success', res.data?.message || 'Invoice emailed successfully');
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     showToast('error', 'Something went wrong while generating or sending the PDF');
  //   }
  // };


  const handleSubmit = async (
    values: PaymentMode,
    { resetForm, setSubmitting }: FormikHelpers<PaymentMode>,
  ) => {
    try {

      // console.log('-----------initialValues',(data as any)?.data?.existingRegister?.openingBalance)
      const updatedPaymentModes = (data as any)?.data?.result?.map(
        (item: { _id: string | number }) => ({
          ...item,
          manual: values.manual[item._id] || '', // Add manual key, default empty string if not found
        }),
      );

      if (updatedPaymentModes.some((mode: any) => mode.manual === "")) {
        showToast('error', 'Please fill manual entry');
        setSubmitting(false);
        return;
      }


      // console.log(updatedPaymentModes);
      const formattedValues = {
        closeRegister: updatedPaymentModes,
        outletId: outlet && (outlet as any)._id,
        bankDeposit: Number(values.bankDeposit),
        openingBalance: (data as any)?.data?.existingRegister?.openingBalance
      };
      // console.log('formattedValues=======', formattedValues);

      const res = await closeRegister(formattedValues).unwrap(); // Proper async handling

      if (res?.status) {
        showToast('success', 'Register Closed Successfully');
        // handleSendEmail(updatedPaymentModes,100,values.bankDeposit)
        resetForm();
        onClose();
        refetch()
      } else {
        showToast('error', res?.message || 'Something went wrong');
      }
    } catch (error: any) {
      showToast('error', error?.data?.message || 'Failed to open register');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik<PaymentMode>
      initialValues={initialValues}
      onSubmit={handleSubmit}
    // validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <CloseRegisterFormLayout
            formikProps={formikProps}
            onClose={onClose}
            formType="OPEN"
            opningData={(data as any)?.data}
            isLoading={isLoading}
          />
        </Form>
      )}
    </Formik>
  );
};

export default AddCloseRegisterFormWrapper;
