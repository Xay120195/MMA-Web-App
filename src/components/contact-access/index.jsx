import React, { useState } from "react";
import ToastNotification from "../toast-notification";
import '../../assets/styles/ContactAccess.css'
import { pages, features } from './data-source'
import { Info } from './info'
import {Switch} from './switch'
import {PageList} from './page-list'

const tableHeaders = ["Owner", "Legal Admin", "Barrister", "Expert", "Client"];


const UserAccess =(props) => {

  const title = "All changes has been saved!";

  const [showToast, setShowToast] = useState(false);
  const [pageAccess, setpageAccess] = useState(1);
  const [pageAccessSwitch, setpageAccessSwitch] = useState(pages.filter(page => parseInt(page.id) === 1));
  const [featureAccessSwitch, setfeatureAccessSwitch] = useState(features);
  const hideToast = () => {
    setShowToast(false);
  }
  const switchChanged = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 1000);
  }

  const handlePageChange = (page_id) => {
    setpageAccess(page_id);
    setpageAccessSwitch(pages.filter(page => parseInt(page.id) === parseInt(page_id)));
    
    parseInt(page_id) === 1 ? 
      setfeatureAccessSwitch(features) : 
      setfeatureAccessSwitch(features.filter(feature => parseInt(feature.page_id) === parseInt(page_id)));
  }

  // useEffect(() => {
  //   console.log(`Selected Page ID: ${pageAccess}`);
  //   console.log(`Selected Page Access:`, pageAccessSwitch);
  //   console.log(`Selected Feature Access:`, featureAccessSwitch);
  // }, [pageAccess, pageAccessSwitch, featureAccessSwitch]);

  return (
    <>
      {showToast && <ToastNotification title={title} hideToast={hideToast}/>}
      <div className="p-5 main-content-div">
        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <Info 
                title="Page Restriction" 
                message="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla maximus fringilla tellus eget dapibus. Maecenas id leo sit amet lacus eleifend eleifend et in diam. Vivamus sed pellentesque nunc, sit amet ultricies arcu. Suspendisse a vestibulum libero. Curabitur sed convallis lorem, nec volutpat massa." 
              />
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 border-separate">
                  <thead>
                    <tr>
                      <th scope="col" className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        <span className="sr-only">Page/Feature Name</span>
                      </th>
                      {tableHeaders.map((header, index) => (
                        <th key={index} scope="col" className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    
                    <tr>
                      <td colSpan="6" className="border-t-2 border-b-2 p-3 m-3">
                        <div className="uppercase whitespace-nowrap text-sm text-gray-700 font-semibold text-center">
                          Page Restriction
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <PageList pages={pages} onPageSelect={handlePageChange} />
                      </td>
                        {
                          pageAccessSwitch.map((page) => (
                            page.access.map((access, index)=> (
                            <td key={index} index={index} className="px-6 py-4 whitespace-nowrap w-44  place-items-center">
                            <Switch access={access} row_index={index} switchChanged={switchChanged} />
                            </td>
                            ))
                          ))
                        }
                    </tr>

                    <tr>
                      <td colSpan="6" className="border-t-2 border-b-2 p-3 m-3">
                        <div className="uppercase whitespace-nowrap text-sm text-gray-700 font-semibold text-center">
                          Feature Restriction
                        </div>
                      </td>
                    </tr>

                    {
                      featureAccessSwitch.map((feature, index) => (
                        <React.Fragment key={index}>
                          <tr key={`${feature.id}_${index}`}>
                            <td colSpan="6" className="px-6 py-4 whitespace-nowrap">
                              {feature.title}
                            </td>
                          </tr>
                          
                          {
                          feature.data.map((data, index)=> (
                            <tr key={`${data.id}_${index}`}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.name}</td>
                              {
                                data.access.map((access, index)=> (
                                  <td key={`${access.id}_${index}`} className="px-6 py-4 whitespace-nowrap w-44  place-items-center">
                                    <Switch access={access} row_index={index} switchChanged={switchChanged}/>
                                  </td>
                                ))
                              }
                            </tr>
                          ))
                          }
                        </React.Fragment>
                      ))
                    }
                  
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserAccess;
