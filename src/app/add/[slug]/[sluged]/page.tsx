"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Loader from "@/components/common/Loader";
import { useRouter } from "next/navigation";
import { getStudentData, getDisciplineData, pushResults } from "./data";


const Page = () => {
  const router = useRouter();
  const params = useParams();
  const disciplineId = params?.slug;
  const studentId = params?.sluged;

  const [userData, setUserData] = useState<{ name: string, lastName: string, age: string}[] | null>(null);
  const [disciplineData, setDisciplineData] = useState<{ name: string }[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState('');


  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResult = await getStudentData(studentId);
        const disciplineResult = await getDisciplineData(disciplineId);


        setUserData(userResult);
        
        
        
        setDisciplineData(disciplineResult);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, disciplineId]);

  const buttonClick = async () => {
    
    if (disciplineData) {
      await pushResults(Array.isArray(studentId) ? studentId[0] : studentId, disciplineData, results).then(() => {
        window.location.href = "/add/"+disciplineId;
        
      });
    } else {
      console.error("Discipline data is null");
    }

  };

  if (loading) {
    return <Loader />;
  }

  return (
    <DefaultLayout>
      <div>
        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
          Disziplin
        </label>
        <input
          type="text"
          value={disciplineData?.[0]?.name || ""}
          disabled
          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary dark:disabled:bg-black"
        />
        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
          Schueler_ID
        </label>
        <input
          type="text"
          value={userData?.[0]?.name + " " + userData?.[0]?.lastName || ""}
          disabled
          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary dark:disabled:bg-black"
        />
        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
          Alter
        </label>
        <input
          type="text"
          value={userData?.[0]?.age}
          disabled
          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary dark:disabled:bg-black"
        />
      </div>
      <div>
        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
          Erreichte Weite
        </label>
        <input
          type="text"
          value={results}
          onChange={(e) => setResults(e.target.value)}
          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary dark:disabled:bg-black"
        />
      </div>
      <button onClick={buttonClick} className="mt-4 px-4 py-2 bg-primary text-white rounded">
        Einreichen
      </button>
    </DefaultLayout>
  );
};

export default Page;
