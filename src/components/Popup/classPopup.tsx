import React from "react";

type PopupProps = {
  message: string;
  onClose: () => void;
};

const Popup: React.FC<PopupProps> = ({ message, onClose }) => (
  <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
    <div className="bg-white p-6 rounded shadow-lg w-80">
      <p className="text-black text-lg">{message}</p>
      <button
        onClick={onClose}
        className="mt-4 w-full rounded px-4 py-2 bg-primary text-white hover:bg-opacity-90"
      >
        Close
      </button>
    </div>
  </div>
);

export default Popup; // Ensure this export exists
