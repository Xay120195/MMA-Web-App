import React, { useEffect, useState, useRef } from "react";

import { useParams } from "react-router-dom";
import BreadCrumb from "../breadcrumb/breadcrumb";
import TableInfo from "./table-info";
import ActionButtons from "./action-buttons";

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
  const [files, setFiles] = useState([]);
  const [idList, setIdList] = useState([]);
  const [getId, setId] = useState([{}]);
  const [fileMatter, setFileMatter] = useState([]);
  const params = useParams();
  const { matter_id } = params;
  const [checkAllState, setcheckAllState] = useState(false);
  const [search, setSearch] = useState("");
  const [ShowModalParagraph, setShowModalParagraph] = useState(false);
  const [selectRow, setSelectRow] = useState([]);
  const [newRow, setNewRow] = useState([]);
  const [newWitness, setNewWitness] = useState([]);

  const [srcIndex, setSrcIndex] = useState("");
  const [checkedState, setCheckedState] = useState(
    new Array(witness.length).fill(false)
  );
  const [selectedId, setSelectedId] = useState(0);
  const [totalChecked, settotalChecked] = useState(0);
  const [selectedRowsBG, setSelectedRowsBG] = useState([]);
  const [paragraph, setParagraph] = useState("");
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [ascDesc, setAscDesc] = useState(false);
  const [activateButton, setActivateButton] = useState(false);
  const [pasteButton, setPasteButton] = useState(false);
  const [selectedRowsBGFiles, setSelectedRowsBGFiles] = useState([]);
  // let selectedRowsBG = [];

  const [checkNo, setCheckNo] = useState(true);
  const [checkDate, setCheckDate] = useState(true);
  const [checkDesc, setCheckDesc] = useState(true);
  const [checkDocu, setCheckDocu] = useState(true);
  const [pageTotal, setPageTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [pageIndex, setPageIndex] = useState(1);
  const [vNextToken, setVnextToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [maxLoading, setMaxLoading] = useState(false);

  const [checkedStateShowHide, setCheckedStateShowHide] = useState([]);

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
    query listBackground($id: ID, $limit: Int, $nextToken: String) {
      clientMatter(id: $id) {
        id
        backgrounds (limit: $limit, nextToken: $nextToken) {
          items {
            id
            description
            date
            createdAt
            order
            files {
              items {
                id
                downloadURL
                details
                name
                type
              }
            }
          }
          nextToken
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
      /** Remove for now for lazy load */
      // variables: { id: matterId, limit: 25, nextToken: vNextToken },
      variables: { id: matterId },
    });

    setVnextToken(backgroundOpt.data.clientMatter.backgrounds.nextToken);

    if (backgroundOpt.data.clientMatter.backgrounds.items !== null) {
      result = backgroundOpt.data.clientMatter.backgrounds.items.map(
        ({ id, description, date, createdAt, order, files }) => ({
          createdAt: createdAt,
          id: id,
          description: description,
          date: date,
          order: order,
          files: files,
        })
      );

      console.log(result);

      setPageTotal(result.length);
      setPageSize(20);
      setPageIndex(1);

      if (witness !== null) {
        setWitness(result);
        setMaxLoading(false);
      }
    }
  };

  const goToBottom = () => {
    window.scrollTo({
      bottom: 0,
      behavior: "smooth",
    });
  };

  const loadMoreBackground = async () => {
    if (vNextToken !== null && !loading) {
      setLoading(true);
      let result = [];
      const matterId = matter_id;

      const backgroundOpt = await API.graphql({
        query: qListBackground,
        variables: { id: matterId, limit: 25, nextToken: vNextToken },
      });

      setVnextToken(backgroundOpt.data.clientMatter.backgrounds.nextToken);

      if (backgroundOpt.data.clientMatter.backgrounds.items !== null) {
        result = backgroundOpt.data.clientMatter.backgrounds.items.map(
          ({ id, description, date, createdAt, order, files }) => ({
            createdAt: createdAt,
            id: id,
            description: description,
            date: date,
            order: order,
            files: files,
          })
        );

        if (witness !== "") {
          goToBottom();
          setTimeout(() => {
            setLoading(false);
            setMaxLoading(false);
            setWitness((witness) => witness.concat(result));
          }, 1500);
        }

        /*let mergeArrFiles = [];
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
                uniqueId: result[i].id + id,
                backgroundId: result[i].id,
                id: id,
                downloadURL: downloadURL,
                name: name,
              })
            );

            mergeArrFiles.push(...arrFileResult);
          }
        }
        setFiles(mergeArrFiles);
        */
      }
    } else {
      console.log("Last Result!");
      setMaxLoading(true);
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
      sort = arr.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
      if (selectRow.length <= 0) {
        sort = arr.sort(
          (a, b) =>
            a.order - b.order ||
            new Date(b.date) - new Date(a.date) ||
            new Date(b.createdAt) - new Date(a.createdAt)
        );
      } else {
        sort = arr.sort(
          (a, b) => a.order - b.order || b.createdAt - a.createdAt
        );
      }
    }
    return sort;
  }

  const handleManageFiles = () => {
    setActivateButton(!activateButton);
  };

  let pageSizeConst = pageSize >= pageTotal ? pageTotal : pageSize;

  const getPaginateItems = async (action) => {
    let pageList = 20;

    if (action === "next") {
      setPageIndex(pageIndex + pageList);
      setPageSize(pageSize + pageList);
    } else if (action === "prev") {
      setPageIndex(pageIndex - pageList);
      setPageSize(pageSize - pageList);
    }
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
                activateButton={activateButton}
                setactivateButton={setActivateButton}
                handleManageFiles={handleManageFiles}
                checkNo={checkNo}
                setCheckNo={setCheckNo}
                checkDate={checkDate}
                setCheckDate={setCheckDate}
                checkDesc={checkDesc}
                setCheckDesc={setCheckDesc}
                checkDocu={checkDocu}
                setCheckDocu={setCheckDocu}
                checkedStateShowHide={checkedStateShowHide}
                setCheckedStateShowHide={setCheckedStateShowHide}
                pageTotal={pageTotal}
                pageIndex={pageIndex}
                pageSize={pageSize}
                pageSizeConst={pageSizeConst}
                getPaginateItems={getPaginateItems}
                selectRow={selectRow}
                setSelectRow={setSelectRow}
                setPasteButton={setPasteButton}
                pasteButton={pasteButton}
                setSrcIndex={setSrcIndex}
                srcIndex={srcIndex}
                setNewRow={setNewRow}
                newRow={newRow}
                newWitness={newWitness}
                setMaxLoading={setMaxLoading}
                sortByOrder={sortByOrder}
                setNewWitness={setNewWitness}
              />
            </div>
          </div>
        </div>
      </div>
      <TableInfo
        setPasteButton={setPasteButton}
        setIdList={setIdList}
        witness={witness}
        ShowModalParagraph={ShowModalParagraph}
        setShowModalParagraph={setShowModalParagraph}
        fileMatter={fileMatter}
        setFileMatter={setFileMatter}
        files={files}
        setFiles={setFiles}
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
        handleManageFiles={handleManageFiles}
        setActivateButton={setActivateButton}
        activateButton={activateButton}
        setAscDesc={setAscDesc}
        ascDesc={ascDesc}
        setSelectedRowsBGFiles={setSelectedRowsBGFiles}
        selectedRowsBGFiles={selectedRowsBGFiles}
        setSelectedId={setSelectedId}
        selectedId={selectedId}
        pasteButton={pasteButton}
        checkNo={checkNo}
        checkDate={checkDate}
        checkDesc={checkDesc}
        checkDocu={checkDocu}
        checkedStateShowHide={checkedStateShowHide}
        setCheckedStateShowHide={setCheckedStateShowHide}
        pageTotal={pageTotal}
        pageIndex={pageIndex}
        pageSize={pageSize}
        pageSizeConst={pageSizeConst}
        loadMoreBackground={loadMoreBackground}
        selectRow={selectRow}
        setSelectRow={setSelectRow}
        setSrcIndex={setSrcIndex}
        srcIndex={srcIndex}
        newRow={newRow}
        setNewRow={setNewRow}
        newWitness={newWitness}
        loading={loading}
        setLoading={setLoading}
        setMaxLoading={setMaxLoading}
        maxLoading={maxLoading}
        sortByOrder={sortByOrder}
      />
    </>
  );
}
