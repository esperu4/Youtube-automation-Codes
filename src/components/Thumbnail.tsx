import React from 'react';
import { Video } from 'lucide-react';

interface ThumbnailProps {
  src?: string;
  alt?: string;
  className?: string;
}

export const Thumbnail: React.FC<ThumbnailProps> = ({ src, alt = '', className = '' }) => {
  if (!src) {
    return (
      <div
        className={`bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 border border-slate-200 ${className}`}
      >
        <Video className="h-4 w-4" />
      </div>
    );
  }
  return <img src={src} alt={alt} className={`object-cover shrink-0 border border-slate-200 ${className}`} />;
};