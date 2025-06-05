import { ReactNode } from 'react';
import { Size } from '../../../utils';
import ATMDialog from '../../atoms/ATMDialog/ATMDialog';
import { ATMButton } from '../../atoms/ATMButton/ATMButton';

type Props = {
  onClose: () => void;
  onDraft?: () => void;
  children: ReactNode;
  title: string;
  isSubmitting: boolean;
  isSubmitButtonDisabled?: boolean;
  isDraftSubmitting?: boolean;
  draftbtn?: boolean;
  size?: Size;
  isSubmitButtonHide?: boolean;
};

const getWidth = (size: Size) => {
  switch (size) {
    case 'small':
      return 'md:min-w-[30rem]';
    case 'medium':
      return 'md:min-w-[50rem]';
    case 'large':
      return 'md:min-w-[80rem]';
  }
};

const MOLFormDialog = ({
  onClose,
  onDraft,
  children,
  title,
  isSubmitting,
  size = 'small',
  isSubmitButtonDisabled = false,
  isSubmitButtonHide = true,
  draftbtn = false,
  isDraftSubmitting = false,
}: Props) => {
  return (
    <ATMDialog>
      <div
        className={`flex flex-col relative ${getWidth(
          size,
        )} min-w-[95vw] max-h-[90vh] overflow-auto hide-scrollbar `}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-4 py-2 bg-white z-[10000]">
          <span className="text-lg font-semibold text-slate-700">{title}</span>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 ">{children}</div>

        {/* Actions */}
        <div className="sticky bottom-0 flex items-center justify-end gap-2 px-4 py-3 bg-white">
          <ATMButton onClick={onClose} variant="outlined" color="neutral">
            Cancel
          </ATMButton>

          {draftbtn && (
            <ATMButton
              onClick={onDraft}
              variant="text"
              type="button"
              isLoading={isDraftSubmitting}
            >
              Save as Draft
            </ATMButton>
          )}
          {isSubmitButtonHide && (
            <ATMButton
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitButtonDisabled}
            >
              Submit
            </ATMButton>
          )}
        </div>
      </div>
    </ATMDialog>
  );
};

export default MOLFormDialog;
