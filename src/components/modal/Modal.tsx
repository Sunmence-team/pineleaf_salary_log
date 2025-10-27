// components/Modal.jsx
import React from 'react';
import ReactDOM from 'react-dom';

interface modalProps {
    children: React.ReactNode;
    onClose: () => void;
}

const Modal = ({ children, onClose }: modalProps) => {
    const modalRoot = document.getElementById('modal-root');

    if (!modalRoot) {
        console.error('The "modal-root" element was not found in the DOM.');
        return null; // Or throw an error
    }

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/80 z-9999 flex items-center justify-center p-4">
            <div className="bg-white md:p-8 p-4 lg:w-1/2 md:w-3/4 w-full rounded-lg relative">
                <button
                    onClick={onClose}
                    type='button'
                    className="absolute md:top-8 md:right-8 top-4 right-4 text-pryClr transition-colors cursor-pointer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                {children}
            </div>
        </div>,
        modalRoot
    );
};

export default Modal;