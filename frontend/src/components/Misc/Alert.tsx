import React, { useState, useEffect } from "react";
import classNames from "classnames";

type AlertType = "error" | "warning" | "success";

type AlertProps = {
    message: string;
    type: AlertType;
    mode?: "inline" | "popup";
    onClose?: () => void;
};

const Alert: React.FC<AlertProps> = ({ message, type, mode = "inline", onClose }) => {
    const [visible, setVisible] = useState(false);

    // Trigger the appearance animation on mount
    useEffect(() => {
        setVisible(true);
    }, []);

    const handleClose = () => {
        setVisible(false); // Trigger fade-out animation
        setTimeout(() => {
            if (onClose) onClose();
        }, 300); // Delay removal to match animation duration
    };

    const alertStyles = classNames(
        "p-4 rounded-md shadow-md transition-opacity duration-300",
        {
            "opacity-100": visible,
            "opacity-0": !visible,
            "bg-red-100 text-red-800 border-red-400": type === "error",
            "bg-yellow-100 text-yellow-800 border-yellow-400": type === "warning",
            "bg-green-100 text-green-800 border-green-400": type === "success",
            "fixed top-4 left-4 z-50": mode === "popup",
            "relative": mode === "inline",
        }
    );

    return (
        <div className={alertStyles} role="alert">
            <div className="flex items-start">
                <span className="flex-1">{message}</span>
                <button
                    className="ml-4 text-lg font-semibold text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={handleClose}
                    aria-label="Close"
                >
                    &times;
                </button>
            </div>
        </div>
    );
};

export default Alert;
