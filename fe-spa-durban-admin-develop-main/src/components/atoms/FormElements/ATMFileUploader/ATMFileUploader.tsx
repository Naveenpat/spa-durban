import { IconPlus, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import ATMCircularProgress from '../../ATMCircularProgress/ATMCircularProgress';
import ATMFieldLabel from '../../ATMFieldLabel/ATMFieldLabel';
import { ErrorMessage } from 'formik';
import ATMFieldError from '../../ATMFieldError/ATMFieldError';
import { showToast } from '../../../../utils/showToaster';
import { FILE_MANAGER_URL } from '../../../../utils/constants';
import { useAddFileUrlMutation } from 'src/modules/Product/service/ProductServices';

type Props = {
  name: string;
  label: string;
  value: string;
  onChange: (file: string) => void;
  accept?: string;
  required?: boolean;
  folderName?: string;
};

const ATMFileUploader = ({
  name,
  label,
  value,
  onChange,
  required = false,
  accept = 'image/*',
  folderName = 'default',
}: Props) => {
  const [fileUrl, setFileUrl] = useState<string>('');
  const [isFileUploading, setIsFileUploading] = useState<boolean>(false);
  const [uploadFile] = useAddFileUrlMutation();

  const handleFieldClick = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = accept;
    fileInput.classList.add('hidden');
    fileInput.onchange = (event: any) => {
      setFileUrl(URL.createObjectURL(event.target?.files?.[0]));
      setIsFileUploading(true);

      const safeFolder = (folderName || 'default')
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '-')
      let formData = new FormData();
      // formData.append('bucketName', 'spa-durban-admin');
      // formData.append('file', event.target?.files?.[0]);
      formData.append('folder', safeFolder) // 👈 Add folder name
      formData.append('file', event.target?.files?.[0])
      uploadFile(formData).then((res: any) => {
        if (res?.error) {
          showToast('error', res?.error?.data?.message);
        } else {
          if (res?.data) {
            // onChange(`${FILE_MANAGER_URL}/${res?.data?.file_path}`);
            onChange(res?.data?.file_path);
            setFileUrl('');
            setIsFileUploading(false);
          } else {
            showToast('error', res?.data?.message);
          }
        }
        setFileUrl('');
        setIsFileUploading(false);
      });
    };

    document.body.appendChild(fileInput);
    fileInput.click();
  };

  return (
    <div className={`relative  `}>
      {/* Label */}
      <ATMFieldLabel htmlFor={name}>
        {label}
        {required && <span className="font-semibold text-red-500"> * </span>}
      </ATMFieldLabel>


      {/* File Uploader Input */}
      <div
        onClick={handleFieldClick}
        className={` border-2 border-gray-300 border-dashed rounded h-[200px] w-full p-2 cursor-pointer relative ${isFileUploading && 'opacity-50'
          }`}
      >
        {value || fileUrl ? (
          <img
            src={`${process.env.REACT_APP_BASE_URL}/${value}`}
            alt="Prouduct Image"
            className="object-scale-down w-full h-full rounded"
          />

        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100 rounded">
            <IconPlus />
          </div>
        )}

        {/* Loader */}
        {isFileUploading && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-50 rounded"
          >
            <ATMCircularProgress />
          </div>
        )}

        {value && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
              setFileUrl('');
            }}
            className="absolute p-1 rounded-full bg-error-container text-error-onContainer -top-3 -right-3"
          >
            <IconX size={18} />
          </div>
        )}
      </div>

      <ErrorMessage name={name}>
        {(errorMessage) => <ATMFieldError> {errorMessage} </ATMFieldError>}
      </ErrorMessage>
    </div>
  );
};

export default ATMFileUploader;
