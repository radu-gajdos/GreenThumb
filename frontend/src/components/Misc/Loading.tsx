import React from "react";

type LoadingProps = {
    message?: string; // Optional loading message
    size?: "small" | "medium" | "large"; // Size variations
};

const Loading: React.FC<LoadingProps> = ({ message = "Loading...", size = "medium" }) => {
    const sizeClasses = {
        small: "w-6 h-6 border-2",
        medium: "w-10 h-10 border-4",
        large: "w-16 h-16 border-4",
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div
                className={`animate-spin rounded-full border-t-4 border-gray-300 ${sizeClasses[size]} border-t-green-600`}
            />
            {message && <p className="text-gray-600 text-sm">{message}</p>}
        </div>
    );
};

export default Loading;
