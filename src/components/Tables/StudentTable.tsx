"use client";
import { useState, useEffect } from "react";
import { getFirestore, doc, setDoc } from "firebase/firestore"; // Firestore imports
import { db } from "../../../firebaseconfig";
// Adjust the path based on your Firebase setup

type Student = {
  id: string; // Change id to string to keep leading zeros
  firstName: string;
  lastName: string;
  className: string;
};

const StudentComponent = () => {
  const [studentData, setStudentData] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [newStudent, setNewStudent] = useState<Student>({
    id: "",
    firstName: "",
    lastName: "",
    className: "",
  });
  const [classes, setClasses] = useState<string[]>([]); // Store class options
  const [classCounters, setClassCounters] = useState<Record<string, number>>(
    {},
  ); // Map to track the last used ID for each class

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("/api/getAllStudents/");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Student[] = await response.json();
        setStudentData(data);
        
        // Update classCounters based on existing students' class and IDs
        const updatedCounters: Record<string, number> = {};
        let numericId;
        data.forEach((student) => {
          if (student.firstName === undefined) {
            updatedCounters[student.className] = 0;
          } else {
            numericId = parseInt(student.id, 10); // Parse the ID as a number
            if (updatedCounters[student.className]) {
              updatedCounters[student.className] = Math.max(
                updatedCounters[student.className],
                numericId,
              );
            } else {
              updatedCounters[student.className] = numericId;
            }
          }
        });
        
        setClassCounters(updatedCounters);
      } catch (err: any) {
        setError(err.message || "Failed to fetch students.");
      } finally {
        setLoading(false);
      }
    };

    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/listCollections");
        if (!response.ok) {
          throw new Error("Failed to fetch class data");
        }
        const data = await response.json();
        setClasses(data.collections || []); // Set the class options
      } catch (err: any) {
        setError(err.message || "Failed to fetch classes.");
      }
    };

    fetchStudents();
    fetchClasses();
  }, []);

  const handleAddStudent = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      // Get the current class and increment its counter
      const newClassCounter = classCounters[newStudent.className] + 1 || 1;

      // Build the new student ID based on the class counter and format it with leading zeros
      const newStudentId = newClassCounter.toString().padStart(2, "0");

      // Create a new student with the generated ID
      const newStudentWithId = {
        ...newStudent,
        id: newStudentId,
        uid: newStudentId,
        name: newStudent.firstName, // Save the firstName as 'name' in Firestore
      };

      // Add the new student to Firestore under the collection 'class/id'
      await setDoc(
        doc(db, newStudent.className, newStudentId),
        newStudentWithId,
      );

      setStudentData((prevData) => [...prevData, newStudentWithId]);

      // Update the class counter for the selected class
      setClassCounters({
        ...classCounters,
        [newStudent.className]: newClassCounter,
      });

      // Close the popup after adding the student
      setShowPopup(false);
    } catch (err: any) {
      setError("Failed to add student.");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Student,
  ) => {
    setNewStudent({
      ...newStudent,
      [field]: e.target.value,
    });
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewStudent({
      ...newStudent,
      className: e.target.value,
    });
  };

  if (loading) return <p>Loading students...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Student List</h1>
      <button
        className="mb-4 bg-blue-500 px-4 py-2 text-white"
        onClick={() => setShowPopup(true)}
      >
        Schüler Hinzufügen
      </button>

      <table className="w-full table-auto border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 dark:border-gray-500 dark:bg-gray-900">
              Class
            </th>
            <th className="border border-gray-300 px-4 py-2 dark:border-gray-500 dark:bg-gray-900">
              ID
            </th>
            <th className="border border-gray-300 px-4 py-2 dark:border-gray-500 dark:bg-gray-900">
              First Name
            </th>
            <th className="border border-gray-300 px-4 py-2 dark:border-gray-500 dark:bg-gray-900">
              Last Name
            </th>
          </tr>
        </thead>
        <tbody>
          {studentData.map((student) => (
            <tr key={student.id+student.className}>
              <td className="border border-gray-300 px-4 py-2 dark:border-gray-500 ">
                {student.className}
              </td>
              <td className="border border-gray-300 px-4 py-2 dark:border-gray-500">
                {student.id}
              </td>
              <td className="border border-gray-300 px-4 py-2 dark:border-gray-500">
                {student.firstName}
              </td>
              <td className="border border-gray-300 px-4 py-2 dark:border-gray-500">
                {student.lastName}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Popup Form */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="w-96 rounded-lg bg-white p-6 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold">Add New Student</h2>
            <form onSubmit={handleAddStudent}>
              <div className="mb-4">
                <label
                  className="mb-2 block text-sm font-medium"
                  htmlFor="firstName"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={newStudent.firstName}
                  onChange={(e) => handleInputChange(e, "firstName")}
                  className="w-full border border-gray-300 px-4 py-2 dark:border-gray-500 dark:bg-gray-900"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="mb-2 block text-sm font-medium"
                  htmlFor="lastName"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={newStudent.lastName}
                  onChange={(e) => handleInputChange(e, "lastName")}
                  className="w-full border border-gray-300 px-4 py-2 dark:border-gray-500 dark:bg-gray-900"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="mb-2 block text-sm font-medium"
                  htmlFor="className"
                >
                  Class
                </label>
                <select
                  id="className"
                  value={newStudent.className}
                  onChange={handleClassChange}
                  className="w-full border border-gray-300 px-4 py-2 dark:border-gray-500 dark:bg-gray-900"
                  required
                >
                  <option value="">Select a class</option>
                  {classes.map((classItem, index) => (
                    <option key={index} value={classItem}>
                      {classItem}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-4 rounded bg-gray-300 px-4 py-2 text-black dark:bg-gray-700 dark:text-white"
                  onClick={() => setShowPopup(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-500 px-4 py-2 text-white"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentComponent;
