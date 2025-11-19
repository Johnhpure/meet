import React, { useState } from 'react';
import { Button, Card, CardBody } from '@heroui/react';

interface ImageUploadProps {
  value?: Array<{ url: string }>;
  onChange?: (images: Array<{ url: string }>) => void;
  maxCount?: number;
  onUpload: (file: File) => Promise<string>;
  placeholder?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value = [],
  onChange,
  maxCount = 1,
  onUpload,
  placeholder = '点击上传图片'
}) => {
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    try {
      const uploadPromises = Array.from(files).slice(0, maxCount - value.length).map(file => onUpload(file));
      const urls = await Promise.all(uploadPromises);
      const newImages = urls.map(url => ({ url }));
      onChange?.([...value, ...newImages]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (index: number) => {
    onChange?.(value.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-wrap gap-3">
      {value.map((image, index) => (
        <div key={index} className="relative group">
          <Card className="w-24 h-24 sm:w-28 sm:h-28 overflow-hidden">
            <CardBody className="p-0">
              <img 
                src={image.url} 
                alt={`upload-${index}`} 
                className="w-full h-full object-cover" 
              />
            </CardBody>
          </Card>
          <Button
            isIconOnly
            size="sm"
            color="danger"
            variant="flat"
            radius="full"
            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onPress={() => handleRemove(index)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      ))}
      
      {value.length < maxCount && (
        <label className="cursor-pointer">
          <Card 
            className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-dashed border-default-300 hover:border-primary transition-colors"
            isPressable
          >
            <CardBody className="flex items-center justify-center p-2">
              {loading ? (
                <div className="text-center">
                  <svg className="animate-spin h-6 w-6 text-primary mx-auto" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-xs text-default-400 mt-1">上传中</p>
                </div>
              ) : (
                <div className="text-center">
                  <svg className="w-8 h-8 text-default-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="text-xs text-default-400 mt-1 leading-tight">{placeholder}</p>
                </div>
              )}
            </CardBody>
          </Card>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            multiple={maxCount > 1}
            onChange={handleFileChange}
            disabled={loading}
          />
        </label>
      )}
    </div>
  );
};

export default ImageUpload;
