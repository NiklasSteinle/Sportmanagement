"use client";
import React from "react";
import dynamic from "next/dynamic";

import TableOne from "../Tables/TableOne";

const MapOne = dynamic(() => import("@/components/Maps/MapOne"), {
  ssr: false,
});

const ChartThree = dynamic(() => import("@/components/Charts/ChartThree"), {
  ssr: false,
});

const Ergebnisse: React.FC = () => {
  return (
    <>
      <TableOne />
    </>
  );
};

export default Ergebnisse;
