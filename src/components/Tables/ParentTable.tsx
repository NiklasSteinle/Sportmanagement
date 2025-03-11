import Image from "next/image";
import { Parent } from "@/types/parent";

const parentData: Parent[] = [
  {
    id: 1,
    firstName: "John",
    lastName: "Smith",
    studentID: 1,
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Doe",
    studentID: 2,
  },
  {
    id: 3,
    firstName: "Charlie",
    lastName: "Brown",
    studentID: 3,
  },

];

const ParentTable = () => {
  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="px-4 py-6 md:px-6 xl:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Erziehungsberechtigte
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
          <p className="font-medium">studentID</p>
        </div>
      </div>

      {parentData.map((parent, key) => (
        <div
          className="grid grid-cols-6 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
          key={key}
        >
          <div className="col-span-3 flex items-center">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <p className="text-sm text-black dark:text-white">
                {parent.id}
              </p>
            </div>
          </div>
          <div className="col-span-2 hidden items-center sm:flex">
            <p className="text-sm text-black dark:text-white">
              {parent.firstName}
            </p>
          </div>
          <div className="col-span-1 flex items-center">
            <p className="text-sm text-black dark:text-white">
              {parent.lastName}
            </p>
          </div>
          <div className="col-span-1 flex items-center">
            <p className="text-sm text-black dark:text-white">
              {parent.studentID}
            </p>
            </div>
        </div>
      ))}
    </div>
  );
};

export default ParentTable;
