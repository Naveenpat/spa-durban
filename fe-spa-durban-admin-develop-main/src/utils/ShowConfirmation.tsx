import { Dispatch, SetStateAction } from 'react';
import { createRoot } from 'react-dom/client';
import ATMConfirmationDialog from '../components/atoms/ATMConfirmationDialog/ATMConfirmationDialog';

type Props = {
  type?: 'DELETE' | 'WARNING' | 'INFO' | 'SUCCESS';
  title: string;
  message: string;
  onConfirm: (
    closeDialog: () => void,
    setIsLoading: Dispatch<SetStateAction<boolean>>,
  ) => void;
  onDecline?: () => void;
  confirmationText?: string;
  declineText?: string;
  hideDeclineButton?: boolean;
};

const ShowConfirmation = (props: Props) => {
  const dialogContainer = document.createElement('div');

  dialogContainer.id = 'confirmation-container';

  document.body.appendChild(dialogContainer);
  //   const container = document.getElementById("confirmation-container");
  // Create a root and render the React component inside it

  const containerRoot = dialogContainer
    ? createRoot(dialogContainer as HTMLElement)
    : null;

  // Use the root to render the component
  containerRoot?.render(
    <ATMConfirmationDialog
      {...props}
      closeDialog={() => {
        dialogContainer
          ? document.body?.removeChild(dialogContainer)
          : console.log('');
      }}
    />,
  );
};

export default ShowConfirmation;
