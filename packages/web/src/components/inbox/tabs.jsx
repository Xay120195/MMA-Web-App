import React from "react";

const TabsRender = ({ color, setOpenTab, openTab }) => {
  return (
    <>
      <div className="pl-3 pr-3 pt-3 bg-gray-100 mt-4">
        <div className="flex justify-between">
          <ul
            className="flex gap-x-3"
            role="tablist"
          >
            <li className={"flex gap-x-2  items-center py-3 px-6 cursor-pointer " +
                  (openTab === 1
                    ? "bg-white rounded-tl-xl clip_path"
                    : "")
            } >
              <a
                className={
                  "text-xs font-bold uppercase "
                }
                onClick={e => {
                  e.preventDefault();
                  setOpenTab(1);
                }}
                data-toggle="tab"
                href="#link1"
                role="tablist"
              >
                Unsaved Emails
              </a>
            </li>
            <li className={"flex gap-x-2  items-center py-3 px-6 cursor-pointer " +
                  (openTab === 2
                    ? "bg-white rounded-tl-xl clip_path"
                    : "")
            } >
              <a
                className={
                  "text-xs font-bold uppercase"
                }
                onClick={e => {
                  e.preventDefault();
                  setOpenTab(2);
                }}
                data-toggle="tab"
                href="#link2"
                role="tablist"
              >
                 Saved Emails
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default TabsRender;