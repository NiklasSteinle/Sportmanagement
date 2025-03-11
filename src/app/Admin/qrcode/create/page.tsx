"use client";

import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { QRCodeCanvas } from "qrcode.react";

const Page = () => {
  const [classData, setClassData] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [qrCodeCount, setQrCodeCount] = useState<number>(0);
  const qrRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  // Fetch classes data from the server
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/listCollections");
      if (!response.ok) {
        throw new Error("Failed to fetch class data");
      }
      const data = await response.json();
      const collections = data.collections || [];
      setClassData(collections);
    };
    fetchData();
  }, []);

  // Generate PDF with QR codes
  const generatePDF = () => {
    const doc = new jsPDF();
    const qrCodesPerRow = 5; // Number of QR codes per row
    const qrCodeSize = 30; // Size of each QR code
    const margin = 10; // Margin between QR codes
    const qrCodesPerPage = 28; // Number of QR codes per page
    doc.text("QR-Codes für die Schüler", 10, 5);
    const totalQRCodes = qrCodeCount;
    // Loop through values 01 to 20 and generate QR codes
    for (let i = 1; i <= qrCodeCount; i++) {
      // Access the QR code canvas element
      const canvas = qrRefs.current[i - 1];
      let page = 0;

      if (canvas) {
        // Ensure that the canvas is properly rendered
        const imgData = canvas.toDataURL("image/png");
        let a = 1;

        // Add the image to the PDF
        const positionIndex = (i - 1) % qrCodesPerPage;
        const x =
          margin + (positionIndex % qrCodesPerRow) * (qrCodeSize + margin);
        const y =
          margin +
          Math.floor(positionIndex / qrCodesPerRow) * (qrCodeSize + margin);
        const width = 30;
        const height = 30;

        doc.addImage(imgData, "PNG", x, y, width, height);

        if (i % qrCodesPerPage === 0 && i !== totalQRCodes) {
          page++;
          doc.addPage();
        }
      }
    }

    // Save the generated PDF
    doc.save("qr-codes.pdf");
  };

  return (
    <DefaultLayout>
      <div>
        {/* Dropdown to select class */}
        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
          Klasse auswählen
        </label>
        <select
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          className="w-full rounded border border-stroke bg-transparent px-12 py-3 dark:border-strokedark  dark:bg-gray-800"
        >
          <option value="" disabled>
            Klasse auswählen
          </option>
          {classData.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {/* Input for number of QR codes */}
        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
          Anzahl QR-Codes
        </label>
        <input
          type="number"
          onChange={(e) => setQrCodeCount(Number(e.target.value))}
          className="w-full rounded border border-stroke bg-transparent px-12 py-3 dark:border-strokedark"
        />

        {/* Generate PDF button */}
        <div>
          <button
            onClick={generatePDF}
            style={{ marginTop: "20px" }}
            className="w-full rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
          >
            Erstelle eine PDF zum Austeilen der QR-Codes zum Anmelden
          </button>
        </div>

        {/* Generate QR codes dynamically */}
        <div style={{ display: "none" }}>
          {Array.from({ length: qrCodeCount }, (_, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) qrRefs.current[i] = el.querySelector("canvas");
              }}
            >
              <QRCodeCanvas
                value={`${selectedOption}-${String(i + 1).padStart(2, "0")}`} // Each QR code will be linked to its ID
                size={128} // Set size of the QR code
                // No renderAs prop needed; it defaults to canvas
              />
            </div>
          ))}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Page;
