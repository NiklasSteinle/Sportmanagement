"use client";
import { db } from "../../../../../firebaseconfig";
import { collection, getDocs, setDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useParams } from "next/navigation";

const Page = () => {
  const params = useParams();
  const classs = params?.slug;
  const student = params?.sluged;
  const [studentData, setStudentData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, classs.toString()));
      querySnapshot.forEach((doc) => {
        if (doc.id === student) {
          const birthday = new Date(doc.data().birthday);
          const today = new Date();
          
          let age: any = today.getFullYear() - birthday.getFullYear();
          const monthDifference = today.getMonth() - birthday.getMonth();
          const dayDifference = today.getDate() - birthday.getDate();

          // Adjust age if the birthday hasn't occurred yet this year
          if (
            monthDifference < 0 ||
            (monthDifference === 0 && dayDifference < 0)
          ) {
            age--;
          }
          if (Number.isNaN(age)) {
            age = "Nicht verfügbar";
          }

          console.log(age);
          setStudentData({
            name: doc.data().name,
            lastName: doc.data().lastName,
            klasse: classs,
            alter: age,
          });
        }
      });
    };
    fetchData();
  }, [classs, student]);

  return (
    <DefaultLayout>
      <h1 className="text-xl underline ">Infos des Schüler</h1>
      <div>
        <div className="mt-4 flex flex-col space-y-4 text-lg">
          <h2>Name: {studentData?.name}</h2>
          <h2>Vorname: {studentData?.lastName}</h2>
          <h2>Alter: {studentData?.alter}</h2>
          <h2>Klasse: {studentData?.klasse}</h2>
        </div>
        <div className="mt-4 ">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                <a href={`/Admin/classes`}>Zurück</a>
            </button>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Page;
