import React from "react";

const TabsRender = ({ setOpenTab, openTab, savedEmails, unSavedEmails }) => {
  return (
    <>
      <div className="pl-3 pr-3 pt-3 bg-gray-100 mt-4 z-50" style={{ position: "sticky", top: "0px" }} >
        <div className="flex justify-between">
          <ul
            className="flex gap-x-3"
            role="tablist"
          >
            <li className={"flex gap-x-2  items-center py-3 px-6 cursor-pointer " +
                  (openTab === 1
                    ? "bg-white rounded-tl-xl clip_path"
                    : "")
            } 
            onClick={e => {
              e.preventDefault();
              setOpenTab(1);
            }}
            >
              <span
                className={
                  "text-xs font-bold uppercase "
                }
                data-toggle="tab"
                href="#unsaved"
                role="tablist"
              >
                Unsaved Emails <span class="rounded-2xl border-2 px-3 py-0 bg-gray-50 mr-3">{unSavedEmails.length}</span>
              </span>
            </li>
            <li className={"flex gap-x-2  items-center py-3 px-6 cursor-pointer " +
                  (openTab === 2
                    ? "bg-white rounded-tl-xl clip_path"
                    : "")
            } 
            onClick={e => {
              e.preventDefault();
              setOpenTab(2);
            }}
            >
              <span
                className={
                  "text-xs font-bold uppercase"
                }
                data-toggle="tab"
                href="#saved"
                role="tablist"
              >
                 Saved Emails <span class="rounded-2xl border-2 px-3 py-0 bg-gray-50 mr-3">{savedEmails.length}</span>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default TabsRender;