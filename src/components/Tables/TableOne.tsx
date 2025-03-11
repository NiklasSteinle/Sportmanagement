"use client";
import { Ergebnis } from "@/types/ergebnis";
import React, { useState, useEffect } from "react";
import MultiSelect from "../FormElements/MultiSelect";
import { db } from "../../../firebaseconfig";
import { collection, getDocs } from "firebase/firestore";
import { auth } from "../../../firebaseconfig";
import {adb as dbadmin} from "../../../firebaseAdminConfig"
import Loader from "../common/Loader";


const TableOne = () => {
  const [ergebnisData, setErgebnisData] = useState<{ name: string; sportart: string; ergebnis: string }[]>([]);
  const [classData, setClassData] = useState<[]>([]);
  
  const user = auth.currentUser;
  

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/listCollections");
      if (!response.ok) {
        throw new Error("Failed to fetch class data");
      }
      const data = await response.json();
      const collections = data.collections || [];
      setClassData(collections);
      if(auth.currentUser){
        for (let i = 0; i < classData.length; i++) {
          
          
          const querySnapshot = await getDocs(collection(db, collections[i]));
          querySnapshot.forEach((doc) =>{
            
            if (doc.data().parent == user?.uid) {
              
              
              const disciplines = doc.data().disciplines;
              
              for(const discipline in disciplines){
                setErgebnisData(prevState => [
                  ...prevState,
                  {
                    name: doc.data().name + " " + doc.data().lastName,
                    sportart: discipline,
                    ergebnis: disciplines[discipline]
                  }
                ])
              }
              
              
              
              
            }
          })
        }
      }
      
    };
    fetchData();
      
  }, [classData.length, user]);

  if (ergebnisData === null) {
    return <Loader/>;
  }

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Ergebisse
      </h4>

      

      <div className="flex flex-col">
        <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-5">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Schüler
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Sportart
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Ergebniss
            </h5>
          </div>
          
        </div>
        {ergebnisData.map((schueler, key) => (
          <div
            className={`grid grid-cols-3 sm:grid-cols-5 ${
              key === ergebnisData.length - 1 ? "" : "border-b border-stroke dark:border-strokedark"
            }`}
            key={key}
          >
            <div className="flex items-center gap-3 p-2.5 xl:p-5">
              <p className="text-sm font-medium text-black dark:text-white">{schueler.name}</p>
            </div>
            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-sm font-medium text-black dark:text-white">{schueler.sportart}</p>
            </div>
            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-sm font-medium text-black dark:text-white">{schueler.ergebnis}</p>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableOne;