import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { AppRoutes } from "../../constants/AppRoutes";
import { useParams } from "react-router-dom";
import { MdArrowBackIos, MdDragIndicator } from "react-icons/md";
import { useIdleTimer } from "react-idle-timer";
import BreadCrumb from "../breadcrumb/breadcrumb";
import TableInfo from "./table-info";
import ActionButtons from "./action-buttons";
import ToastNotification from "../toast-notification";
import * as IoIcons from "react-icons/io";

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
  const [ascDesc, setAscDesc] = useState(null);
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

  const [briefName, setBriefName] = useState("");
  const [briefId, setBriefId] = useState("");
  const [validationAlert, setValidationAlert] = useState("");
  const [alertMessage, setalertMessage] = useState();
  const [showToast, setShowToast] = useState(false);
  const [checkedStateShowHide, setCheckedStateShowHide] = useState([]);
  const [searchDescription, setSearchDescription] = useState("");

  useEffect(() => {
    getBackground();

    if (bgName === null) {
      getBriefs();
    }
  }, []);

  const hideToast = () => {
    setShowToast(false);
  };

  const getName = `
  query getBriefsByClientMatter($id: ID, $limit: Int, $nextToken: String) {
    clientMatter(id: $id) {
      briefs(limit: $limit, nextToken: $nextToken) {
        items {
          id
          name
          date
          order
        }
      }
    }
  }
  `;

  const [bgName, setBGName] = useState(null);

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

  const qBriefBackgroundList = `
    query getBriefByID($limit: Int, $nextToken: String, $id: ID, $sortOrder: OrderBy) {
      brief(id: $id) {
        id
        backgrounds(limit: $limit, nextToken: $nextToken, sortOrder: $sortOrder) {
          items {
            id
            description
            date
            createdAt
            order
            files {
              items {
                id
                name
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

    // if (background_id === "000") {
    // Remove this condition after migration
    //   const backgroundOpt = await API.graphql({
    //     query: qListBackground,
    //     variables: { id: matter_id, limit: 25, nextToken: vNextToken },
    //   });

    //   setVnextToken(backgroundOpt.data.clientMatter.backgrounds.nextToken);

    //   if (backgroundOpt.data.clientMatter.backgrounds.items !== null) {
    //     result = backgroundOpt.data.clientMatter.backgrounds.items.map(
    //       ({ id, description, date, createdAt, order, files }) => ({
    //         createdAt: createdAt,
    //         id: id,
    //         description: description,
    //         date: date,
    //         order: order,
    //         files: files,
    //       })
    //     );

    //     setPageTotal(result.length);
    //     setPageSize(20);
    //     setPageIndex(1);

    //     if (witness !== null) {
    //       setWitness(sortByOrder(result));
    //       setWait(true);
    //       setMaxLoading(false);
    //     }
    //   }
    // } else {
    const backgroundOpt = await API.graphql({
      query: qBriefBackgroundList,
      variables: {
        id: background_id,
        limit: 100,
        nextToken: null,
        sortOrder: "ORDER_ASC",
      },
    });

    setVnextToken(backgroundOpt.data.brief.backgrounds.nextToken);

    if (backgroundOpt.data.brief.backgrounds.items !== null) {
      result = backgroundOpt.data.brief.backgrounds.items.map(
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
        console.log(result);
        setWitness(sortByOrder(result));
        setWait(true);
        setMaxLoading(false);
      }
    }
    //}
  };

  const getBriefs = async () => {
    console.log("matterid", matter_id);
    const params = {
      query: getName,
      variables: {
        id: matter_id,
        limit: 100,
        nextToken: null,
      },
    };

    await API.graphql(params).then((brief) => {
      const matterFilesList = brief.data.clientMatter.briefs.items;
      console.log("mfl", matterFilesList);
      matterFilesList.map((x) =>
        x.id === background_id ? setBGName(x.name) : x
      );
    });
  };

  const loadMoreBackground = async () => {
    console.log("loadMoreBackground()");
    if (background_id === "000") {
      // Remove this condition after migration
      if (vNextToken !== null && !loading) {
        setLoading(true);
        let result = [];

        const backgroundOpt = await API.graphql({
          query: qListBackground,
          variables: { id: matter_id, limit: 25, nextToken: vNextToken },
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
            setTimeout(() => {
              setLoading(false);
              setMaxLoading(false);

              let arrConcat = witness.concat(result);
              setWitness([...new Set(sortByOrder(arrConcat))]);
            }, 1000);
          }
        }
      } else {
        console.log("Last Result!- Migration");
        setMaxLoading(true);
      }
    } else {
      if (vNextToken !== null && !loading) {
        console.log("Next Token is not null, fetch next page");
        setLoading(true);
        let result = [];

        const backgroundOpt = await API.graphql({
          query: qBriefBackgroundList,
          variables: {
            id: background_id,
            limit: 50,
            nextToken: vNextToken,
            sortOrder: "ORDER_ASC",
          },
        });

        setVnextToken(backgroundOpt.data.brief.backgrounds.nextToken);

        console.log(backgroundOpt);

        if (backgroundOpt.data.brief.backgrounds.items !== null) {
          result = backgroundOpt.data.brief.backgrounds.items.map(
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
            setTimeout(() => {
              setLoading(false);
              setMaxLoading(false);

              var arrConcat = witness.concat(result);

              if (searchDescription !== "") {
                arrConcat = witness
                  .concat(result)
                  .filter((x) =>
                    x.description
                      .toLowerCase()
                      .includes(searchDescription.toLowerCase())
                  );
                console.log("HELO", searchDescription);
              }

              if (ascDesc !== null) {
                console.log("sorting is ascending?", ascDesc);

                if (ascDesc === true) {
                  console.log("set order by Date ASC, CreatedAt DESC");

                  arrConcat = arrConcat
                    .slice()
                    .sort(
                      (a, b) =>
                        new Date(a.date) - new Date(b.date) ||
                        new Date(b.createdAt) - new Date(a.createdAt)
                    );
                } else if (!ascDesc) {
                  console.log("set order by Date DESC, CreatedAt DESC");

                  arrConcat = arrConcat
                    .slice()
                    .sort(
                      (a, b) =>
                        new Date(b.date) - new Date(a.date) ||
                        new Date(b.createdAt) - new Date(a.createdAt)
                    );
                }

                setWitness([...new Set(arrConcat)]);
              } else {
                setWitness([...new Set(sortByOrder(arrConcat))]);
              }
            }, 200);
          }
        }
      } else {
        console.log("All data has been loaded.");
        setMaxLoading(true);
      }
    }
  };

  const handleOnAction = (event) => {
    console.log("User did something", event);
    loadMoreBackground();
  };

  const handleOnIdle = (event) => {
    console.log("User is on idle");
    loadMoreBackground();
  };

  useIdleTimer({
    timeout: 60 * 40,
    onAction: handleOnAction,
    onIdle: handleOnIdle,
    debounce: 1000
  });

  function sortByOrder(arr) {
    // const isAllZero = arr.every((item) => item.order >= 0 && item.order !== 0);

    var zero;
    let sort;

    if(arr){
    // arr.map(
    //   (x, y)=> x.order - y.order === 0 ?
    //   sort=arr.sort((a, b)=>new Date(b.createdAt) - new Date(a.createdAt))
    //   :
       sort=arr.sort((a, b)=> a.order-b.order === 0 
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : a.order - b.order )
    //);
    }else{
      sort = arr;
    }
    // if (isAllZero) {
    //   sort = arr.sort(
    //     (a, b) =>
    //       a.order - b.order || new Date(b.createdAt) - new Date(a.createdAt)
    //   );
    // } else {
    //   sort = arr;
    // }
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
  const backgroundRowId = getQueryVariable("background_id");
  const matter_name = b64_to_utf8(m_name);
  const client_name = b64_to_utf8(c_name);

  function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str));
  }

  const handleNameContent = (e, name, id) => {
    if (!validationAlert) {
      setBriefName(!name ? "" : name);
      setBriefId(id);
      setValidationAlert("");
    } else {
      setBriefName("");
    }
  };

  //Updating brief name
  const mUpdateBriefName = `mutation updateBriefName($id: ID, $name: String) {
    briefUpdate(id: $id, name: $name) {
      id
    }
  }`;

  const handleOnChangeBiefName = (e) => {
    setBriefName(e.currentTarget.textContent);
  };

  const handleSaveBriefName = (e, name, id) => {
    const originalString = briefName.replace(/(<([^>]+)>)/gi, "");
    const final = originalString.replace(/\&nbsp;/g, " ");

    if (briefName.length <= 0) {
      setValidationAlert("Brief Name is required");
      setBGName(bgName);
    } else if (briefName === name) {
      setValidationAlert("");
      const data = {
        id,
        name: e.target.innerHTML,
      };
      const success = updateBriefName(data);
      setBGName(final);

      setalertMessage(`Successfully updated Background title`);
      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
        setalertMessage("");
      }, 1000);
    } else {
      setValidationAlert("");
      const data = {
        id,
        name: e.target.innerHTML,
      };
      const success = updateBriefName(data);
      setBGName(final);

      setalertMessage(`Successfully updated Background title`);
      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
        setalertMessage("");
      }, 1000);
    }
  };

  async function updateBriefName(data) {
    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mUpdateBriefName,
          variables: {
            id: data.id,
            name: data.name,
          },
        });
        resolve(request);
      } catch (e) {
        reject(e.errors[0].message);
      }
    });
  }

  useEffect(() => {
    if (searchDescription !== undefined) {
      filterRecord(searchDescription);
    }
  }, [searchDescription]);

  const handleSearchDescriptionChange = (e) => {
    setSearchDescription(e.target.value);
  };

  const filterRecord = (v) => {
    console.log("filter", v);
    if (v === "") {
      // Refresh page if necessary
      setVnextToken(null);
      getBackground();
    } else {
      const filterRecord = witness.filter((x) =>
        x.description.toLowerCase().includes(v.toLowerCase())
      );
      console.log("filterRecord:", filterRecord);
      setWitness(sortByOrder(filterRecord));
    }
  };

  return (
    <>
      <div
        className={"shadow-lg rounded bg-white z-30"}
        style={{ margin: "0 0 0 65px" }}
      >
        <div className="px-6 py-2">
          <Link
            to={`${
              AppRoutes.BRIEFS
            }/${matter_id}/?matter_name=${b64EncodeUnicode(
              matter_name
            )}&client_name=${b64EncodeUnicode(client_name)}`}
          >
            <button className="bg-white hover:bg-gray-100 text-black font-semibold py-2.5 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mb-3">
              <MdArrowBackIos />
              Back
            </button>
          </Link>
          <h1 className="font-bold text-3xl">
            <div className="flex">
              <p
                suppressContentEditableWarning={true}
                style={{
                  cursor: "auto",
                  outlineColor: "rgb(204, 204, 204, 0.5)",
                  outlineWidth: "thin",
                }}
                onClick={(e) => handleNameContent(e, bgName, background_id)}
                contentEditable={true}
                tabIndex="0"
                onInput={(e) => handleOnChangeBiefName(e)}
                onBlur={(e) => handleSaveBriefName(e, bgName, background_id)}
                className="px-1 text-3xl focus:outline-none text-gray-800 dark:text-gray-100 font-bold mb-1 min-w-min"
                dangerouslySetInnerHTML={{
                  __html: bgName,
                }}
              />
              &nbsp;<span className="text-3xl">of</span>&nbsp;
              <span className="font-semibold text-3xl">
                {client_name}/{matter_name}
              </span>
            </div>
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
          briefId={background_id}
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
          briefId={background_id}
          client_name={client_name}
          matter_name={matter_name}
        />

        {/* {witness !== null && witness.length !== 0 && ( */}
        <div className="pl-2 py-1 grid grid-cols-1 mb-3 pr-8">
          <span className="z-10 leading-snug font-normal text-center text-blueGray-300 absolute bg-transparent rounded text-base items-center justify-center w-8 py-3 px-3">
            <IoIcons.IoIosSearch />
          </span>
          <input
            type="search"
            placeholder="Type to search description in the Background ..."
            onChange={handleSearchDescriptionChange}
            className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full pl-10"
          />
        </div>
        {/* )} */}
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
        briefId={background_id}
        searchDescription={searchDescription}
      />

      {showToast && (
        <ToastNotification title={alertMessage} hideToast={hideToast} />
      )}
    </>
  );
};

export default Background;
