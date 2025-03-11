"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TeacherTable from "@/components/Tables/TeacherTable";
import Link from "next/link";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useState, useEffect } from "react";
import { db } from "../../../../firebaseconfig";
import { collection, getDocs,setDoc } from "firebase/firestore";

const ManageAdminsPage = () => {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [userData, setUserData] = useState<{ id: string; name: string }[]>([]);

  // Fetch user data from the server
  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const users: { id: string; name: string }[] = [];
      querySnapshot.forEach((doc) => {
        if(doc.data().role !== "Admin"){
          users.push({
            id: doc.id,
            name: doc.data().name,
          });
        }
        
      });
      setUserData(users);
    };
    fetchData();
    
  }
  , []);

  const makeAdmin = async () => {
    
    const userRef = collection(db, "users");
    const querySnapshot = await getDocs(userRef)
    const promises = querySnapshot.docs.map((doc) => {
      if (doc.id === selectedOption) {
        
        return setDoc(doc.ref, { ...doc.data(), role: "Admin" });
      }
      return Promise.resolve();
    });

    Promise.all(promises).then(() => {
      window.location.reload();
    });
    
  };

  return (
    <DefaultLayout>
      <div>
        {/* Dropdown to select class */}
        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
          Nutzer auswählen, um ihn Admin zu machen
        </label>
        <select
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          className="w-full rounded border border-stroke bg-transparent px-12 py-3 dark:border-strokedark  dark:bg-gray-800"
        >
          <option value="" disabled>
            Nutzer auswählen
          </option>
          {userData.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <div>
          <button
            style={{
              marginTop: "20px",
              cursor: "pointer",
              opacity: 1,
              
            }}
            
            onClick={async () => {
              makeAdmin();
            }}
            
            className="w-full rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
          >
            Klicken, um den ausgewählten Nutzer zum Admin zu machen
          </button>
        </div>
    </DefaultLayout>
  );
};

export default ManageAdminsPage;
