import React, { useState } from "react";
import Modal from "./Modal"; // Assuming Modal component exists in this location

interface VerificationCodeDialogProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onCancel: () => void;
  onConfirm: (code: string) => void;
  isLoading: boolean;
}

const VerificationCodeDialog = ({
  isOpen,
  title = "Verification Required",
  message = "Enter the 6-digit code from your authenticator app.",
  confirmText = "Verify",
  cancelText = "Cancel",
  onCancel,
  onConfirm,
  isLoading = false,
}: VerificationCodeDialogProps) => {
  const [code, setCode] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    const target = e.target as HTMLInputElement;

    if (value.length > 1) {
      const pastedDigits = value.replace(/[^0-9]/g, "");
      const newCode = code.split("");

      for (let i = 0; i < pastedDigits.length; i++) {
        if (index + i < 6) {
          newCode[index + i] = pastedDigits[i];
        }
      }

      const finalCode = newCode.join("").slice(0, 6);
      setCode(finalCode);

      const lastPastedIndex = Math.min(5, index + pastedDigits.length - 1);
      const inputs = target.parentElement?.children;
      if (inputs) {
        (
          inputs[
            finalCode.length === 6 ? 5 : lastPastedIndex
          ] as HTMLInputElement
        )?.focus();
      }
      return;
    }

    if (/^[0-9]$/.test(value)) {
      const newCode = code.split("");
      newCode[index] = value;
      setCode(newCode.join("").slice(0, 6));

      if (index < 5) {
        (target.nextElementSibling as HTMLInputElement)?.focus();
      }
    } else if (value === "") {
      const newCode = code.split("");
      newCode[index] = "";
      setCode(newCode.join(""));
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      if (!code[index] && index > 0) {
        (e.target as HTMLInputElement).previousElementSibling?.focus();
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = () => {
    const finalCode = code.replace(/ /g, "");
    console.log(finalCode);
    if (finalCode.length === 6) {
      onConfirm(finalCode);
    }
  };

  return (
    <Modal onClose={onCancel}>
      <div className="p-4 text-center">
        <h4 className="text-xl font-semibold mb-4">{title}</h4>
        <p className="text-sm text-gray-600 mb-4">{message}</p>

        <div className="flex justify-center gap-2 mb-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <input
              key={index}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={code[index] || ""}
              onChange={(e) => handleInputChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-10 h-12 border rounded-lg text-center text-lg font-semibold tracking-widest"
              aria-label={`Digit ${index + 1} of 6`}
            />
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <button
            onClick={onCancel}
            className="w-full md:w-1/2 h-[50px] rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            onClick={handleSubmit}
            className="w-full md:w-1/2 h-[50px] bg-pryClr text-white rounded-lg hover:bg-pryClr/90 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default VerificationCodeDialog;
