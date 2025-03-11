"use client";

import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { QRCodeCanvas } from "qrcode.react";

import { db } from "../../../../../firebaseconfig";
import { collection, getDocs } from "firebase/firestore";
import { set } from "firebase/database";
const Page = () => {
  const [classData, setClassData] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [qrCodeCount, setQrCodeCount] = useState<number>(0);
  const qrRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const [visible, setVisible] = useState(false);
  const [studentQrData, setStudentQrData] = useState<String[]>([])

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
  const generatePDF = async () => {
    const doc = new jsPDF();
    const qrCodesPerRow = 4; // Number of QR codes per row
    const qrCodeSize = 30; // Size of each QR code
    const margin = 15; // Margin between QR codes
    const qrCodesPerPage = 20; // Number of QR codes per page
    doc.text("QR-Codes für die Schüler der Klasse " +selectedOption, 10, 5);
    
    const studentData: { name: string; class: string }[] = [];
    const querySnapshot = await getDocs(collection(db, selectedOption));
    querySnapshot.forEach((doc) => {
      studentData.push({
        name: doc.data().name + " " + doc.data().lastName,
        class: selectedOption,
      });
    });

    
    

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
        // set textsize
        doc.setFontSize(9);

        doc.text("Name: " + studentData[i - 1].name, x, y + 35);
        doc.text("Klasse: " + selectedOption, x, y + 40);
        if (i % qrCodesPerPage === 0 && i !== totalQRCodes) {
          page++;
          doc.addPage();
        }
      }
    }

    doc.save(selectedOption+"_QR-Codes.pdf");

    // Save the generated PDF
  };

  useEffect(() => {
    if (selectedOption) {
      const fetchData = async () => {
        const querySnapshot = await getDocs(collection(db, selectedOption));
        setQrCodeCount(querySnapshot.size);
        let i = 0;
        const studentData:String[]  = [];
        querySnapshot.forEach((doc) => {
          studentData.push(doc.id);
        });
        setStudentQrData(studentData);
        
      };
      fetchData();
    }
  }, [selectedOption]);

  return (
    <DefaultLayout>
      <div>
        {/* Dropdown to select class */}
        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
          Klasse auswählen
        </label>
        <select
          value={selectedOption}
          onChange={(e) => {
            setVisible(false); // Hide the button when the value changes
            setSelectedOption(e.target.value);
            setTimeout(() => {
              setVisible(true); // Delay this action
              // Delay setting the value
            }, 1000); // Delay of 1 second
          }}
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

        {/* Generate PDF button */}
        <div>
          <button
            style={{
              marginTop: "20px",
              cursor: visible ? "pointer" : "not-allowed",
              opacity: visible ? 1 : 0.6,
              
            }}
            disabled={visible ? false : true}
            onClick={async () => {
              generatePDF();
            }}
            
            className="w-full rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
          >
            Erstelle eine PDF zum Austeilen der QR-Codes am Sporttag
          </button>
        </div>

        {/* Generate QR codes dynamically */}
        <div className="hidden">
          {Array.from({ length: qrCodeCount }, (_, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) qrRefs.current[i] = el.querySelector("canvas");
              }}
            >
              <QRCodeCanvas
                value={`${selectedOption}-${studentQrData[i]}`} // Each QR code will be linked to its ID
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
