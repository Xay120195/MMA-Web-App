import { useEffect, useState } from "react";
import { API, Storage } from "aws-amplify";
import config from "../../aws-exports";
import html2pdf from "html2pdf.js";

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
  emailIntegration,
}) => {

  Storage.configure({
    region: config.aws_user_files_s3_bucket_region,
    bucket: config.aws_user_gmail_attachments_s3_bucket,
    identityPoolId: config.aws_user_pools_id,
  });

  const companyId = localStorage.getItem("companyId");

  const mSaveUnsavedEmails = `
  mutation saveGmailMessage($companyId: ID, $id: ID, $isSaved: Boolean) {
    gmailMessageSave(companyId: $companyId, id: $id, isSaved: $isSaved) {
      id
    }
  }`;

  const mSaveAttachmentEmailsToMatter = `
  mutation createMatterFile($matterId: ID, $s3ObjectKey: String, $size: Int, $type: String, $name: String, $order: Int, $isGmailAttachment: Boolean, $isGmailPDF: Boolean, $gmailMessageId: String, $date: AWSDateTime, $details: String) {
    matterFileCreate(
      matterId: $matterId
      s3ObjectKey: $s3ObjectKey
      size: $size
      type: $type
      name: $name
      order: $order
      isGmailAttachment: $isGmailAttachment
      isGmailPDF: $isGmailPDF
      gmailMessageId: $gmailMessageId
      details: $details
      date: $date
    ) {
      id
      name
      order
    }
  }`;

  const qGmailMessagesbyCompany = `
  query gmailMessagesByCompany($id: String, $isDeleted: Boolean = false, $isSaved: Boolean, $limit: Int, $nextToken: String, $recipient: String) {
    company(id: $id) {
      gmailMessages(
        isDeleted: $isDeleted
        isSaved: $isSaved
        limit: $limit
        nextToken: $nextToken
        recipient: $recipient
      ) {
        items {
          id
          from
          to
          subject
          date
          snippet
          payload
          description
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

  const mCreateMatterFile = `
      mutation createMatterFile ($matterId: ID, $s3ObjectKey: String, $size: Int, $type: String, $name: String, $order: Int, $isGmailPDF: Boolean, $isGmailAttachment: Boolean, $gmailMessageId: String, $details: String) {
        matterFileCreate(matterId: $matterId, s3ObjectKey: $s3ObjectKey, size: $size, type: $type, name: $name, order: $order, isGmailPDF: $isGmailPDF, isGmailAttachment: $isGmailAttachment, gmailMessageId: $gmailMessageId, details: $details) {
          id
          name
          order
        }
      }
  `;

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
          recipient: emailIntegration,
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

          handleUploadGmailEmail(item.id, item.description, item.subject, clientMatterId);

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
                isGmailPDF: false,
                gmailMessageId: item.id,
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

  const handleUploadGmailEmail = (gmailMessageId, description, fileName, matterId) => {
    var opt = {
      margin:       0.5,
      filename:     fileName,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, logging: true, dpi: 192, letterRendering: true  },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    var content = document.getElementById("preview_"+gmailMessageId);
    html2pdf().from(content).set(opt).toPdf().output('datauristring').then(function (pdfAsString) {
      const preBlob = dataURItoBlob(pdfAsString);
      const file = new File([preBlob], fileName, {type: 'application/pdf'});

      var key = `${gmailMessageId}/${Number(new Date())}${file.name
        .replaceAll(/\s/g, "")
        .replaceAll(/[^a-zA-Z.0-9]+|\.(?=.*\.)/g, "")}`,
        type="application/pdf",
        size=file.size;

      // put objects to s3
      try {
        Storage.put(key, file, {
          contentType: type,
          progressCallback(progress) {
            console.log(progress);
          },
          errorCallback: (err) => {
            console.error("204: Unexpected error while uploading", err);
          },
          
        })
          .then((fd) => {

            // insert to file bucket
            const params = {
              query: mCreateMatterFile,
              variables: {
                matterId: matterId,
                s3ObjectKey: fd.key,
                size: parseInt(size),
                name: file.name,
                type: type,
                order: 0,
                isGmailPDF: true,
                isGmailAttachment: true,
                gmailMessageId: gmailMessageId,
                details: description,
              },
            };
        
            API.graphql(params).then((result) => {
              console.log(result);
            });

          })
          .catch((err) => {
            console.error("220: Unexpected error while uploading", err);

          });
              
      } catch (e) {
        const response = {
          error: e.message,
          errorStack: e.stack,
          statusCode: 500,
        };
        console.error("228: Unexpected error while uploading", response);
      }
    });
  };

  function dataURItoBlob(dataURI) {
      // convert base64/URLEncoded data
      var byteString;
      if (dataURI.split(',')[0].indexOf('base64') >= 0)
          byteString = atob(dataURI.split(',')[1]);
      else
          byteString = unescape(dataURI.split(',')[1]);

      // separate out the mime component
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

      // write the bytes of the string to a typed array
      var ia = new Uint8Array(byteString.length);
      for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ia], {type:mimeString});
  }

  return (
    <>
      <div className="grid grid-rows grid-flow-col pt-5" style={{ position: "sticky", top: "20px" }} >
        <div className="col-span-6 " >
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
