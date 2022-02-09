import React from "react";
import { matters } from "../dashboard/data-source";
import { useParams } from "react-router-dom";
import BreadCrumb from "./breadcrumb";
import TableInfo from "./table-info";
import ActionButtons from "./action-buttons";
import { witness_affidavits } from "./data-source";

const contentDiv = {
  margin: "0 0 0 65px",
};

const mainGrid = {
  display: "grid",
  gridtemplatecolumn: "1fr auto",
};

export default function Background() {
  const params = useParams();
  const { matter_id } = params;

  const data = matters.find((item) => item.id === Number(matter_id));

  return (
    <>
      <div
        className={
          "p-5 relative flex flex-col min-w-0 break-words mb-6 shadow-lg rounded bg-white"
        }
        style={contentDiv}
      >
        <div className="relative flex-grow flex-1">
          <div style={mainGrid}>
            <div>
              <span className={"text-lg mt-3 font-medium"}>
                Claire Greene {data.name} Background
              </span>
              <BreadCrumb data={data} />
              <ActionButtons />
            </div>
          </div>
        </div>
      </div>
      <TableInfo witness_affidavits={witness_affidavits} />
    </>
  );
}
