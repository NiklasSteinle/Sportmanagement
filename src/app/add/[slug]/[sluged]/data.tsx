import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../firebaseconfig";

// Fetch student data
export const getStudentData = async (fullId: string | string[]) => {
  const idString = Array.isArray(fullId) ? fullId[0] : fullId;
  const classId = idString.split("-")[0];
  const studentId = idString.split("-")[1];

  const querySnapshot = await getDocs(collection(db, classId));
  const data: { name: string; lastName: string, age:string }[] = [];

  querySnapshot.forEach((doc) => {
    if (doc.id === studentId) {
      const docData = doc.data();
      const birthday = new Date(doc.data().birthday);
      const today = new Date();
      let age: any = today.getFullYear() - birthday.getFullYear();
      const monthDifference = today.getMonth() - birthday.getMonth();
      const dayDifference = today.getDate() - birthday.getDate();

      // Adjust age if the birthday hasn't occurred yet this year
      if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
        age--;
      }
      if (Number.isNaN(age)) {
        age = "Nicht verfügbar";
      }
      data.push({ name: docData.name, lastName: docData.lastName, age:age });
    }
  });

  return data;
};

// Fetch discipline data
export const getDisciplineData = async (disciplineId: string | string[]) => {
  const id = Array.isArray(disciplineId) ? disciplineId[0] : disciplineId;

  const querySnapshot = await getDocs(collection(db, "stations"));
  const data: { name: string }[] = [];

  querySnapshot.forEach((doc) => {
    if (doc.id === id) {
      const docData = doc.data();
      data.push({ name: docData.sport });
    }
  });

  return data;
};

export const pushResults = async (
  userId: string,
  disciplineData: { name: string }[],
  result: string,
) => {
  try {
    if (!userId || !disciplineData?.[0]?.name || result === "") {
      console.error("Incomplete data for Firestore update.");
      return;
    }

    const classId = userId.split("-")[0];
    const studentId = userId.split("-")[1];
    const disciplineName = disciplineData[0].name;

    const studentRef = doc(db, classId, studentId);
    await updateDoc(studentRef, {
      [`disciplines.${disciplineName}`]: result,
    });
  } catch (error) {
    console.error("Error updating Firestore:", error);
  } finally {
  }
};
