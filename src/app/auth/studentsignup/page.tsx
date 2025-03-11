"use client";

import React, { useState } from "react";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const QrReader = dynamic(
  () => import("react-qr-reader").then((mod) => mod.QrReader),
  { ssr: false },
);

const SignUpStudent = () => {
  const router = useRouter();
  const [showScanner, setShowScanner] = useState(false);
  const [qrData, setQrData] = useState("");

  const handleScan = (data: string | null) => {
    let i = 0;
    if (data && i == 0) {
      i + 1;
      setQrData(data);
      setShowScanner(false); // Close the scanner after a successful scan

      router.push(`/auth/studentsignup/${data}`);
    }
  };

  const handleError = (err: any) => {
    console.error(err);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">Student Signup</h2>
        <button
          onClick={() => setShowScanner(true)}
          className="mb-4 w-full rounded bg-primary px-6 py-2 font-medium text-white hover:bg-primary-dark"
        >
          Open Camera
        </button>
        {showScanner && (
          <div className="mb-4 rounded-lg border border-gray-300 p-4 shadow-inner">
            <QrReader
              onResult={(result: any, error: any) => {
                if (result) handleScan(result?.text);
                if (error) handleError(error);
              }}
              constraints={{ facingMode: 'environment' }}
              className="w-full"
            />
          </div>
        )}
        {qrData && (
          <p className="mt-4 rounded bg-green-100 p-4 text-center text-green-800">
            Scanned QR Code Data: {qrData}
          </p>
        )}
      </div>
    </div>
  );
};

export default SignUpStudent;
