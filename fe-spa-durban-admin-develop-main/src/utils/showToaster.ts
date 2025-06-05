import { toast } from 'react-hot-toast';

type ToastType = 'success' | 'error' | 'loading' | 'custom';

export const showToast = (type: ToastType, message: string) => {
  toast[type](message, {
    duration: 5000,
    position: 'bottom-center',
    className: `border-l-4 ${
      type === 'success' ? 'border-green-500' : 'border-red-500'
    } border-green-500`,
  });
};
