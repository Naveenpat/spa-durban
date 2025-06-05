import { useState } from 'react';
import { useAddFileUrlMutation } from '../services/FileExplorer';

type Props = {
  accept?: string;
  next: (file: {
    fileTitle: string;
    fileUrl: string;
    fileType: string;
  }) => void;
};

type FileType = 'IMAGE' | 'VIDEO' | 'DOCUMENT';
const useFileUploader = ({ next, accept = '*' }: Props) => {
  const [uploadedFile, setUplaodedFile] = useState<{
    fileName: string;
    fileUrl: string;
    fileType: FileType;
  } | null>(null);

  const [uploadFile] = useAddFileUrlMutation();

  const handleUpload = (file: File) => {
    let formData = new FormData();
    formData.append(
      'type',
      file.type?.includes('image') ? 'IMAGE' : 'DOCUMENT',
    );
    formData.append('name', file.name || 'file-title');
    formData.append('file', file || '');

    uploadFile(formData).then((res: any) => {
      if (res?.data?.status) {
        next(res?.data?.data);
        setUplaodedFile(null);
      } else {
        setUplaodedFile(null);
      }
    });
  };

  const initiateUpload = () => {
    let input = document.createElement('input');
    input.accept = accept;
    input.type = 'file';
    input.className = 'hidden';
    input.value = '';
    input.click();
    input.addEventListener('change', (e: any) => {
      setUplaodedFile({
        fileName: e.target?.files?.[0]?.name || '',
        fileUrl: e.target?.files?.[0]
          ? URL.createObjectURL(e.target?.files?.[0])
          : '',
        fileType: e.target.files?.[0]?.type?.includes('image')
          ? 'IMAGE'
          : 'DOCUMENT',
      });
      handleUpload(e.target.files?.[0] || new File([], ''));
    });
  };

  const returnData = {
    uploadedFile,
    initiateUpload,
  };

  return returnData;
};

export default useFileUploader;
