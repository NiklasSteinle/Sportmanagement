import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ParentTable from "@/components/Tables/ParentTable";
import Link from "next/link";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";


const ParentPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Tables" />

      <div className="flex flex-col gap-10">
        <ParentTable />
            <Link
              href="#"
              className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary px-10 py-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
            >
              Erziehungsberechtigte hinzufügen
            </Link>
      </div>
    </DefaultLayout>
  );
};

export default ParentPage;
