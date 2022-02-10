import React, { useEffect, useState } from "react";
import { matters } from "../dashboard/data-source";
import { useParams } from "react-router-dom";
import BreadCrumb from "../breadcrumb/breadcrumb";
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
  const [allData, setAllData] = useState(matters);
  const [witness, setWitness] = useState(witness_affidavits);
  const [idList, setIdList] = useState([]);
  const params = useParams();
  const { matter_id } = params;

  useEffect(() => {
    rundata();
    setWitness(witness_affidavits);
  }, [witness_affidavits]);

  const rundata = () => {
    setAllData(allData.find((item) => item.id === Number(matter_id)));
  };

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
                Claire Greene {allData.name} Background
              </span>
              <BreadCrumb data={allData} />
              <ActionButtons
                data={allData}
                setAllData={setAllData}
                setWitness={setWitness}
                witness={witness}
                idList={idList}
              />
            </div>
          </div>
        </div>
      </div>
      <TableInfo setIdList={setIdList} witness={witness} />
    </>
  );
}
