import React, { useEffect, useState } from "react";

import { useParams } from "react-router-dom";
import BreadCrumb from "../breadcrumb/breadcrumb";
import TableInfo from "./table-info";
import ActionButtons from "./action-buttons";

import { API } from "aws-amplify";
import { RemoveFileModal } from "../file-bucket/remove-file-modal.jsx";

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
  const [files, setFiles] = useState([]);
  const [idList, setIdList] = useState([]);
  const [getId, setId] = useState([{}]);
  const [fileMatter, setFileMatter] = useState([]);
  const params = useParams();
  const { matter_id } = params;
  const [checkAllState, setcheckAllState] = useState(false);
  const [search, setSearch] = useState("");
  const [ShowModalParagraph, setShowModalParagraph] = useState(false);
  const [checkedState, setCheckedState] = useState(
    new Array(witness.length).fill(false)
  );
  const [totalChecked, settotalChecked] = useState(0);
  const [selectedRowsBG, setSelectedRowsBG] = useState([]);
  const [paragraph, setParagraph] = useState("");
  const [showDeleteButton, setShowDeleteButton] = useState(false);

  // let selectedRowsBG = [];

  useEffect(() => {
    ClientMatterList();
    getBackground();
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
            order
          }
        }
      }
    }
  `;

  const qlistBackgroundFiles = `
  query getBackgroundByID($id: ID) {
    background(id: $id) {
      id
      files {
        items {
          id
          downloadURL
          details
          name
        }
      }
    }
  }`;
  
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
        ({ id, description, date, createdAt, order }) => ({
          createdAt: createdAt,
          id: id,
          description: description,
          date: date,
          order: order,
        })
      );

      setWitness(sortByOrder(result));

      let arrFileResult = [];
      for (let i = 0; i < sortByOrder(result).length; i++) {
        const backgroundFilesOpt = await API.graphql({
          query: qlistBackgroundFiles,
          variables: {
            id: result[i].id,
          },
        });
        if (backgroundFilesOpt.data.background.files !== null) {
          arrFileResult = backgroundFilesOpt.data.background.files.items.map(
            ({ id, downloadURL, name }) => ({
              backgroundId: result[i].id,
              id: id,
              downloadURL: downloadURL,
              name: name,
            })
          );
          setFiles(arrFileResult);
        }
      }
      
    }
  };

  const matt = matterList.find((i) => i.id === matter_id);
  const obj = { ...matt };
  const client = Object.values(obj);
  const cname = Object.values(client).map((o) => o.name);
  const clientName = cname[2];
  const matterName = cname[3];

  function sortByOrder(arr) {
    const isAllZero = arr.every((item) => item.order <= 0 && item.order === 0);
    let sort;
    if (isAllZero) {
      sort = arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      sort = arr.sort(
        (a, b) =>
          a.order - b.order || new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
    return sort;
  }

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
                getBackground={getBackground}
                selectedRowsBG={selectedRowsBG}
                setSelectedRowsBG={setSelectedRowsBG}
                setShowModalParagraph={setShowModalParagraph}
                paragraph={paragraph}
                showDeleteButton={showDeleteButton}
                setShowDeleteButton={setShowDeleteButton}
              />
            </div>
          </div>
        </div>
      </div>
      <TableInfo
        setIdList={setIdList}
        witness={witness}
        ShowModalParagraph={ShowModalParagraph}
        setShowModalParagraph={setShowModalParagraph}
        fileMatter={fileMatter}
        files={files}
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
        selectedRowsBG={selectedRowsBG}
        setSelectedRowsBG={setSelectedRowsBG}
        paragraph={paragraph}
        setParagraph={setParagraph}
        showDeleteButton={showDeleteButton}
        setShowDeleteButton={setShowDeleteButton}
      />
    </>
  );
}
