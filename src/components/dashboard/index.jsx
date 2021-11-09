import React, { useState, useEffect }  from 'react';
import * as IoIcons from 'react-icons/io';
import Navbar from '../navigation';
import imgDocs from '../../assets/images/docs.svg';
import {Welcome} from './welcome'
import {matters} from './matters-data-source'
import { MattersList } from './matters-list'
import { Auth } from "aws-amplify";

export default function Dashboard() {
    const [userInfo, setuserInfo] = useState(null);

    useEffect(() => {
      let getUser = async() => {
        try {
          let user = await Auth.currentAuthenticatedUser();
          await setuserInfo(user);
        } catch (error) {
          console.log(error)
        }
      }
      getUser();
    },[]);

    return userInfo ? (
      <>
      <Navbar />
        <div className="p-5 font-sans">
            <div className="relative bg-gray-100 px-12 py-8 sm:px-12 sm:py-8 rounded-sm overflow-hidden mb-8">

                <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-3">
                        
                        <Welcome user={userInfo} matters={matters} />
                        <p className="text-gray-400 text-sm" >To start adding, type in the name and click the add button below.</p>
                        <div className="grid grid-flow-col grid-cols-3">
                            <div className="pr-2" >
                                <div className="relative flex w-full flex-wrap items-stretch mt-3 pt-5">
                                <span className="z-10 h-full leading-snug font-normal text-center text-blueGray-300 absolute left-3 bg-transparent rounded text-base items-center justify-center w-8 py-3">
                                    <IoIcons.IoIosFolder/>
                                </span>
                                <input type="text" placeholder="Matter" className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full pl-10"/>
                                </div>
                            </div>
                            <div className="pr-2" >
                                <div className="relative flex w-full flex-wrap items-stretch mt-3 pt-5">
                                <span className="z-10 h-full leading-snug font-normal text-center text-blueGray-300 absolute left-3 bg-transparent rounded text-base items-center justify-center w-8 py-3">
                                    <IoIcons.IoIosPerson/>
                                </span>
                                <input type="text" placeholder="Client" className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full pl-10"/>
                                </div>
                            </div>
                            <div className="pr-2" >
                                <div className="relative flex w-full flex-wrap items-stretch mt-3 pt-5">
                                <button className="bg-gray-600 hover:bg-gray-500 text-gray-50 font-bold py-2.5 px-4 rounded items-center">+</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-3/5 place-self-end">
                        <img src={imgDocs} alt="rightside-illustration" />
                    </div>
                </div>
            </div>
            
            <div className="pr-2" >
                <div className="relative flex w-full flex-wrap items-stretch mb-3 py-5">
                <span className="z-10 h-full leading-snug font-normal text-center text-blueGray-300 absolute bg-transparent rounded text-base items-center justify-center w-8 py-3">
                    <IoIcons.IoIosSearch/>
                </span>
                <input type="text" placeholder="Type your question or search for keywords..." className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full pl-10"/>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                { matters.map((matter, index) => 
                    <MattersList key={index} index={index} matter={matter} view={'grid'} />
                )}
            </div>

            <div className="grid grid-flow-row auto-rows-max">
                { matters.map((matter, index) => 
                    <MattersList key={index} index={index} matter={matter} view={'list'} />
                )}
            </div>
        </div>
      </>
    ):(
        <p>Please wait ...</p>
    );
  }

