"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Popup from "@/components/Popup/classPopup"; // Import Popup component
import { getClasses, getStudents } from "./data"; // Import data fetching functions
import { db } from "../../../../firebaseconfig";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { get } from "http";
import { set } from "firebase/database";

export default function ClassManagement() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [classData, setClassData] = useState<string[]>([]); // List of available classes
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [nameData, setNameData] = useState<string[]>([]);

  const router = useRouter();

  useEffect(() => {
    // Fetch the available classes when the component mounts
    const fetchClasses = async () => {
      const classes = await getClasses(); // Fetch classes from data.ts
      setClassData(classes);
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    const getStudentNames = async () => {
      const studentnames: string[] = [];
      students.forEach((student) => {
        const name = student.name;
        studentnames.push(name);
      });
      console.log(studentnames);
      setNameData(studentnames);
    };
    getStudentNames();
  }, [students]);

  useEffect(() => {
    // Fetch students when a subclass is selected
    if (selectedClass) {
      const fetchStudents = async () => {
        const studentsArray = await getStudents(selectedClass); // Fetch students from data.ts
        setStudents(studentsArray);
      };

      fetchStudents();
    }
  }, [selectedClass]);

  const handleClassSelection = (className: string) => {
    setSelectedClass(className);
  };

  const handleStudentRedirect = (studentId: string, selectedclass:string) => {
    router.push(`/student/${selectedClass}/${studentId}`);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setNewClassName("");
  };

  const formatClassName = (input: string) =>
    input.replace(/\s+/g, "").toLowerCase();

  const addClass = () => {
    if (newClassName) {
      const formattedClassName = formatClassName(newClassName);
      if (classData.includes(formattedClassName)) {
        setPopupMessage("Diese Klasse existiert bereits."); // Set popup message
        return;
      } else {
        const docRef = doc(db, formattedClassName, "01");
        setDoc(docRef, {});
      }
      setClassData((prevState) => [...prevState, formattedClassName]);
      closeModal();
    }
  };

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(null), 3000); // Hide alert after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  return (
    <DefaultLayout>
      <div className="min-h-screen p-6">
        <h1 className="mb-6 text-2xl font-bold">Klassenverwaltung</h1>

        {/* Class List */}
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-semibold">Verfügbare Klassen:</h2>
          <ul className="space-y-2">
            {classData.length > 0 ? (
              classData.map((className) => (
                <li key={className}>
                  <button
                    onClick={() => handleClassSelection(className)}
                    className="dark:hover:bg-primary-dark w-full rounded bg-gray-200 px-4 py-2 text-left font-medium text-black hover:bg-primary hover:text-white dark:bg-gray-700 dark:text-gray-100 dark:hover:text-white"
                  >
                    {className}
                  </button>
                </li>
              ))
            ) : (
              <p className="text-gray-500">Keine Klassen verfügbar.</p>
            )}
          </ul>
          <button
            onClick={openModal}
            className="mt-4 w-full rounded bg-primary px-4 py-2 text-left font-medium text-white hover:bg-opacity-90"
          >
            Neue Klasse hinzufügen
          </button>
        </div>

        {/* Student List */}
        {selectedClass && (
          <div>
            <h2 className="mb-4 text-lg font-semibold">
              Schüler in {selectedClass}:
            </h2>
            {students.length > 1 || nameData[0] != undefined ? (
              <ul className="space-y-2">
                {students.map((student) =>
                  student.name != undefined ? (
                    <li
                      key={student.id}
                      className="dark:hover:bg-primary-dark flex cursor-pointer justify-between rounded bg-gray-100 p-2 dark:bg-gray-700 dark:text-gray-100"
                      onClick={() => handleStudentRedirect(student.id,selectedClass)}
                    >
                      <span>
                        {student.name} {student.lastName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {student.id}
                      </span>
                    </li>
                  ) : null,
                )}
              </ul>
            ) : (
              <p className="text-gray-500">
                Keine Schüler in dieser Klasse gefunden.
              </p>
            )}
          </div>
        )}

        {/* Modal for Adding Class or Subclass */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
            <div className="w-96 rounded bg-white p-6 shadow-lg dark:bg-gray-800">
              <h2 className="mb-4 text-xl">Neue Klasse hinzufügen</h2>
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Neue Klasse (z.B. 1a)"
                className="mb-4 w-full border p-2 dark:border-gray-500 dark:bg-gray-900"
              />
              <button
                onClick={addClass}
                className="w-full rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90"
              >
                Klasse hinzufügen
              </button>
              <button
                onClick={closeModal}
                className="dark:hover:bg-primary-dark mt-4 w-full rounded bg-gray-200 px-4 py-2 text-black hover:bg-opacity-90 dark:bg-gray-700 dark:text-gray-100"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {/* Popup */}
        {popupMessage && (
          <Popup message={popupMessage} onClose={() => setPopupMessage(null)} />
        )}
      </div>
    </DefaultLayout>
  );
}
export async function getServerSideProps() {
  const classes = await getClasses();
  return {
    props: {
      classes,
      students: [],
    },
  };
}