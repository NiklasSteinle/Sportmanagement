import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import StudentTable from "@/components/Tables/StudentTable";
import Link from "next/link";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";


const StudentPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Tables" />

      <div className="flex flex-col gap-10">
        <StudentTable/>
            
      </div>
    </DefaultLayout>
  );
};

export default StudentPage;
