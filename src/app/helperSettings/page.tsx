"use client";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useState, useEffect } from "react";
import currentUser from "../../hooks/useAuth";
import { db } from "../../../firebaseconfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function Page() {
    const user = currentUser();
    const [roles, setRoles] = useState<{ station: boolean; class: boolean }>({
        station: false,
        class: false,
    });

    // Fetch the existing roles from Firestore on component mount
    useEffect(() => {
        if (!user.currentUser?.uid) {
            console.error("User UID is undefined");
            return;
        }

        const fetchRoles = async () => {
            if (!user.currentUser?.uid) {
                console.error("User UID is undefined");
                return;
            }
            const userRef = doc(db, "users", user.currentUser.uid);
            try {
                const docSnap = await getDoc(userRef);
                if (docSnap.exists()) {
                    const userRoles = docSnap.data()?.helperRoles || {};
                    setRoles({
                        station: userRoles.station || false,
                        class: userRoles.class || false,
                    });
                }
            } catch (error) {
                console.error("Fehler beim Abrufen der Rollen:", error);
            }
        };

        fetchRoles();
    }, [user.currentUser?.uid]);

    const handleCheckboxChange = (role: "station" | "class") => {
        setRoles((prev) => ({ ...prev, [role]: !prev[role] }));
    };

    const handleSubmit = async () => {
        if (!roles.station && !roles.class) {
            alert("Bitte wähle mindestens eine Option aus, um fortzufahren.");
            return;
        }

        // Get the user reference in Firestore using the current user's UID
        if (!user.currentUser?.uid) {
            console.error("User UID is undefined");
            alert("Es gab einen Fehler beim Abrufen der Benutzerdaten.");
            return;
        }

        const userRef = doc(db, "users", user.currentUser.uid);

        try {
            // Set or update the document with the selected roles
            await setDoc(
                userRef,
                {
                    helperRoles: {
                        station: roles.station,
                        class: roles.class,
                    },
                },
                { merge: true }
            ); // merge: true ensures it only updates the roles field without overwriting other data

            
        } catch (error) {
            console.error("Fehler beim Speichern der Rollen in Firestore:", error);
            alert("Es gab einen Fehler beim Speichern der Daten.");
        }
    };

    return (
        <DefaultLayout>
            <div className="container mx-auto p-6 flex flex-col items-center bg-gray-100  dark:bg-gray-800">
                <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg text-center  dark:bg-gray-900 ">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6 dark:text-white">
                        Wie möchtest du helfen?
                    </h1>
                    <div className="flex flex-col space-y-4 items-start ">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={roles.station}
                                onChange={() => handleCheckboxChange("station")}
                                className="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-lg text-gray-700  dark:text-white">
                                Sport Station betreuen
                            </span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={roles.class}
                                onChange={() => handleCheckboxChange("class")}
                                className="w-5 h-5 text-green-500 border-gray-300 rounded focus:ring-green-500"
                            />
                            <span className="text-lg text-gray-700  dark:text-white">Klasse betreuen</span>
                        </label>
                    </div>
                    <button
                        onClick={handleSubmit}
                        className="mt-6 w-full bg-blue-500 text-white py-3 rounded-lg shadow-md hover:bg-blue-600 transition duration-200"
                    >
                        Absenden
                    </button>
                </div>

                {roles.station && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8 w-full max-w-md text-center  dark:bg-gray-900 dark:border-blue-500">
                        <h2 className="text-lg font-semibold text-blue-600">
                            Danke, dass du eine Sport Station betreust!
                        </h2>
                        <p className="text-gray-600 mt-2">
                            Deine Unterstützung an der Station ist eine große Hilfe.
                        </p>
                    </div>
                )}
                {roles.class && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-8 w-full max-w-md text-center dark:bg-gray-900 dark:border-green-500">
                        <h2 className="text-lg font-semibold text-green-600">
                            Danke, dass du eine Klasse betreust!
                        </h2>
                        <p className="text-gray-600 mt-2">
                            Deine Hilfe in der Klasse wird sehr geschätzt.
                        </p>
                    </div>
                )}
            </div>
        </DefaultLayout>
    );
}
