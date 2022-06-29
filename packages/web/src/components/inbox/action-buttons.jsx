import { useEffect, useState } from "react";
import { API } from "aws-amplify";

const ActionButtons = ({
  selectedUnsavedItems,
  selectedSavedItems,
  setSelectedUnsavedItems,
  setSelectedSavedItems,
  openTab,
  getUnSavedEmails,
  getSavedEmails,
  unSavedEmails,
  savedEmails,
  setShowToast,
  setResultMessage,
}) => {

  const companyId = localStorage.getItem("companyId");

  const mSaveUnsavedEmails = `
  mutation saveGmailMessage($companyId: ID, $id: ID, $isSaved: Boolean) {
    gmailMessageSave(companyId: $companyId, id: $id, isSaved: $isSaved) {
      id
    }
  }`;

  const mSaveAttachmentEmailsToMatter = `
  mutation createMatterFile($matterId: ID, $s3ObjectKey: String, $size: Int, $type: String, $name: String, $order: Int, $isGmailAttachment: Boolean, $date: AWSDateTime, $details: String) {
    matterFileCreate(
      matterId: $matterId
      s3ObjectKey: $s3ObjectKey
      size: $size
      type: $type
      name: $name
      order: $order
      isGmailAttachment: $isGmailAttachment
      details: $details
      date: $date
    ) {
      id
      name
      order
    }
  }`;

  const qGmailMessagesbyCompany = `
  query gmailMessagesByCompany($id: String, $isDeleted: Boolean = false, $isSaved: Boolean, $limit: Int, $nextToken: String) {
    company(id: $id) {
      gmailMessages(
        isDeleted: $isDeleted
        isSaved: $isSaved
        limit: $limit
        nextToken: $nextToken
      ) {
        items {
          id
          from
          to
          subject
          date
          snippet
          payload
          clientMatters {
            items {
              id
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
          attachments {
            items {
              id
              details
              name
              s3ObjectKey
              size
              type
            }
          }
        }
        nextToken
      }
    }
  }`;

  const handleEmails = async (status) => {
    // Soon will change this to bulk mutation 
    if(status) {
      var clientMatterId = "";
      var emailList = "";

      const params = {
        query: qGmailMessagesbyCompany,
        variables: {
          id: companyId,
          isSaved: false,
          limit: 50,
          nextToken: null,
        },
      };
  
      await API.graphql(params).then((result) => {
        emailList = result.data.company.gmailMessages.items;
      });

      selectedUnsavedItems.map((obj) => {
        const filteredUnsavedArr = emailList.filter(item => item.id === obj);
        filteredUnsavedArr.map((item) => {
          item.clientMatters.items.map(clientMatters => {
            clientMatterId = clientMatters.id;
          });

          item.attachments.items.map(attachment => {
            const request = API.graphql({
              query: mSaveAttachmentEmailsToMatter,
              variables: {
                matterId: clientMatterId,
                s3ObjectKey: attachment.s3ObjectKey,
                size: attachment.size,
                name: attachment.name,
                type: attachment.type,
                order: 0,
                isGmailAttachment: true,
                details: attachment.details,
              },
            });
            
          });
        });

        const request = API.graphql({
          query: mSaveUnsavedEmails,
          variables: {
            companyId: companyId,
            id: obj,
            isSaved: status
          },
        });
      });

        setResultMessage("Successfully saved an email.");
        setShowToast(true);
        setTimeout(() => {
          getUnSavedEmails();
          getSavedEmails();
          setSelectedUnsavedItems([]);
        }, 2000);
      
    } else {
      selectedSavedItems.map((obj) => {
        const request = API.graphql({
          query: mSaveUnsavedEmails,
          variables: {
            companyId: companyId,
            id: obj,
            isSaved: status
          },
        });
      });
      setResultMessage("Successfully saved an email.");
      setShowToast(true);
      setTimeout(() => {
        getSavedEmails();
        getUnSavedEmails();
        setSelectedUnsavedItems([]);
      }, 2000);
    }
  };

  const handleCheckAllChange = (e) => {
    if (e.target.checked) {
      //setSelectedItems(e.target.id);
    } else {
      //setSelectedItems([]);
    }
  };

  return (
    <>
      <div className="grid grid-rows grid-flow-col pt-5">
        <div className="col-span-6 ">
          {/* <input
            name="check_all"
            id="check_all"
            aria-describedby="checkbox-1"
            onChange={(e) => handleCheckAllChange(e.target.checked)}
            type="checkbox"
            className="w-4 h-4 text-cyan-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />*/ }
          {selectedUnsavedItems.length !== 0 && openTab === 1 ? (
            <>
              <button
                type="button"
                onClick={() => handleEmails(true)}
                className={"bg-green-400 hover:bg-green-500 text-white text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mx-4"}
                disabled={false} 
              >
                Save Emails
              </button>
            </>
          ) : (
            <>
            </>
          )}

          {selectedSavedItems.length !== 0 && openTab === 2 ? (
            <>
              <button
                type="button"
                onClick={() => handleEmails(false)}
                className="bg-green-400 hover:bg-green-500 text-white text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring mx-4"
              >
                Unsave Emails
              </button>
            </>
          ) : (<></>)}
        </div>

        <div className=" col-span-1 pt-2">
          
        </div>
      </div>
    </>
  );
};

export default ActionButtons;
