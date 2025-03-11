"use client";

import React, { useState, useEffect, use } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { db } from "../../../../firebaseconfig";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";


const HelperAdminPage = () => {
  const [notAssignedHelpers, setNotAssignedHelpers] = useState<any[]>([]);
  const [assignedHelpers, setAssignedHelpers] = useState<any[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<{
    [helperId: string]: string;
  }>({ "": "" });
  const [selectData, setSelectData] = useState<{
    [key: string]: { id: string; data: string }[];
  }>({});
  const [classData, setClassData] = useState<string[]>([]);
  const [stationData, setStationData] = useState<string[]>([]);
  const [assingedStation, setAssignedStation] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const dataAssigned: any[] = [];
      const dataNotAssigned: any[] = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().helperRoles != undefined) {
          if (
            doc.data().helperRoles != undefined ||
            doc.data().helperRoles[0] != "false" ||
            doc.data().helperRoles[1] != "false"
          ) {
            if (
              doc.data().assignedTo == undefined ||
              doc.data().assignedTo == ""
            ) {
              dataNotAssigned.push({ id: doc.id, ...doc.data() });
            } else {
              dataAssigned.push({ id: doc.id, ...doc.data() });
            }
          }
        }
      });
      console.log("dataAssigned");
      console.log(dataAssigned);
      console.log("dataNotAssigned");
      console.log(dataNotAssigned);
      setAssignedHelpers(dataAssigned);
      setNotAssignedHelpers(dataNotAssigned);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/listCollections");
      if (!response.ok) {
        throw new Error("Failed to fetch class data");
      }
      const data = await response.json();
      const collections = data.collections || [];
      setClassData(collections);
      const stationData = await getDocs(collection(db, "stations"));
      const stations: string[] = [];
      stationData.forEach((doc) => {
        stations.push(doc.id);
      });
      setStationData(stations);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const dataForSelect = async () => {
      notAssignedHelpers.forEach(async (helper) => {
        if (
          helper.helperRoles.class == true &&
          helper.helperRoles.station == false
        ) {
          const classes: { id: string; data: string }[] = [];
          classData.forEach((item) => {
            classes.push({
              id: item,
              data: item,
            });
          });

          setSelectData((prevData) => ({
            ...prevData,
            [helper.uid]: classes,
          }));
        } else if (
          helper.helperRoles.station == true &&
          helper.helperRoles.class == false
        ) {
          const querySnapshot = await getDocs(collection(db, "stations"));
          const stations: { id: string; data: string }[] = [];
          querySnapshot.forEach((doc) => {
            stations.push({
              id: doc.id,
              data: doc.data().sport,
            });
          });
          setSelectData((prevData) => ({
            ...prevData,
            [helper.uid]: stations,
          }));
        } else {
          const classesAndstations: { id: string; data: string }[] = [];
          const classes: { id: string; data: string }[] = [];
          classData.forEach((item) => {
            classes.push({
              id: item,
              data: item,
            });
          });
          const querySnapshot = await getDocs(collection(db, "stations"));
          const stations: { id: string; data: string }[] = [];
          querySnapshot.forEach((doc) => {
            stations.push({
              id: doc.id,
              data: doc.data().sport,
            });
          });
          classesAndstations.push(...classes);
          classesAndstations.push(...stations);
          console.log(classesAndstations);
          setSelectData((prevData) => ({
            ...prevData,
            [helper.uid]: classesAndstations,
          }));
        }
      });
    };
    dataForSelect();
  }, [classData, notAssignedHelpers, stationData]);

  useEffect(() => {
    console.log("!!!!!!!!!!");
    notAssignedHelpers.forEach((helper) => {
      console.log(helper.uid);
      console.log(selectData[helper.uid]);
    });
  }, [notAssignedHelpers, selectData]);

  const saveData = async () => {
    const promises = notAssignedHelpers.map((helper) => {
      if (selectedOptions[helper.uid] != undefined) {
        if (
          helper.helperRoles.class == true &&
          helper.helperRoles.station == false
        ) {
          return setDoc(
            doc(db, "users", helper.id),
            {
              ...helper,
              assignedTo: selectedOptions[helper.uid],
            },
            { merge: true },
          );
        } else if (
          helper.helperRoles.station == true &&
          helper.helperRoles.class == false
        ) {
          return setDoc(
            doc(db, "users", helper.id),
            {
              ...helper,
              assignedTo: selectedOptions[helper.uid],
            },
            { merge: true },
          );
        } else {
          return setDoc(
            doc(db, "users", helper.id),
            {
              ...helper,
              assignedTo: selectedOptions[helper.uid],
            },
            { merge: true },
          );
        }
      }
      return Promise.resolve().then(() => {
        console.log("updated");
      });
    });

    Promise.all(promises).then(() => {
      window.location.reload();
    });
  };
  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "stations"));
      querySnapshot.forEach((doc) => {
        assignedHelpers.forEach((helper) => {
          if (helper.assignedTo == doc.id) {
            setAssignedStation((prevState) => ({
                ...prevState,
                [helper.id]: doc.data().sport,
            }));
          }
        });
      });
    };
    fetchData();
    console.log(assingedStation);
    
  }, [assignedHelpers, assingedStation]);

  if (selectData == undefined) {
    return null;
  }

  return (
    <>
      <DefaultLayout>
        <div className="grid grid-cols-1 gap-6 border-b border-stroke pb-6 md:grid-cols-2 lg:grid-cols-3">
          {notAssignedHelpers.length == 0 ? (
            <p>Keine Helfer verfügbar</p>
          ) : null}
          {notAssignedHelpers.map((helper) => (
            <div
              className="transform rounded-lg bg-white p-4 shadow-md transition hover:scale-105 hover:shadow-lg dark:bg-gray-800"
              key={helper.id}
            >
              <p>{helper.name}</p>
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Aufgabe auswählen
              </label>
              <select
                value={selectedOptions[helper.id] || ""}
                onChange={(e) => {
                  setSelectedOptions({
                    ...selectedOptions,
                    [helper.id]: e.target.value,
                  });
                }}
                className="w-full rounded border border-stroke bg-transparent px-12 py-3 dark:border-strokedark  dark:bg-gray-800"
              >
                <option value="" disabled>
                  Aufgabe auswählen
                </option>
                {selectData[helper.id] == undefined
                  ? null
                  : selectData[helper.id].map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.data}
                      </option>
                    ))}
              </select>
            </div>
          ))}
        </div>

        <div>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assignedHelpers.map((helper) => (
              <div
                className="transform rounded-lg bg-white p-4 shadow-md transition hover:scale-105 hover:shadow-lg dark:bg-gray-800"
                key={helper.id}
              >
                <p>{helper.name}</p>
                {/^\d/.test(helper.assignedTo) ? (
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    <p>Klasse: {helper.assignedTo}</p>
                  </label>
                ) : (
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    <p>Station: {assingedStation[helper.id]}</p>
                  </label>
                )}

                <button
                  onClick={async () => {
                    await setDoc(
                      doc(db, "users", helper.id),
                      {
                        ...helper,
                        assignedTo: "",
                      },
                      { merge: true },
                    );
                    window.location.reload();
                  }}
                  className="rounded bg-primary px-4 py-2 font-medium text-gray hover:bg-opacity-90"
                >Entfernen</button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-4.5 mt-6">
          <button
            className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
            type="submit"
          >
            Cancel
          </button>
          <button
            id="save"
            onClick={saveData}
            className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90"
          >
            Save
          </button>
        </div>
      </DefaultLayout>
    </>
  );
};

export default HelperAdminPage;
