"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Popup from "@/components/Popup/classPopup"; // Import Popup component
import { db } from "../../../../firebaseconfig";
import { collection, doc, setDoc } from "firebase/firestore";
import { set } from "firebase/database";

export default function ClassManagement() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [classData, setClassData] = useState<string[]>([]);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  const router = useRouter();

  // Klassen laden
  useEffect(() => {
    const fetchClasses = async () => {
      const classes = await fetch("/api/listCollections").then(async (res) => {
        console.log(res.status);
        if (!res.ok) {
          throw new Error("Fehler beim Laden der Klassen");
        } else {
          return res.json();
        }

        
      })
      .then((data) => {
        console.log(data);
        return data.collections || [];
      });
      setClassData(classes);
      
    };
    console.log("classData");
    console.log(classData);
    fetchClasses();
  }, []);

  // Schüler laden, wenn Klasse ausgewählt wird
  useEffect(() => {
    if (selectedClass) {
      const fetchStudents = async () => {
        try {
          const response = await fetch(`/api/getStudents?class=${selectedClass}`);
          if (!response.ok) throw new Error("Fehler beim Laden der Schüler");
          const data = await response.json();
          setStudents(data.students);
        } catch (error) {
          console.error(error);
        }
      };

      fetchStudents();
    }
  }, [selectedClass]);

  // Klasse auswählen
  const handleClassSelection = (className: string) => {
    setSelectedClass(className);
  };

  // Schüler-Seite öffnen
  const handleStudentRedirect = (studentId: string) => {
    router.push(`/student/${selectedClass}/${studentId}`);
  };

  // Modal öffnen / schließen
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setNewClassName("");
  };

  // Klassenname formatieren
  const formatClassName = (input: string) =>
    input.replace(/\s+/g, "").toLowerCase();

  // Neue Klasse hinzufügen
  const addClass = async () => {
    if (newClassName) {
      const formattedClassName = formatClassName(newClassName);
      if (classData.includes(formattedClassName)) {
        setPopupMessage("Diese Klasse existiert bereits.");
        return;
      }

      try {
        const docRef = doc(db, formattedClassName, "01");
        await setDoc(docRef, {}); // Leeres Dokument erstellen
        setClassData((prevState) => [...prevState, formattedClassName]);
        closeModal();
      } catch (error) {
        console.error("Fehler beim Hinzufügen der Klasse:", error);
      }
    }
  };

  return (
    <DefaultLayout>
      <div className="min-h-screen p-6">
        <h1 className="mb-6 text-2xl font-bold">Klassenverwaltung</h1>

        {/* Klassenliste */}
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

        {/* Schülerliste */}
        {selectedClass && (
          <div>
            <h2 className="mb-4 text-lg font-semibold">
              Schüler in {selectedClass}:
            </h2>
            {students.length > 0 ? (
              <ul className="space-y-2">
                {students.map((student) =>
                  student.name ? (
                    <li
                      key={student.id}
                      className="dark:hover:bg-primary-dark flex cursor-pointer justify-between rounded bg-gray-100 p-2 dark:bg-gray-700 dark:text-gray-100"
                      onClick={() => handleStudentRedirect(student.id)}
                    >
                      <span>
                        {student.name} {student.lastName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {student.id}
                      </span>
                    </li>
                  ) : null
                )}
              </ul>
            ) : (
              <p className="text-gray-500">
                Keine Schüler in dieser Klasse gefunden.
              </p>
            )}
          </div>
        )}

        {/* Modal für neue Klasse */}
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

        {/* Popup Nachricht */}
        {popupMessage && (
          <Popup message={popupMessage} onClose={() => setPopupMessage(null)} />
        )}
      </div>
    </DefaultLayout>
  );
}
