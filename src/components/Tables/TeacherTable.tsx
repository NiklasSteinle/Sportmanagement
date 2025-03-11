"use client";

import { useState } from "react";
import Image from "next/image";
import { Teacher } from "@/types/teacher";

const teacherData: Teacher[] = [
  {
    id: 1,
    firstName: "John",
    lastName: "Smith",
    className: "1a",
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Doe",
    className: "1a",
  },
  {
    id: 3,
    firstName: "Charlie",
    lastName: "Brown",
    className: "3b",
  },
];

const TeacherTable = () => {
  const [filters, setFilters] = useState({
    id: "",
    firstName: "",
    lastName: "",
    className: "",
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const filteredData = teacherData.filter((teacher) =>
    Object.keys(filters).every((key) =>
      teacher[key as keyof Teacher]
        .toString()
        .toLowerCase()
        .includes(filters[key as keyof typeof filters].toLowerCase())
    )
  );

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="px-4 py-6 md:px-6 xl:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Lehrpersonal
        </h4>
      </div>

      <div className="grid grid-cols-6 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
        <div className="col-span-3 flex items-center">
          <p className="font-medium">id</p>
        </div>
        <div className="col-span-2 hidden items-center sm:flex">
          <p className="font-medium">firstName</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">lastName</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">className</p>
        </div>
      </div>

      <div className="grid grid-cols-6 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
        <div className="col-span-3 flex items-center">
          <input
            type="text"
            name="id"
            value={filters.id}
            onChange={handleFilterChange}
            className="w-full rounded border border-gray-300 px-2 py-1"
            placeholder="Filter by ID"
          />
        </div>
        <div className="col-span-2 hidden items-center sm:flex">
          <input
            type="text"
            name="firstName"
            value={filters.firstName}
            onChange={handleFilterChange}
            className="w-full rounded border border-gray-300 px-2 py-1"
            placeholder="Filter by First Name"
          />
        </div>
        <div className="col-span-1 flex items-center">
          <input
            type="text"
            name="lastName"
            value={filters.lastName}
            onChange={handleFilterChange}
            className="w-full rounded border border-gray-300 px-2 py-1"
            placeholder="Filter by Last Name"
          />
        </div>
        <div className="col-span-1 flex items-center">
          <input
            type="text"
            name="className"
            value={filters.className}
            onChange={handleFilterChange}
            className="w-full rounded border border-gray-300 px-2 py-1"
            placeholder="Filter by Class Name"
          />
        </div>
      </div>

      {filteredData.map((teacher, key) => (
        <div
          className="grid grid-cols-6 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
          key={key}
        >
          <div className="col-span-3 flex items-center">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <p className="text-sm text-black dark:text-white">
                {teacher.id}
              </p>
            </div>
          </div>
          <div className="col-span-2 hidden items-center sm:flex">
            <p className="text-sm text-black dark:text-white">
              {teacher.firstName}
            </p>
          </div>
          <div className="col-span-1 flex items-center">
            <p className="text-sm text-black dark:text-white">
              {teacher.lastName}
            </p>
          </div>
          <div className="col-span-1 flex items-center">
            <p className="text-sm text-black dark:text-white">
              {teacher.className}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeacherTable;
