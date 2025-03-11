"use client";

import { useEffect, useState } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
import { collection, getDocs, where, query } from "firebase/firestore";
import { db } from "../../../../firebaseconfig"; // Replace with your Firestore configuration
import "./page.css";
import Loader from "@/components/common/Loader";

const QrReader = dynamic(() => import("react-qr-reader").then(mod => mod.QrReader), { ssr: false });

const Page = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [qrData, setQrData] = useState("");
  const [classes, setClasses] = useState<Record<string, string[]>>({});
  const [students, setStudents] = useState<Record<string, any[]>>({});
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();
  const params = useParams();

  const disciplineId = params?.slug;

  const fetchStudents = async (collectionName: string) => {
    const q = query(collection(db, collectionName));
    const querySnapshot = await getDocs(q);
    const students = querySnapshot.docs.map(doc => doc.data());
    return students;
  };

  


  useEffect(() => {
    const fetchClassesAndStudents = async () => {
      try {
        // Fetch classes from the API route
        const response = await fetch("/api/listCollections");
        if (!response.ok) {
          throw new Error("Failed to fetch class data");
        }
        const data = await response.json();
        const collections = data.collections || [];
  
        const classData: Record<string, string[]> = {};
        const studentData: Record<string, any[]> = {};
  
        // Iterate over the collections to fetch students
        for (const collectionName of collections) {
          const classPrefix = collectionName[0]; // Example: "1", "2", etc.
          const subclass = collectionName.slice(1); // Example: "a", "b", etc.
  
          // Organize classes and subclasses
          if (!classData[classPrefix]) {
            classData[classPrefix] = [];
          }
          classData[classPrefix].push(subclass);
  
          // Fetch students for the current collection
          const studentsResponse = await fetchStudents(collectionName);
          
          const studentsData = studentsResponse.length ? studentsResponse : [];
          studentData[collectionName] = studentsData;
          
          
          
        }
  
        setClasses(classData);
        setStudents(studentData);
        
      } catch (error) {
        console.error("Error fetching classes and students:", error);
      }
    };
    fetchClassesAndStudents();
  }, []);

  const handleRedirect = (studentId: string) => {
    
    router.push(`/add/${disciplineId}/${selectedClass}${selectedType}-${studentId}`);
  };

  useEffect(() => {
    
    
  }
  , [students]);

  const handleShowStudents = () => {
    setShowModal(true); // Open modal
  };

  const handleCloseModal = () => {
    setShowModal(false); // Close modal
  };

  const handleScan = (data: string | null) => {
    let i = 0;
    if (data && i == 0) {
      i+1;
      setQrData(data);
      setShowScanner(false); // Close the scanner after a successful scan
      
      router.push(`/add/${disciplineId}/${data}`);
    }
  };

  const handleError = (err: any) => {
    console.error(err);
  };

  if(Object.keys(students).length === 0){
    return <Loader  />;
  }

  return (
    <div>
      <DefaultLayout>
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* QR Scanner */}
          <div className="h-min w-full lg:w-1/2 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800 mb-5 lg:mb-0 lg:mr-5">
            <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-gray-100">Scan QR Code</h2>
            <button
              onClick={() => setShowScanner(true)}
              className="mb-4 w-full rounded bg-primary px-6 py-2 font-medium text-white hover:bg-primary-dark"
            >
              Open Camera
            </button>
            {showScanner && (
              <div className="mb-4 rounded-lg border border-gray-300 p-4 shadow-inner dark:border-gray-600">
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
              <p className="mt-4 rounded bg-green-100 p-4 text-center text-green-800 dark:bg-green-900 dark:text-green-200">
                Scanned QR Code Data: {qrData}
              </p>
            )}
          </div>

          {/* Class Selector */}
          <div className="w-full lg:w-1/2 p-6 bg-gray-100 dark:bg-gray-800 h-min">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Select a School Class</h2>
            <ul className="space-y-2">
              {Object.keys(classes).map(classNumber => (
                <li key={classNumber}>
                  <button
                    onClick={() => {
                      setSelectedClass(classNumber);
                      setSelectedType(""); // Reset type selection when class changes
                    }}
                    className={`w-full rounded px-4 py-2 text-left font-medium 
                      ${selectedClass === classNumber ? "bg-primary text-white dark:bg-primary-dark" : "bg-gray-200 text-black hover:bg-primary hover:text-white dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-primary-dark dark:hover:text-white"}`}
                  >
                    Class {classNumber}
                  </button>
                </li>
              ))}
            </ul>
            {selectedClass && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Select a Subclass for {selectedClass}</h3>
                <ul className="space-y-2 mt-2">
                  {classes[selectedClass].map(subclass => (
                    <li key={subclass}>
                      <button
                        onClick={() => setSelectedType(subclass)}
                        className={`w-full rounded px-4 py-2 text-left font-medium 
                          ${selectedType === subclass ? "bg-secondary text-white dark:bg-secondary-dark" : "bg-gray-200 text-black hover:bg-secondary hover:text-white dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-secondary-dark dark:hover:text-white"}`}
                      >
                        {subclass}
                      </button>
                    </li>
                  ))}
                </ul>
                {selectedType && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Selected Subclass: <span className="font-bold">{selectedType}</span>
                    </p>
                    <button
                      onClick={handleShowStudents}
                      className="mt-4 rounded bg-green-500 px-6 py-2 font-medium text-white hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800"
                    >
                      Show Students in {selectedClass}{selectedType}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal for Students */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 w-96 shadow-lg dark:bg-gray-800">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                  Students in {selectedClass}{selectedType}
                </h2>
                <ul className="space-y-2">
                  {(students[`${selectedClass}${selectedType}`] || []).map(student => (
                    <li
                      key={selectedClass+selectedType+student.uid}
                      className="flex justify-between bg-gray-100 p-2 rounded cursor-pointer dark:bg-gray-700"
                      onClick={() => handleRedirect(student.uid)}
                    >
                      <span>{student.name} {student.lastName}</span>
                      <span className="text-sm text-gray-500">{student.uid}</span>

                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleCloseModal}
                  className="mt-4 rounded bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </DefaultLayout>
    </div>
  );
};

export default Page;