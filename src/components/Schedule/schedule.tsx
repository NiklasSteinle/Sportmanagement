"use client";
import React, { useState, useEffect } from "react";
import "./schedule.css"; // Import the CSS file
import { db } from "../../../firebaseconfig";
import { getDocs, collection } from "firebase/firestore";

interface Event {
  title: string;
  startHour: number;
  startMinute: string | number;
  endHour: number;
  endMinute: string | number;
  className: string;
  sport: string;
}

const Schedule: React.FC = () => {
  const [stationData, setStationData] = useState<Event[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");  // State for class filter
  const [selectedSport, setSelectedSport] = useState<string>("");  // State for sport filter

  useEffect(() => {
    const loadData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "timeplan"));
  
        const formattedData: Event[] = [];
  
        querySnapshot.forEach((doc) => {
          const stationId = doc.id; // Station identifier
          const stationData = doc.data();
  
          // Check if 'belegungen' exists and is a valid object
          if (!stationData.belegungen || typeof stationData.belegungen !== "object") {
            console.warn(`No valid 'belegungen' map found for document ID: ${stationId}`);
            return;
          }
  
          // Iterate over each entry in the 'belegungen' map
          Object.entries(stationData.belegungen).forEach(([classKey, times]) => {
            const { startzeit, endzeit, sport } = times as { startzeit: string; endzeit: string; sport: string };
  
            // Extract hours and minutes
            const [startHour, startMinute] = startzeit.split(":").map(Number);
            const [endHour, endMinute] = endzeit.split(":").map(Number);
  
            // Validate time format
            if (
              isNaN(startHour) ||
              isNaN(startMinute) ||
              isNaN(endHour) ||
              isNaN(endMinute)
            ) {
              console.warn(
                `Invalid time format for class '${classKey}' in station '${stationId}'`
              );
              return;
            }
  
            // Add formatted event to the list
            formattedData.push({
              title: `${stationId} (Class ${classKey})`,
              startHour,
              startMinute: startMinute.toString().padStart(2, "0"),
              endHour,
              endMinute: endMinute.toString().padStart(2, "0"),
              className: classKey,
              sport: stationId,
            });
          });
        });
        
        setStationData(formattedData);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
  
    loadData();
  }, []);

  // Filter events by class and sport
  const filteredEvents = stationData.filter((event) => {
    const classMatches = selectedClass ? event.className === selectedClass : true;
    const sportMatches = selectedSport ? event.sport === selectedSport : true;
    return classMatches && sportMatches;
  });

  const events: Event[] = [];
  filteredEvents.forEach((doc) => {
    events.push({
      title: doc.title,
      startHour: doc.startHour,
      startMinute: doc.startMinute,
      endHour: doc.endHour,
      endMinute: doc.endMinute,
      className: doc.className,
      sport: doc.sport,
    });
  });

  events.sort((a: any, b: any) => {
    if (a.startHour === b.startHour) {
      return a.startMinute - b.startMinute;
    }
    return a.startHour - b.startHour;
  });

  const hours = Array.from({ length: 10 }, (_, i) => i + 8); // Generate hours from 8 to 17

  // Function to calculate the column span for each event
  const calculateSpan = (event: Event) => {
    const overlappingEvents = events.filter(
      (e) =>
        (e.startHour < event.endHour && e.endHour > event.startHour) ||
        e.startHour === event.startHour,
    ).length;
    return Math.floor(12 / overlappingEvents); // Assuming a 12-column grid
  };

  // Function to calculate the column for each event
  const calculateColumn = (event: Event, index: number) => {
    const overlappingEvents = events.filter(
      (e) =>
        (e.startHour < event.endHour && e.endHour > event.startHour) ||
        e.startHour === event.startHour,
    );
    const position = overlappingEvents.indexOf(event);
    return 2 + position * calculateSpan(event); // Start from the second column
  };

  return (
    <div className="schedule-container">
      <h1>Tageszeitplan</h1>

      {/* Filter Section */}
      <div className="filter-container">
        <label className="filter-label">Filter by Class</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="filter-dropdown dark:bg-gray-800 ml-2"
        >
          <option value="">Select a Class</option>
          {/* Convert Set to Array before mapping */}
          {Array.from(new Set(stationData.map((event) => event.className))).map((className, index) => (
            <option key={index} value={className}>
              {className}
            </option>
          ))}
        </select>

        <label className="filter-label ml-5">Filter by Sport</label>
        <select
          value={selectedSport}
          onChange={(e) => setSelectedSport(e.target.value)}
          className="filter-dropdown dark:bg-gray-800 ml-2 "
        >
          <option value="">Select a Sport</option>
          {/* Convert Set to Array before mapping */}
          {Array.from(new Set(stationData.map((event) => event.sport))).map((sport, index) => (
            <option key={index} value={sport}>
              {sport}
            </option>
          ))}
        </select>
      </div>

      <div className="schedule-grid">
        {hours.map((hour) => (
          <div key={hour} className="schedule-hour dark:bg-gray-800 dark:border-black">
            <div className="hour-label dark:text-white ">
              {hour}:00 - {hour + 1}:00
            </div>
          </div>
        ))}
        {events.map((event, index) => (
          <div
            key={index}
            className="schedule-entry dark:bg-gray-800 dark:border-black dark:text-white"
            style={{
              gridRow: `${event.startHour - 7} / span ${event.endHour - event.startHour}`,
              gridColumn: `${calculateColumn(event, index)} / span ${calculateSpan(event)}`,
              marginTop: `${event.startMinute}px`,
              height: `${
                (event.endHour - event.startHour) * 60 + // Convert hour duration to minutes
                (Number(event.endMinute) - Number(event.startMinute)) // Add end minutes directly
              }px`,
            }}
          >
            <div className="entry-content dark:text-white">
              {event.title} ({event.startHour}:{event.startMinute} -{" "}
              {event.endHour}:{event.endMinute})
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;
