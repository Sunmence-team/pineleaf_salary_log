import Modal from './Modal';

interface ConfirmDialogProps {
    isOpen: boolean,
    title?: string,
    message?: string,
    confirmText?: string,
    cancelText?: string,
    onCancel: () => void,
    onConfirm: () => void,
    isLoading: boolean,
}

const ConfirmDialog = ({
    isOpen,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmText = "Yes, Confirm",
    cancelText = "Cancel",
    onCancel,
    onConfirm,
    isLoading = false
}: ConfirmDialogProps) => {
    if (!isOpen) return null;

    return (
        <Modal onClose={onCancel}>
            <div className="p-4 text-center">
                <h4 className="text-xl font-semibold mb-4">{title}</h4>
                <p className="text-pryClr mb-6">{message}</p>
                <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={onCancel}
                        className="w-full md:w-1/2 h-[50px] rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="w-full md:w-1/2 h-[50px] bg-pryClr text-white rounded-lg hover:bg-pryClr/90 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isLoading}
                    >
                        {isLoading ? "Please wait..." : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmDialog;
