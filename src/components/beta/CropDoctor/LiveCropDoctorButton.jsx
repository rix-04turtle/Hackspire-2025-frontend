import React from 'react';
import Link from 'next/link';
import { Video, Activity } from 'lucide-react';

/**
 * Quick access button for Live Crop Doctor
 * Can be placed in navigation bars or quick access menus
 */
export default function LiveCropDoctorButton({ variant = 'default', size = 'md' }) {
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
    };

    const variantClasses = {
        default: 'bg-blue-600 hover:bg-blue-700 text-white',
        outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
        ghost: 'text-blue-600 hover:bg-blue-50'
    };

    return (
        <Link href="/live-crop-doctor">
            <button 
                className={`
                    inline-flex items-center gap-2 rounded-lg font-semibold
                    transition-all duration-200 shadow-md hover:shadow-lg
                    ${sizeClasses[size]}
                    ${variantClasses[variant]}
                `}
            >
                <div className="relative">
                    <Video className="w-5 h-5" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </div>
                <span>Live Mode</span>
            </button>
        </Link>
    );
}

/**
 * Floating action button version for mobile
 */
export function LiveCropDoctorFAB() {
    return (
        <Link href="/live-crop-doctor">
            <button 
                className="
                    fixed bottom-20 right-4 z-50
                    w-14 h-14 rounded-full
                    bg-blue-600 hover:bg-blue-700 text-white
                    shadow-2xl hover:shadow-3xl
                    transition-all duration-200
                    flex items-center justify-center
                    group
                "
            >
                <div className="relative">
                    <Video className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </div>
            </button>
        </Link>
    );
}
