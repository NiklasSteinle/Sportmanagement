
import {auth, db} from "../../../firebaseconfig";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { v2 as cloudinary } from "cloudinary";
 

// load_Data.ts

export const LoadData = () => {
  const [data, setData] = useState<{
    number: string | number | readonly string[] | undefined;
    name: string | number | readonly string[] | undefined;
    email: string | number | readonly string[] | undefined;
    role: string | number | readonly string[] | undefined; id: string; 
}[]>([]);
  const uid = getAuth().currentUser?.uid;
  useEffect(() => {
    const fetchData = async () => {
      
      
      const querySnapshot = await getDocs(collection(db, "users"));
      const data: { id: string; number: string | number | readonly string[] | undefined; name: string | number | readonly string[] | undefined; email: string | number | readonly string[] | undefined; role: string | number | readonly string[] | undefined; }[] = [];
      querySnapshot.forEach((doc) => {
        if(doc.id == uid){
          const docData = doc.data();
          data.push({ id: doc.id, number: docData.number, name: docData.name, email: docData.email, role: docData.role });
        }
        
      });
      setData(data);
    };

    fetchData();
  }, [uid]);

  return data;
};


export const setData  = async (data: {name: string; email: string; role: string;}) => {
  const uid = getAuth().currentUser?.uid;
  const dataRef = collection(db,"users");

  const user = await getDocs(dataRef);
  for (const doc of user.docs) {
    if(doc.id == uid){
        const update = await updateDoc(doc.ref, {
        name: data.name,
        email: data.email,
        role: data.role
      });
      
    }
  }
  
    
};


