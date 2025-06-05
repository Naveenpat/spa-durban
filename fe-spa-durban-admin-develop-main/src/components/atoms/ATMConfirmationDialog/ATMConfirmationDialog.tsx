import { IconCheck, IconExclamationMark, IconTrash } from '@tabler/icons-react';
import { Dispatch, SetStateAction, useState } from 'react';
import { ATMButton } from '../ATMButton/ATMButton';

type ConfirmationType = 'DELETE' | 'WARNING' | 'INFO' | 'SUCCESS';

type Props = {
  type?: ConfirmationType;
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
  closeDialog: () => void;
};

const ATMConfirmationDialog = ({
  type = 'DELETE',
  title,
  message,
  onConfirm,
  onDecline,
  confirmationText = 'Yes, Delete',
  declineText = 'Cancel',
  hideDeclineButton = false,
  closeDialog,
}: Props) => {
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const handleDecline = () => {
    document
      .getElementById('confirmation_dialog_container')
      ?.classList?.add('animate-scale-out');

    setTimeout(() => {
      onDecline?.();
      closeDialog();
    }, 200);
  };

  const handleConfirm = () => {
    setIsButtonLoading(true);
    onConfirm?.(closeDialog, setIsButtonLoading);
  };

  const getIcon = (type: ConfirmationType) => {
    switch (type) {
      case 'DELETE':
        return (
          <div className="flex items-center justify-center p-3 rounded-full bg-error-container text-error-50">
            <IconTrash stroke={2} />
          </div>
        );
      case 'INFO':
        return (
          <div className="flex items-center justify-center p-3 text-orange-500 bg-orange-200 rounded-full">
            <IconExclamationMark stroke={2} />
          </div>
        );
      case 'SUCCESS':
        return (
          <div className="flex items-center justify-center p-3 rounded-full text-success bg-success-90">
            <IconCheck stroke={2} />
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center p-3 rounded-full bg-error-container text-error-50">
            <IconTrash stroke={2} />
          </div>
        );
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute w-screen h-screen bg-black bg-opacity-50 z-[1000] top-0 left-0 flex justify-center items-center"
    >
      <div
        id="confirmation_dialog_container"
        className="flex flex-col gap-2 w-[500px] items-center bg-white rounded-md p-6 animate-scale shadow-2xl"
      >
        {getIcon(type)}

        {/* Title */}
        <div className="text-xl font-semibold text-slate-600">{title}</div>

        {/* Message */}
        <div className="font-medium text-slate-500">{message}</div>

        {/* Actions */}
        <div className="flex gap-2 pt-3">
          {/* Decline Button */}
          {hideDeclineButton ? null : (
            <ATMButton
              onClick={handleDecline}
              color="neutral"
              variant="outlined"
            >
              {declineText}
            </ATMButton>
          )}

          {/* Confirm Button */}
          <ATMButton
            autoFocus
            onClick={handleConfirm}
            color="primary"
            isLoading={isButtonLoading}
          >
            {confirmationText}
          </ATMButton>
        </div>
      </div>
    </div>
  );
};

export default ATMConfirmationDialog;
