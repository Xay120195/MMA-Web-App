import React, { useEffect, useState } from "react";
import { client, matters } from "../dashboard/data-source";
import { useParams } from "react-router-dom";
import BreadCrumb from "../breadcrumb/breadcrumb";
import TableInfo from "./table-info";
import ActionButtons from "./action-buttons";
import { witness_affidavits } from "./data-source";
import { API } from "aws-amplify";

const contentDiv = {
  margin: "0 0 0 65px",
};

const mainGrid = {
  display: "grid",
  gridtemplatecolumn: "1fr auto",
};

export default function Background() {
  const [matterList, setClientMattersList] = useState([]);
  const [witness, setWitness] = useState([]);
  const [idList, setIdList] = useState([]);
  const [getId, setId] = useState([{}]);
  const [matters, setMatters] = useState([]);
  const params = useParams();
  const { matter_id } = params;
  const [checkAllState, setcheckAllState] = useState(false);
  const [search, setSearch] = useState("");
  const [checkedState, setCheckedState] = useState(
    new Array(witness.length).fill(false)
  );

  const [totalChecked, settotalChecked] = useState(0);

  useEffect(() => {
    ClientMatterList();
    //if (witness === null) {
    getBackground();
    //}
  }, []);

  const listClientMatters = `
  query listClientMatters($companyId: String) {
    company(id: $companyId) {
      clientMatters {
        items {
          id
          createdAt
          client {
            id
            name
          }
          matter {
            id
            name
          }
        }
      }
    }
  }
  `;

  const ClientMatterList = async () => {
    let result = [];

    const companyId = localStorage.getItem("companyId");
    const clientMattersOpt = await API.graphql({
      query: listClientMatters,
      variables: {
        companyId: companyId,
      },
    });

    if (clientMattersOpt.data.company.clientMatters.items !== null) {
      result = clientMattersOpt.data.company.clientMatters.items;

      var apdPr = result.map((v) => ({
        ...v,
      }));

      setClientMattersList(apdPr);
    }
  };

  const qListBackground = `
    query listBackground($id: ID) {
      clientMatter(id: $id) {
        id
        backgrounds {
          items {
            id
            description
            date
            createdAt
          }
        }
      }
    }
  `;

  const getBackground = async () => {
    let result = [];
    const matterId = matter_id;

    const backgroundOpt = await API.graphql({
      query: qListBackground,
      variables: {
        id: matterId,
      },
    });

    if (backgroundOpt.data.clientMatter.backgrounds !== null) {
      result = backgroundOpt.data.clientMatter.backgrounds.items.map(
        ({ id, description, date, createdAt }) => ({
          createdAt: createdAt,
          id: id,
          description: description,
          date: date,
        })
      );
      console.log(result);
      setWitness(result);
    }
  };

  const matt = matterList.find((i) => i.id === matter_id);
  const obj = { ...matt };
  const client = Object.values(obj);
  const cname = Object.values(client).map((o) => o.name);
  const clientName = cname[2];
  const matterName = cname[3];

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
              <span className="text-lg mt-3 font-medium">
                {clientName}/{matterName}
              </span>
              <BreadCrumb matterId={matter_id} />
              <ActionButtons
                setWitness={setWitness}
                witness={witness}
                idList={idList}
                checkAllState={checkAllState}
                setcheckAllState={setcheckAllState}
                checkedState={checkedState}
                setCheckedState={setCheckedState}
                totalChecked={totalChecked}
                settotalChecked={settotalChecked}
                setId={setId}
                search={search}
                setSearch={setSearch}
                getId={getId}
                matterId={matter_id}
              />
            </div>
          </div>
        </div>
      </div>
      <TableInfo
        setIdList={setIdList}
        witness={witness}
        setWitness={setWitness}
        checkAllState={checkAllState}
        setcheckAllState={setcheckAllState}
        checkedState={checkedState}
        setCheckedState={setCheckedState}
        totalChecked={totalChecked}
        settotalChecked={settotalChecked}
        setId={setId}
        getId={getId}
        search={search}
        matterId={matter_id}
        getBackground={getBackground}
      />
    </>
  );
}
