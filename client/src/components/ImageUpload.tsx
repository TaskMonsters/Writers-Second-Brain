import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadImageToS3, validateImageFile } from '@/lib/imageUpload';


interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      alert(error);
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImageToS3(file);
      onChange(url);
    } catch (error) {
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {value ? (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
          <img
            src={value}
            alt="Uploaded"
            className="w-full h-full object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={onRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full h-48 border-dashed"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </>
          )}
        </Button>
      )}
    </div>
  );
}
