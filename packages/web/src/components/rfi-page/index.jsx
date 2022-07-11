import React, { useState, useEffect, useRef } from "react";
import BlankState from "../dynamic-blankstate";
import { MdArrowForwardIos } from "react-icons/md";
import ToastNotification from "../toast-notification";
import { IoIosArrowDropright } from "react-icons/io";
import { AiOutlineFolderOpen } from "react-icons/ai";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
// import BlankList from "../../assets/images/RFI_Blank_List.svg";
import BlankQuestion from "../../assets/images/RFI_Blank_State.svg";
import BlankAnswer from "../../assets/images/RFI_Blank_Answer.svg";
import { Link } from "react-router-dom";
import { AppRoutes } from "../../constants/AppRoutes";
import { useIdleTimer } from "react-idle-timer";
import SessionTimeout from "../session-timeout/session-timeout-modal";
import { Auth } from "aws-amplify";
import { Redirect, useHistory } from "react-router-dom";
import { useParams } from "react-router-dom";
import { API } from "aws-amplify";
import { MdDragIndicator } from "react-icons/md";

export default function RFIPage() {
  const { matter_id } = useParams();
  const [showToast, setShowToast] = useState(false);
  const [alertMessage, setalertMessage] = useState();
  let history = useHistory();
  const bool = useRef(false);
  const [showSessionTimeout, setShowSessionTimeout] = useState(false);
  const [showQuestionBox, setshowQuestionBox] = useState(false);
  const [selected, setSelected] = useState("");

  const [resultMessage, setResultMessage] = useState("");

  const [questions, setQuestions] = useState(null); //listing
  const [questionDetails, setQuestionDetails] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (questions === null) {
      console.log("q/a table is null");
      getQuestionsAnswers();
    }
  });

  const qGetQuestionsAnswers = `
    query MyQuery($id: ID) {
      rfi(id: $id) {
        requests {
          items {
            id
            itemNo
            order
            question
            createdAt
            answer
          }
        }
      }
    }`;

  const mSaveQuestionsAnswers = `
    mutation createRequest($rfiId: ID, $question: String, $itemNo: String, $answer: String, $order: Int) {
      requestCreate(answer: $answer, itemNo: $itemNo, order: $order, question: $question, rfiId: $rfiId) {
        id
        createdAt
        question
        answer
        itemNo
        order
      }
    }`;

  let getQuestionsAnswers = async () => {
    console.log()
    const params = {
      query: qGetQuestionsAnswers,
      variables: {
        id: matter_id
      },
    };

    const qaList = await API.graphql(params).then((qa) => {
      console.log("list", qa)
      const QandA = qa.data.rfi.requests.items;
      console.log("mfl", QandA);
      const dataSort = [...QandA].sort((a, b) => a.order - b.order);
      setQuestions(dataSort);
    });
  }

  const handleSubmit = async () => {
    setshowQuestionBox(false);

    setResultMessage(`Question submitted. Please wait for response`);
    setShowToast(true);
    const result = await API.graphql({
      query: mSaveQuestionsAnswers,
      variables: {
        rfiId: matter_id,
        question: questionDetails,
        answer: '',
        order: questions === null ? 0 : questions.length+1,
        itemNo: "0"
      },
    });

    var newEntry =  
    {
      answer:  result.data.requestCreate.answer,
      createdAt: result.data.requestCreate.createdAt,
      id: result.data.requestCreate.id,
      itemNo: result.data.requestCreate.itemNo,
      order: result.data.requestCreate.order,
      question: result.data.requestCreate.question
    };

    let newData = [...questions];
    newData = [...newData, newEntry];
    const dataSort = [...newData].sort((a, b) => a.order - b.order);

    setQuestions(dataSort);

    console.log("result", result);

    // let temp = [...questions];
    // temp = [...temp, result.data.requestCreate];

    // setQuestions(temp);


    setTimeout(() => {
      setShowToast(false);
      //getQuestionsAnswers();
    }, 3000);
  }

  const setQDetails = (e) => {
    console.log(e.target.value);
    setQuestionDetails(e.target.value);
  }


  const hideToast = () => {
    setShowToast(false);
  };

  const contentDiv = {
    margin: "0 0 0 65px",
  };

  const mainGrid = {
    display: "grid",
    gridtemplatecolumn: "1fr auto",
  };


  const rfiListUrl =
    AppRoutes.MATTERSRFI +
    "/" +
    getParameterByName("matter_id") +
    "/?matter_name=" +
    getParameterByName("matter_name") +
    "&client_name=" +
    getParameterByName("client_name");

  function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
  }

  function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
  }

  var timeoutId;

  const handleOnAction =  (event) => {
    //function for detecting if user moved/clicked.
    //if modal is active and user moved, automatic logout (session expired)
    //bool.current = false;
    if(showSessionTimeout){
      setTimeout(() => {
        Auth.signOut().then(() => {
          clearLocalStorage();
          console.log("Sign out completed.");
          history.push("/");
        });
      
        function clearLocalStorage() {
          localStorage.removeItem("userId");
          localStorage.removeItem("email");
          localStorage.removeItem("firstName");
          localStorage.removeItem("lastName");
          localStorage.removeItem("userType");
          localStorage.removeItem("company");
          localStorage.removeItem("companyId");
          localStorage.removeItem("access");
        }
      }, 3000);
    }

    clearTimeout(timeoutId);

  };

  const handleOnIdle = (event) => {
    //function for detecting if user is on idle.
    //after 30 mins, session-timeout modal will show
    //bool.current = true;
    timeoutId = setTimeout(() => {
      setShowSessionTimeout(true);
    }, 60000 * 40);

  };

  useIdleTimer({
    timeout: 60 * 40,
    onAction: handleOnAction,
    onIdle: handleOnIdle,
    debounce: 1000,
  });


  const handleSelectItem = (itemid) => {
    let temp = selectedItems;
    console.log("ids",selectedItems);

    var index = temp.findIndex(function(o){
          return o === itemid;
    })
    console.log("index",index);

    if (index !== -1){
      temp.splice(index, 1);
      console.log("removed", temp);
      setSelectedItems(temp);
    }else{
      temp = [...temp, itemid];
      console.log("added", temp);
      setSelectedItems(temp);
    }
  }

  function findId(itemid){
    let temp = selectedItems;

    var index = temp.findIndex(function(o){
          return o === itemid;
    });

    if (index !== -1){
      return true;
    }else{
      return false;
    }
  }

  function testcode(){
    console.log("hello");
  }

  return (
    <>
      <div
        className={
          "p-5 relative flex flex-col min-w-0 break-words mb-6 shadow-lg rounded bg-white h-screen"
        }
        style={contentDiv}
      >
        <div className="relative flex-grow flex-1 h-screen">
          <div style={mainGrid}>
            <div>
              <h1 className="text-3xl">
                <span className="font-bold text-3xl flex-inline">
                  {" "}
                  <IoIosArrowDropright className="h-8 w-8 absolute -ml-1 " />{" "}
                  &nbsp;&nbsp;&nbsp;&nbsp; Request For Information{" "}
                </span>
                {/* of */}
                <span className="text-gray-500 text-3xl ml-2">
                  {/* {b64_to_utf8("matter_id")} */}
                </span>
              </h1>
            </div>
            <div className="py-3">
              <span className="font-medium py-2 flex px-3">
                <AiOutlineFolderOpen /> &nbsp; RFI
              </span>
            </div>

            <div className="absolute right-0">
              <Link to={rfiListUrl}>
                <button className="bg-white hover:bg-gray-100 text-black font-semibold py-2.5 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring">
                  Back &nbsp;
                  <MdArrowForwardIos />
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="shadow overflow-scroll border-b border-gray-200 sm:rounded-lg my-5 h-full">
        <DragDropContext 
          // onDragEnd={handleDragEnd}
        >
          <table className="table-fixed divide-y divide-x border-slate-500 border flex-1 w-full ">
            <thead className="bg-gray-100 z-20"  style={{ position: "sticky", top: "-1px" }}>
              <tr>
                <th className="text-left py-4 px-4 border-slate-500 border">
                  Question
                </th>
                <th className="text-left py-4 px-4 border-slate-500 border">
                  <IoIosArrowDropright className="h-8 w-8 absolute -ml-8 -mt-1" />{" "}
                  &nbsp; Answer
                </th>
              </tr>
            </thead>
            <Droppable droppableId="tbl-backgrounds">
            {(provider) => (
            <tbody className=" w-full" ref={provider.innerRef} {...provider.droppableProps}>
            { questions === null || questions === undefined ? 
              <tr></tr>
            : questions.length === 0 ?
              <tr>
                <td className="border-slate-500 border ">
                  <BlankState
                    displayText={"There are no questions to show here yet"}
                    txtLink={"start adding one"}
                    iconDisplay={BlankQuestion}
                  />
                </td>
                <td className="border-slate-500 border ">
                  <BlankState
                    displayText={"There are no answers to show in this section"}
                    noLink={
                      "Start creating your RFIs to collaborate with your client"
                    }
                    iconDisplay={BlankAnswer}
                  />
                </td>
              </tr>
              :
              <>
              {questions.map(
                (items, index) =>
              <Draggable
                key={items.id + "-" + index}
                draggableId={items.id + "-" + index}
                index={index}
              >
              {(provider, snapshot) => (
                <tr className="h-full w-full"
                  index={index}
                  key={items.id}
                  {...provider.draggableProps}
                  ref={provider.innerRef}
                  style={{
                    ...provider.draggableProps.style,
                    backgroundColor:
                      snapshot.isDragging ||
                      items.id === selected
                        ? "rgba(255, 255, 239, 0.767)"
                        : "",
                  }}
                >
                  <td className="h-full align-top border-slate-500 border" {...provider.dragHandleProps}> 
                    <span className="px-3 py-5 inline-flex">
                      <div className="inline-flex w-12">
                      <MdDragIndicator
                        className="text-2xl"
                        // onClick={() =>
                        //  handleChageBackground(item.id)
                        //}
                      />
                      <input type="checkbox" 
                        className="cursor-pointer mr-1 mt-1"
                        checked={selectedItems.includes(items.id)}
                        onChange={()=>handleSelectItem(items.id)}
                        value={items.id}
                        disabled={true}
                      />
                      </div>
                      <div className="w-full">
                        <p> {index+1}. {items.question} </p>
                      </div>
                    </span>
                    
                  </td>
                  <td className="h-full align-top border-slate-500 border">
                    <div className="px-3 py-5 ">
                      {items.answer === "" || items.answer === null 
                      ? <p>No Information</p>
                      : <p>{items.answer}</p>
                      }
                     </div>
                  </td>
                </tr>
              )}
              </Draggable>
              )}
              </>
            }
            </tbody>
            )}
            </Droppable>
          </table>
        </DragDropContext>
      
        </div>
        {
          showQuestionBox ? 
          <div className=" w-full -mt-10 h-40">
            <div className="flex-1 bg-white ">
              <textarea
                className="w-1/2 h-40 border-2 border-slate-700 resize-none text-gray-700"
                rows="6"
                placeholder="Submit request for information."
                onBlur={()=> setshowQuestionBox(false)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                onChange={(e) => setQDetails(e)}
              ></textarea>
            </div>
          </div>
          :
          <div className=" w-full -mt-10 h-32">
            <div className="flex-1 bg-white">
              <button className="bg-blue-400 text-white hover:bg-white hover:text-blue-400 border-2 hover:border-blue-400 text-2xl p-1 px-3 rounded-full inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mx-2"
                onClick={() => setshowQuestionBox(true)}
               
              >
                    +
              </button>
            </div>
          </div>
        }
      </div>

      {showToast && (
        <ToastNotification title={resultMessage} hideToast={hideToast} />
      )}
      {showSessionTimeout && (
        <SessionTimeout/>
      )}
    </>
  );
}
