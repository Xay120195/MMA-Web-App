import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import React, { useEffect, useRef, useState } from 'react';
import { Redirect, useHistory } from 'react-router-dom';

import { API } from 'aws-amplify';
import { AiOutlineFolderOpen } from 'react-icons/ai';
import { AppRoutes } from '../../constants/AppRoutes';
import { Auth } from 'aws-amplify';
import BlankAnswer from '../../assets/images/RFI_Blank_Answer.svg';
import BlankQuestion from '../../assets/images/RFI_Blank_State.svg';
import BlankState from '../dynamic-blankstate';
import { CgChevronLeft } from 'react-icons/cg';
import { FaTachometerAlt } from 'react-icons/fa';
import { IoIosArrowDropright } from 'react-icons/io';
import { Link } from 'react-router-dom';
import { MdArrowForwardIos } from 'react-icons/md';
import { MdDragIndicator } from 'react-icons/md';
import SessionTimeout from '../session-timeout/session-timeout-modal';
import ToastNotification from '../toast-notification';
import { useIdleTimer } from 'react-idle-timer';
import { useParams } from 'react-router-dom';

// import BlankList from "../../assets/images/RFI_Blank_List.svg";

export default function RFIPage() {
  const { matter_id } = useParams();
  const [showToast, setShowToast] = useState(false);
  const [alertMessage, setalertMessage] = useState();
  let history = useHistory();
  const bool = useRef(false);
  const [showSessionTimeout, setShowSessionTimeout] = useState(false);
  const [showQuestionBox, setshowQuestionBox] = useState(false);
  const [selected, setSelected] = useState('');

  const [resultMessage, setResultMessage] = useState('');

  const [questions, setQuestions] = useState(null); //listing
  const [questionDetails, setQuestionDetails] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (questions === null) {
      console.log('q/a table is null');
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
    console.log();
    const params = {
      query: qGetQuestionsAnswers,
      variables: {
        id: matter_id,
      },
    };

    const qaList = await API.graphql(params).then((qa) => {
      console.log('list', qa);
      const QandA = qa.data.rfi.requests.items;
      console.log('mfl', QandA);
      const dataSort = [...QandA].sort((a, b) => a.order - b.order);
      setQuestions(dataSort);
    });
  };

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
        order: questions === null ? 0 : questions.length + 1,
        itemNo: '0',
      },
    });

    var newEntry = {
      answer: result.data.requestCreate.answer,
      createdAt: result.data.requestCreate.createdAt,
      id: result.data.requestCreate.id,
      itemNo: result.data.requestCreate.itemNo,
      order: result.data.requestCreate.order,
      question: result.data.requestCreate.question,
    };

    let newData = [...questions];
    newData = [...newData, newEntry];
    const dataSort = [...newData].sort((a, b) => a.order - b.order);

    setQuestions(dataSort);

    console.log('result', result);

    // let temp = [...questions];
    // temp = [...temp, result.data.requestCreate];

    // setQuestions(temp);

    setTimeout(() => {
      setShowToast(false);
      //getQuestionsAnswers();
    }, 3000);
  };

  const setQDetails = (e) => {
    console.log(e.target.value);
    setQuestionDetails(e.target.value);
  };

  const hideToast = () => {
    setShowToast(false);
  };

  const contentDiv = {
    margin: '0 0 0 65px',
  };

  const mainGrid = {
    display: 'grid',
    gridtemplatecolumn: '1fr auto',
  };

  const rfiListUrl =
    AppRoutes.MATTERSRFI +
    '/' +
    getParameterByName('matter_id') +
    '/?matter_name=' +
    getParameterByName('matter_name') +
    '&client_name=' +
    getParameterByName('client_name');

  function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
  }

  function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
  }

  var timeoutId;

  const handleOnAction = (event) => {
    //function for detecting if user moved/clicked.
    //if modal is active and user moved, automatic logout (session expired)
    //bool.current = false;
    if (showSessionTimeout) {
      localStorage.removeItem('userId');
      localStorage.removeItem('email');
      localStorage.removeItem('firstName');
      localStorage.removeItem('lastName');
      localStorage.removeItem('userType');
      localStorage.removeItem('company');
      localStorage.removeItem('companyId');
      localStorage.removeItem('access');
    }

    clearTimeout(timeoutId);
  };

  const handleOnIdle = (event) => {
    //function for detecting if user is on idle.
    //after 30 mins, session-timeout modal will show
    //bool.current = true;
    timeoutId = setTimeout(() => {
      setShowSessionTimeout(true);
    }, 60000 * 60);
  };

  useIdleTimer({
    timeout: 60 * 40,
    onAction: handleOnAction,
    onIdle: handleOnIdle,
    debounce: 1000,
  });

  const handleSelectItem = (itemid) => {
    let temp = selectedItems;
    console.log('ids', selectedItems);

    var index = temp.findIndex(function (o) {
      return o === itemid;
    });
    console.log('index', index);

    if (index !== -1) {
      temp.splice(index, 1);
      console.log('removed', temp);
      setSelectedItems(temp);
    } else {
      temp = [...temp, itemid];
      console.log('added', temp);
      setSelectedItems(temp);
    }
  };

  function findId(itemid) {
    let temp = selectedItems;

    var index = temp.findIndex(function (o) {
      return o === itemid;
    });

    if (index !== -1) {
      return true;
    } else {
      return false;
    }
  }

  function testcode() {
    console.log('hello');
  }

  function testcode1() {
    console.log('hellohi');
  }

  useEffect(() => {
    console.log('useEffect');
  }, []);

  return (
    <>
      <div
        className={
          'p-5 relative pl-5 sm:pl-20 flex flex-col min-w-0 break-words shadow-lg rounded bg-white h-screen'
        }
      >
        <div className="sticky pl-16 sm:pl-0 top-0 py-4 flex items-center gap-2 bg-white z-10">
          <div
            onClick={() => history.goBack()}
            className="w-8 py-5 cursor-pointer"
          >
            <CgChevronLeft />
          </div>
          <div>
            <p className="flex flex-col">
              <span className="text-lg font-bold">Request for Information</span>
            </p>
            <div className="flex items-center gap-3 text-gray-500 mt-2">
              <FaTachometerAlt />
              <Link to="/dashboard">
                <p className="font-semibold">Dashboard</p>
              </Link>
              <span>/</span>
              <p className="font-semibold">RFI</p>
              <span className="hidden sm:block">/</span>
              <p className="font-semibold hidden sm:block">
                *Insert Matter Name*
              </p>
              <span className="hidden sm:block">/</span>
              <p className="font-semibold hidden sm:block">*Insert RFI Name*</p>
            </div>
          </div>
        </div>

        <div className="shadow overflow-scroll border-b border-gray-200 sm:rounded-lg my-5 h-full">
          <DragDropContext
          // onDragEnd={handleDragEnd}
          >
            <table className="table-fixed divide-y divide-x border-slate-500 border flex-1 w-full">
              <thead
                className="bg-gray-100 z-20"
                style={{ position: 'sticky', top: '-1px' }}
              >
                <tr>
                  <th className="text-left py-4 px-4 border-slate-500 border">
                    Question
                  </th>
                  <th className="text-left py-4 px-4 border-slate-500 border">
                    <IoIosArrowDropright className="h-8 w-8 absolute -ml-8 -mt-1" />{' '}
                    &nbsp; Answer
                  </th>
                </tr>
              </thead>
              <Droppable droppableId="tbl-backgrounds">
                {(provider) => (
                  <tbody
                    className=" w-full"
                    ref={provider.innerRef}
                    {...provider.droppableProps}
                  >
                    {questions === null || questions === undefined ? (
                      <tr></tr>
                    ) : questions.length === 0 ? (
                      <tr>
                        <td className="border-slate-500 border">
                          <BlankState
                            displayText={
                              'There are no questions to show here yet'
                            }
                            txtLink={'start adding one'}
                            iconDisplay={BlankQuestion}
                          />
                        </td>
                        <td className="border-slate-500 border">
                          <BlankState
                            displayText={
                              'There are no answers to show in this section'
                            }
                            noLink={
                              'Start creating your RFIs to collaborate with your client'
                            }
                            iconDisplay={BlankAnswer}
                          />
                        </td>
                      </tr>
                    ) : (
                      <>
                        {questions.map((items, index) => (
                          <Draggable
                            key={items.id + '-' + index}
                            draggableId={items.id + '-' + index}
                            index={index}
                          >
                            {(provider, snapshot) => (
                              <tr
                                className="h-full w-full"
                                index={index}
                                key={items.id}
                                {...provider.draggableProps}
                                ref={provider.innerRef}
                                style={{
                                  ...provider.draggableProps.style,
                                  backgroundColor:
                                    snapshot.isDragging || items.id === selected
                                      ? 'rgba(255, 255, 239, 0.767)'
                                      : '',
                                }}
                              >
                                <td
                                  className="h-full align-top border-slate-500 border w-1/2"
                                  {...provider.dragHandleProps}
                                >
                                  <div className="px-3 py-5 flex flex-row">
                                    <div className="inline-flex w-12">
                                      <MdDragIndicator
                                        className="text-2xl"
                                        // onClick={() =>
                                        //  handleChageBackground(item.id)
                                        //}
                                      />
                                      <input
                                        type="checkbox"
                                        className="cursor-pointer mr-1 mt-1"
                                        checked={selectedItems.includes(
                                          items.id
                                        )}
                                        onChange={() =>
                                          handleSelectItem(items.id)
                                        }
                                        value={items.id}
                                        disabled={true}
                                      />
                                    </div>
                                    <div className="w-full flex-auto">
                                      <p>
                                        {' '}
                                        {index + 1}. {items.question}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="h-full align-top border-slate-500 border w-1/2">
                                  <div className="px-3 py-5 ">
                                    {items.answer === '' ||
                                    items.answer === null ? (
                                      <p>No Information</p>
                                    ) : (
                                      <p>{items.answer}</p>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Draggable>
                        ))}
                      </>
                    )}
                  </tbody>
                )}
              </Droppable>
            </table>
          </DragDropContext>
        </div>
        {showQuestionBox ? (
          <div className=" w-full -mt-10 h-40">
            <div className="flex-1 bg-white ">
              <textarea
                className="w-1/2 h-40 border-2 border-slate-700 resize-none text-gray-700"
                rows="6"
                placeholder="Submit request for information."
                onBlur={() => setshowQuestionBox(false)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                onChange={(e) => setQDetails(e)}
              ></textarea>
            </div>
          </div>
        ) : (
          <div className=" w-full -mt-10 h-32">
            <div className="flex-1 bg-white">
              <button
                className="bg-blue-400 text-white hover:bg-white hover:text-blue-400 border-2 hover:border-blue-400 text-2xl p-1 px-3 rounded-full inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mx-2"
                onClick={() => setshowQuestionBox(true)}
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      {showToast && (
        <ToastNotification title={resultMessage} hideToast={hideToast} />
      )}
      {showSessionTimeout && <SessionTimeout />}
    </>
  );
}
