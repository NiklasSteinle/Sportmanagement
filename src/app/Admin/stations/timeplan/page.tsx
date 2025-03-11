"use client";
import React, { useEffect, useState } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { collection, getDocs, setDoc, doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../../../firebaseconfig";
import Image from "next/image";
import DatePickerOne from "@/components/FormElements/DatePicker/DatePickerOne";

const Page = () => {
  interface Belegung {
    startzeit: string; // Format: HH:mm
    endzeit: string; // Format: HH:mm
    betreuer?: string; // Optional
  }

  type BelegungenMap = Record<string, Belegung>;

  interface Station {
    id: string;
    sport: string;
    class: string[]; // List of classes for this sport
  }

  interface FetchData {
    collections: string[];
  }

  const [stationData, setStationData] = useState<Station[]>([]);
  const [events, setEvents] = useState<{ class: string; station: string; startzeit: string; endzeit: string }[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);
  const [classSelected, setClassSelected] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [availableClasses, setAvailableClasses] = useState<string[]>([]); // To store available classes for the selected sport
  const [allClasses, setAllClasses] = useState<{ [key: string]: string[] }>({});
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // For controlling the popup visibility
  const [editingEvent, setEditingEvent] = useState<{ class: string; station: string; startzeit: string; endzeit: string } | null>(null); // For holding the event being edited

  const changeTextColor = () => {
    setIsOptionSelected(true);
  };

  useEffect(() => {
    const loadData = async () => {
      const querySnapshot = await getDocs(collection(db, "stations"));
      const data = querySnapshot.docs.map((doc) => {
        const docData = doc.data();
        return {
          id: doc.id,
          sport: docData.sport,
          class: docData.class || [],
        };
      });
      setStationData(data);
      
    };

    const fetchEvents = async () => {
      const events: { class: string; station: string; startzeit: string; endzeit: string }[] = [];
      const querySnapshot = await getDocs(collection(db, "timeplan"));
      for (const docSnap of querySnapshot.docs) {
        
        const data = docSnap.data();
        const belegungen: BelegungenMap = data.belegungen || {};

        for (const [className, belegung] of Object.entries(belegungen)) {
          events.push({
            class: className,
            station: docSnap.id,
            startzeit: belegung.startzeit,
            endzeit: belegung.endzeit,
          });
        }
      }
      setEvents(events);
      
    };

    loadData().then(fetchEvents);
  }, []);

  useEffect(() => {
    const fetchAllClasses = async () => {
      try {
        const response = await fetch("/api/listCollections");
        const data: FetchData = await response.json();
        

        if (data.collections) {
          const mapedClasses = data.collections.reduce<{ [key: string]: string[] }>((acc, current) => {
            const key = current.charAt(0); // Get the first character as the key
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(current); // Append current class to the key
            return acc;
          }, {});

          setAllClasses(mapedClasses); // Store the formatted data
          
        }
      } catch (error) {
        console.error("Error fetching all classes:", error);
      }
    };

    fetchAllClasses();
  }, []);

  useEffect(() => {
    if (selectedOption) {
      const selectedSport = stationData.find((station) => station.id === selectedOption);
      if (selectedSport) {
        const filteredClasses = Object.keys(allClasses)
          .filter((key) => selectedSport.class.includes(key))
          .flatMap((key) => allClasses[key]);
        setAvailableClasses(filteredClasses);
        setClassSelected(""); // Reset class selection when sport is changed
      }
    }
  }, [selectedOption, stationData, allClasses]);

  const handleValues = async () => {
    if (!selectedOption || !startTime || !endTime || !classSelected) {
      console.error("Bitte alle Felder ausfüllen.");
      return;
    }

    if (startTime >= endTime || startTime === endTime) {
      alert("Ungültige Start- und Endzeit.");
      return;
    }

    if (startTime < "08:00" || endTime > "18:00") {
      alert("Ungültige Start- und Endzeit.\nBitte wählen Sie einen Zeitraum zwischen 8:00 Uhr und 18:00 Uhr.");
      return;
    }

    // Check for overlapping events
    const selectedSport = stationData.find((station) => station.id === selectedOption);
    const existingTimeEvent = events.find((event) => {
      const isSameSport = event.station === selectedSport?.sport;

      if (!isSameSport) {
        return false;
      }
      const isOverlapping =
        (startTime >= event.startzeit && startTime < event.endzeit) ||
        (endTime > event.startzeit && endTime <= event.endzeit) ||
        (startTime <= event.startzeit && endTime >= event.endzeit);
      
      
      return isSameSport && isOverlapping;
    });

    if (existingTimeEvent) {
      alert("Es gibt bereits ein Event in diesem Zeitraum.");
      return;
    }

    const station = stationData.find((station) => station.id === selectedOption)?.sport;
    if (!station) {
      console.error("Station nicht gefunden.");
      return;
    }

    const existingEvent = events.find(
      (event) => event.class === classSelected && event.station === station
    );

    if (existingEvent) {
      alert(
        `Die Klasse ${classSelected} hat bereits ein Event für ${station}.\n` +
        `Startzeit: ${existingEvent.startzeit}, Endzeit: ${existingEvent.endzeit}`
      );
      return;
    }

    const stationDocRef = doc(db, "timeplan", station);

    try {
      const stationDocSnap = await getDoc(stationDocRef);
      let belegungen: BelegungenMap = {};

      if (stationDocSnap.exists()) {
        const data = stationDocSnap.data();
        belegungen = data.belegungen || {};
      }

      belegungen[classSelected] = {
        startzeit: startTime,
        endzeit: endTime,
      };

      await setDoc(stationDocRef, { belegungen }, { merge: true });
      
      window.location.reload();
    } catch (error) {
      console.error("Fehler beim Speichern der Belegung:", error);
    }
  };

  const handleEditEvent = (event: { class: string; station: string; startzeit: string; endzeit: string }) => {
    setEditingEvent(event);
    setStartTime(event.startzeit);
    setEndTime(event.endzeit);
    setIsModalOpen(true);
  };

  const handleDeleteEvent = async () => {
    if (editingEvent) {
      const stationDocRef = doc(db, "timeplan", editingEvent.station);
      try {
        const stationDocSnap = await getDoc(stationDocRef);
        if (stationDocSnap.exists()) {
          const data = stationDocSnap.data();
          const belegungen: BelegungenMap = data.belegungen || {};

          // Delete the event for the selected class
          delete belegungen[editingEvent.class];
          await setDoc(stationDocRef, { belegungen }, { merge: true });
          
          setIsModalOpen(false);
          window.location.reload();
        }
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">
          Zeitplan
        </h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          {/* Sport Selection */}
          <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-white">
            Sport auswählen
          </label>
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <Image
                src="https://png.pngtree.com/element_our/20200702/ourlarge/pngtree-cartoon-hand-drawn-summer-sports-children-manga-lineart-image_2297184.jpg"
                alt="Sport Icon"
                width="28"
                height="28"
                className="rounded-full"
              />
              
            </span>
            <select
              value={selectedOption}
              onChange={(e) => {
                setSelectedOption(e.target.value);
                changeTextColor();
              }}
              className={`relative z-20 w-full appearance-none rounded-lg border border-gray-300 bg-gray-50 px-12 py-3 text-sm text-gray-700 transition focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white ${isOptionSelected ? "text-black dark:text-white" : "text-gray-400"
                }`}
            >
              <option value="" disabled>
                Sport auswählen
              </option>
              {stationData.map((station: any) => (
                <option key={station.sport} value={station.id}>
                  {station.sport + " (" + station.class.join(", ") + ")"}
                </option>
              ))}
            </select>
          </div>

          {/* Class Selection */}
          <div className="mb-4">
            <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-white">
              Klasse
            </label>
            <select
              value={classSelected}
              onChange={(e) => setClassSelected(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-700 focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              disabled={!selectedOption}
            >
              <option value="" disabled>
                Klasse auswählen
              </option>
              {availableClasses.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white">
                Startzeit
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-700 focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                min="08:00"
                max="18:00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white">
                Endzeit
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-700 focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition"
            onClick={handleValues}
          >
            Speichern
          </button>
        </div>

        {/* Existing Events */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            Bestehende Events
          </h2>
          {events.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              Keine Events verfügbar.
            </p>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {events
                .filter((event) => {
                  const selectedSport = stationData.find(
                    (station) => station.id === selectedOption
                  )?.sport;
                  const matchesSport = !selectedOption || event.station === selectedSport;
                  const matchesClass = !classSelected || event.class === classSelected;
                  return matchesSport && matchesClass;
                })
                .map((event, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transform hover:scale-105 transition"
                  >
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Station: <span className="font-normal">{event.station}</span>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      <strong>Klasse:</strong> {event.class}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      <strong>Startzeit:</strong> {event.startzeit}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>Endzeit:</strong> {event.endzeit}
                    </p>
                    <div className="mt-4 flex justify-between">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleEditEvent(event)}
                      >
                        Bearbeiten
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={handleDeleteEvent}
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

    </DefaultLayout>
  );
};

export default Page;
