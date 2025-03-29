import { X } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './button';

interface DropzoneSingleFileProps {
  onFileUpload: (file: File | null) => void;
  initialFile?: string | null;
}

const DropzoneSingleFile: React.FC<DropzoneSingleFileProps> = ({ onFileUpload, initialFile }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle initial file if provided
  useEffect(() => {
    if (initialFile) {
      setFilePreview(initialFile);
    }
  }, [initialFile]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const selectedFile = e.dataTransfer.files?.[0];
    if (selectedFile) {
      onFileUpload(selectedFile);
      generatePreview(selectedFile);
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      onFileUpload(selectedFile);
      generatePreview(selectedFile);
    }
  };

  const generatePreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileUpload(null);
  };

  return (
    <div className='border rounded-lg p-4 bg-white text-black dark:bg-muted-950 dark:text-muted-100 dark:border-muted-800'>
      {!filePreview ? (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className='relative'
        >
          <label
            htmlFor="DropzoneSingleFile"
            className={`flex min-h-[260px] items-center justify-center rounded-lg cursor-pointer border-[1px] border-dashed p-10 transition-colors ${
              isDragActive ? 'border-primary' : 'border-gray-300 dark:border-muted-700'
            } bg-gray-50 dark:bg-muted-950 hover:border-primary`}
          >
            <input
              ref={fileInputRef}
              type="file"
              id="DropzoneSingleFile"
              onChange={handleFileInput}
              className="hidden"
            />
            <div>
              <div className="mx-auto mb-5 flex aspect-square w-[68px] items-center justify-center rounded-full bg-gray-200 text-black dark:bg-white/5 dark:text-white">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M24.5438 4.85623H14.4376L13.5188 3.10623C13.0376 2.23123 12.1626 1.66248 11.1563 1.66248H3.45635C1.96885 1.66248 0.787598 2.84373 0.787598 4.33123V23.6687C0.787598 25.1562 1.96885 26.3375 3.45635 26.3375H24.5876C26.0751 26.3375 27.2563 25.1562 27.2563 23.6687V7.52498C27.2563 6.03748 26.0313 4.85623 24.5438 4.85623ZM25.2876 23.6687C25.2876 24.0625 24.9813 24.3687 24.5876 24.3687H3.45635C3.0626 24.3687 2.75635 24.0625 2.75635 23.6687V4.33123C2.75635 3.93748 3.0626 3.63123 3.45635 3.63123H11.1563C11.4188 3.63123 11.6376 3.76248 11.7688 4.02498L12.9938 6.29998C13.1688 6.60623 13.5188 6.82498 13.8688 6.82498H24.5876C24.9813 6.82498 25.2876 7.13123 25.2876 7.52498V23.6687Z"
                    fill="currentColor"
                  />
                  <path
                    d="M14.7003 10.675C14.3065 10.2812 13.694 10.2812 13.3003 10.675L9.49404 14.4375C9.10029 14.8312 9.10029 15.4437 9.49404 15.8375C9.88779 16.2312 10.5003 16.2312 10.894 15.8375L13.0378 13.7375V20.125C13.0378 20.65 13.4753 21.1312 14.044 21.1312C14.6128 21.1312 15.0065 20.6937 15.0065 20.125V13.6937L17.194 15.8375C17.369 16.0125 17.6315 16.1 17.894 16.1C18.1565 16.1 18.419 16.0125 18.594 15.7937C18.9878 15.4 18.9878 14.7875 18.594 14.3937L14.7003 10.675Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div>
                <p className="mb-2 text-center text-base text-gray-700 dark:text-muted-100">
                  Trage un fișier aici sau
                  <label
                    htmlFor="DropzoneSingleFile"
                    className="font-medium text-primary ms-1 cursor-pointer"
                  >
                    Adaugă din dispozitiv
                  </label>
                </p>
                <p className="text-center text-sm text-gray-500 dark:text-muted-400">
                  Max 10 MB dimensiune permisă
                </p>
              </div>
            </div>
          </label>
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-center">
          <div className="w-1/2 mb-4">
            <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-muted-700">
              <img
                src={filePreview}
                alt="File preview"
                className="w-full h-auto max-h-[200px] object-contain"
              />
            </div>
          </div>
  
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="mt-2"
          >
            Delete image
          </Button>
        </div>
      )}
    </div>
  );
  
};

export default DropzoneSingleFile;