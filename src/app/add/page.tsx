"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Loader from "@/components/common/Loader";
import { useRouter } from "next/navigation";
import { doc, collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebaseconfig";
import { useEffect, useState } from "react";

const Page = () => {
  const router = useRouter();
  const [disciplines, setDisciplines] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "stations"));
      const data: { [key: string]: string } = {};
      querySnapshot.forEach((doc) => {
        data[doc.id] = doc.data().sport;
      });
      
      setDisciplines(data);
    };
  
    fetchData();
  }
  , []);

  

    return (
      <>
        <DefaultLayout>
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-center text-4xl font-bold">
              Ergebnisse Eintragen
            </h1>
            <div className="mt-4 flex flex-wrap justify-center">
              {Object.keys(disciplines).map((key) => (
                <div
                  key={key}
                  className="m-2 w-64 cursor-pointer rounded-lg bg-white p-4 shadow-md dark:bg-gray-800 dark:text-white"
                  onClick={() => router.push(`/add/${key}`)}
                >
                  <a className="text-xl font-semibold">{disciplines[key]}</a>
                </div>
              ))}
            </div>
          </div>
        </DefaultLayout>
      </>
    );
  }


export default Page;
