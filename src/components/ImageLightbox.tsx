
import React from 'react';
import { X } from 'lucide-react';

interface ImageLightboxProps {
    image: string | null;
    onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ image, onClose }) => {
    if (!image) return null;
    return (
        <div
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-10 cursor-zoom-out"
            onClick={onClose}
        >
            <button className="absolute top-6 right-6 text-white p-2 bg-white/10 rounded-full"><X size={32} /></button>
            <img
                src={image}
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in-95"
                alt="Full size"
            />
        </div>
    );
};

export default ImageLightbox;
