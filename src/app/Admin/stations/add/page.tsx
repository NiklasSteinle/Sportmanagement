"use client";
import StudentTable from "@/components/Tables/StudentTable";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { auth, db } from "../../../../../firebaseconfig";
import { setDoc, doc, collection, getDocs } from "firebase/firestore";
import { get } from "http";
import Popup from "@/components/Popup/classPopup";
import { useState } from "react";

const Page = () => {
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  const addstation = async (e: React.FormEvent) => {
    e.preventDefault();
    let duplicate = false;
    const existingSport: any[] = [];
    await getDocs(collection(db, "stations"))
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          
          
          existingSport.push(doc.data().sport);
        });
      })
      .then(() => {
        
        const sport = (document.getElementById("sport") as HTMLInputElement)
          .value;
        if (existingSport.includes(sport)) {
          setPopupMessage("Dieser Sport existiert bereits."); // Set popup message
          duplicate = true;
          return;
        }
      });

    const sport = (document.getElementById("sport") as HTMLInputElement).value;
    const classs = getSelectedBoxes();
    const description = (
      document.getElementById("description") as HTMLInputElement
    ).value;
    const id = doc(collection(db, "stations")).id;
    if (sport === "" || classs.length === 0 || description === "") {
      setPopupMessage("Bitte füllen Sie alle Felder aus."); // Set popup message
      duplicate = true;
      return;
    }
    if (duplicate == false) {
      setDoc(doc(db, "stations", id), {
        sport: sport,
        class: classs,
        description: description,
      }).then(() => {
        window.location.reload();
      });
    }
  };

  const getSelectedBoxes = () => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    let selected: any[] = [];
    checkboxes.forEach((checkbox) => {
      if ((checkbox as HTMLInputElement).checked) {
        selected.push((checkbox as HTMLInputElement).value);
      }
    });
    
    return selected;
  };
  return (
    <div>
      <DefaultLayout>
        <div className="mx-auto max-w-270">
          <Breadcrumb pageName="stations" />

          <div>
            <div className="col-span-5 xl:col-span-3">
              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                  <h3 className="font-medium text-black dark:text-white">
                    Eine neue Station hinzufügen
                  </h3>
                </div>
                <div className="p-7">
                  <form action="#">
                    <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                      <div className="w-full sm:w-1/2">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="fullName"
                        >
                          Sport
                        </label>
                        <div className="relative">
                          <span className="absolute left-4.5 top-4">
                            <svg
                              className="fill-current"
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g opacity="0.8">
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z"
                                  fill=""
                                />
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z"
                                  fill=""
                                />
                              </g>
                            </svg>
                          </span>
                          <input
                            className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                            type="text"
                            name="sport"
                            id="sport"
                          />
                        </div>
                      </div>

                      <div className="w-full sm:w-1/2">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="phoneNumber"
                        >
                          Klassenstufe/n
                        </label>
                        <div id="checkbox">
                          <input type="checkbox" className="dark:accent-gray-900 " value={1} />
                          <label className="mr-3" style={{ margin: "10px" }}>
                            1
                          </label>
                          <input type="checkbox" className="dark:accent-gray-900 " value={2} />
                          <label className="mr-3" style={{ margin: "10px" }}>
                            2
                          </label>
                          <input type="checkbox" className="dark:accent-gray-900 " value={3} />
                          <label className="mr-3" style={{ margin: "10px" }}>
                            3
                          </label>
                          <input type="checkbox" className="dark:accent-gray-900" value={4} />
                          <label className="mr-3" style={{ margin: "10px" }}>
                            4
                          </label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="w-full">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="description"
                        >
                          Beschreibung
                        </label>
                        <input
                          className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="description"
                          id="description"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-4.5">
                      <button
                        className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                        type="submit"
                      >
                        Cancel
                      </button>
                      <button
                        id="save"
                        onClick={addstation}
                        className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        {popupMessage && (
          <Popup message={popupMessage} onClose={() => setPopupMessage(null)} />
        )}
      </DefaultLayout>
    </div>
  );
};

export default Page;
