import React, { useState, useCallback } from 'react';
import { FiUpload, FiFile, FiImage, FiX, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const DragDropUpload = ({ onFileSelect, acceptedTypes = ['text/*', 'image/*'], maxSize = '10MB' }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file) => {
    const maxSizeBytes = maxSize === '10MB' ? 10 * 1024 * 1024 : parseInt(maxSize);
    if (file.size > maxSizeBytes) {
      toast.error(`File size must be less than ${maxSize}`);
      return false;
    }
    return true;
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    const validFiles = files.filter(validateFile);

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newFiles = validFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      }));

      setUploadedFiles(prev => [...prev, ...newFiles]);
      toast.success(`${validFiles.length} file(s) uploaded successfully`);

      // Call the callback with the files
      onFileSelect(newFiles);
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Error processing files');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(f => f.id !== fileId);
    });
    toast.success('File removed');
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return FiImage;
    return FiFile;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
              <FiUpload className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {uploading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Processing your files...</span>
                </div>
              ) : (
                `Accepts ${acceptedTypes.join(', ')} files up to ${maxSize}`
              )}
            </p>
          </div>

          <input
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />

          <label
            htmlFor="file-upload"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <FiUpload className="h-4 w-4" />
            <span>Choose Files</span>
          </label>
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Uploaded Files ({uploadedFiles.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {uploadedFiles.map((uploadedFile) => {
              const Icon = getFileIcon(uploadedFile.type);
              return (
                <div key={uploadedFile.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(uploadedFile.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(uploadedFile.id)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Remove file"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Usage Tips */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          💡 Usage Tips
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Drag and drop files directly onto the upload area</li>
          <li>• Click "Choose Files" to select from file picker</li>
          <li>• Supported formats: Text files and images</li>
          <li>• Maximum file size: {maxSize}</li>
        </ul>
      </div>
    </div>
  );
};

export default DragDropUpload;
