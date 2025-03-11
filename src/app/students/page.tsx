import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import StudentTable from "@/components/Tables/StudentTable";
import Link from "next/link";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "Next.js Tables | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Tables page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

const StudentPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Tables" />

      <div className="flex flex-col gap-10">
        <StudentTable />
            <Link
              href="#"
              className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary px-10 py-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
            >
              Add Student
            </Link>
      </div>
    </DefaultLayout>
  );
};

export default StudentPage;
