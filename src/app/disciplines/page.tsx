import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Next.js Tables | TailAdmin - Next.js Dashboard Template",
    description:
      "This is Next.js Tables page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
  };

const DisciplinePage = () => {
    return (
      <DefaultLayout>
        <Breadcrumb pageName="Disziplinenkonfiguration" />
      </DefaultLayout>
    );
  };
  
  export default DisciplinePage;