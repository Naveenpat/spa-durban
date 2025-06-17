import React from 'react';
import { IconDownload, IconUpload } from '@tabler/icons-react';
import { Button } from '@mui/material';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';

interface GlobalImportExportProps {
  onImport?: (file: File) => void;
  onExport?: () => void;
  showImport?: boolean;
  showExport?: boolean;
  importLabel?: string;
  exportLabel?: string;
}

const GlobalImportExport: React.FC<GlobalImportExportProps> = ({
  onImport,
  onExport,
  showImport = true,
  showExport = true,
  importLabel = 'Import',
  exportLabel = 'Export',
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImport) {
      onImport(file);
    }
  };

  return (
    <div className="flex gap-2">
      {showImport && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex items-center gap-1 w-100">
            <ATMButton
              color="primary"
              onClick={() => fileInputRef.current?.click()}

            >
              {/* <IconUpload className="h-4 w-4" /> */}
              {importLabel}
            </ATMButton>
          </div>



        </>
      )}
      {showExport && (
        <ATMButton onClick={onExport} color="primary">
          {/* <IconDownload className="mr-2 h-4 w-4" /> */}
          {exportLabel}
        </ATMButton>
      )}
    </div>
  );
};

export default GlobalImportExport;
