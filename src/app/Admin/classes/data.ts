import { db } from '../../../../firebaseconfig';
import { collection, doc, getDocs } from 'firebase/firestore';

export async function getClasses(): Promise<string[]> {
    try {
        // Ensure the URL matches the route's structure
        const response = await fetch('/api/listCollections'); // Corrected URL
        if (!response.ok) {
            throw new Error(`Failed to fetch classes: ${response.statusText}`);
        }
        const data = await response.json();
        return data.collections;
    } catch (error) {
        console.error('Error fetching classes:', error);
        return [];
    }
}



  
export const getStudents = async (subClass: string) => {
    try {
      // Reference to the 'students' subcollection of the specific 'subClass' document
      const studentsRef = collection(db, subClass);
      
      // Fetch all student documents from the 'students' subcollection
      const snapshot = await getDocs(studentsRef);
      
      const students: any[] = [];
      
      // Process the snapshot to retrieve student data
      snapshot.forEach(doc => {
        students.push({
          id: doc.id, // Student ID (e.g., '01', '02', '03', etc.)
          ...doc.data() // Spread the student data (e.g., name, lastName, age, etc.)
        });
      });
      
      return students;
    } catch (error) {
      console.error("Error fetching students:", error);
      return [];
    }
  };
  