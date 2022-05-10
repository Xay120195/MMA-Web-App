import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { AppRoutes } from "../../constants/AppRoutes";
import { useParams } from "react-router-dom";
import { MdArrowBackIos, MdDragIndicator } from "react-icons/md";
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

const Background = () => {
  const [matterList, setClientMattersList] = useState([]);
  const [witness, setWitness] = useState([]);
  const [files, setFiles] = useState([]);
  const [idList, setIdList] = useState([]);
  const [getId, setId] = useState([{}]);
  const [fileMatter, setFileMatter] = useState([]);
  const params = useParams();
  const { matter_id, background_id } = params;
  const [checkAllState, setcheckAllState] = useState(false);
  const [search, setSearch] = useState("");
  const [ShowModalParagraph, setShowModalParagraph] = useState(false);
  const [selectRow, setSelectRow] = useState([]);
  const [newRow, setNewRow] = useState([{}]);
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
  const [wait, setWait] = useState(false);
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
    getBackground();
  }, []);

  const qListBackground = `
    query listBackground($id: ID, $limit: Int, $nextToken: String) {
      clientMatter(id: $id) {
        id
        backgrounds (limit: $limit, nextToken: $nextToken, sortOrder:CREATED_DESC) {
          items {
            id
            description
            date
            createdAt
            order
            files {
              items {
                id
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

  const getBackground = async () => {
    let result = [];
    setWait(false);
    const matterId = matter_id;

    // const mInitializeOrders = `
    //   mutation initializeOrder($clientMatterId: ID) {
    //     backgroundBulkInitializeOrders(clientMatterId: $clientMatterId) {
    //       id
    //     }
    //   }
    // `;

    // await API.graphql({
    //   query: mInitializeOrders,
    //   variables: { clientMatterId: matterId },
    // }).then((res) => {
    //   console.log("File Bucket: Initial Sorting Successful!");
    //   console.log(res);
    // });

    const backgroundOpt = await API.graphql({
      query: qListBackground,
      variables: { id: matterId, limit: 20, nextToken: vNextToken },
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

      setPageTotal(result.length);
      setPageSize(20);
      setPageIndex(1);

      if (witness !== null) {
        setWitness(sortByOrder(result));

        // const res = result.map(({ id }, index) => ({
        //   id: id,
        //   order: index + 1,
        // }));

        // const mUpdateBackgroundOrder = `
        //   mutation bulkUpdateBackgroundOrders($arrangement: [ArrangementInput]) {
        //     backgroundBulkUpdateOrders(arrangement: $arrangement) {
        //       id
        //       order
        //     }
        //   }`;
        // const response = await API.graphql({
        //   query: mUpdateBackgroundOrder,
        //   variables: {
        //     arrangement: res,
        //   },
        // });
        // console.log(response);
        setWait(true);
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
        variables: { id: matterId, limit: 20, nextToken: vNextToken },
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
          //goToBottom();
          setTimeout(() => {
            setLoading(false);
            setMaxLoading(false);

            let arrConcat = witness.concat(result);
            setWitness([...new Set(sortByOrder(arrConcat))]);
          }, 1000);
        }
      }
    } else {
      console.log("Last Result!");
      setMaxLoading(true);
    }
  };

  function sortByOrder(arr) {
    const isAllZero = arr.every((item) => item.order >= 0 && item.order !== 0);
    let sort;
    if (isAllZero) {
      sort = arr.sort(
        (a, b) =>
          a.order - b.order || new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else {
      sort = arr;
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

  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      if (pair[0] == variable) {
        return pair[1];
      }
    }
    return false;
  }

  function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
  }

  const m_name = getQueryVariable("matter_name");
  const c_name = getQueryVariable("client_name");
  const matter_name = b64_to_utf8(m_name);
  const client_name = b64_to_utf8(c_name);

  return (
    <>
      <div
        className={"shadow-lg rounded bg-white z-30"}
        style={{ margin: "0 0 0 65px" }}
      >
        <div className="px-6 py-2">
          <Link to={AppRoutes.DASHBOARD}>
            <button className="bg-white hover:bg-gray-100 text-black font-semibold py-2.5 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mb-3">
              <MdArrowBackIos />
              Back
            </button>
          </Link>
          <h1 className="font-bold text-3xl">
            Background&nbsp;<span className="text-3xl">of</span>&nbsp;
            <span className="font-semibold text-3xl">
              {client_name}/{matter_name}
            </span>
          </h1>
        </div>
      </div>

      <div
        className="bg-white z-30"
        style={{ position: "sticky", top: "0", margin: "0 0 0 85px" }}
      >
        <BreadCrumb
          matterId={matter_id}
          client_name={client_name}
          matter_name={matter_name}
        />
        <ActionButtons
          witness={witness}
          setWitness={setWitness}
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
      <TableInfo
        client_name={client_name}
        matter_name={matter_name}
        wait={wait}
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
};

export default Background;
