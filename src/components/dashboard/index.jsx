import React, { Component } from "react";
import * as IoIcons from 'react-icons/io';
import Navbar from '../navigation';

export default function Dashboard() {
    return (
      <>
      <Navbar />
        <div className="p-5 font-sans">
            <div className="relative bg-gray-100 p-5 sm:p-6 rounded-sm overflow-hidden mb-8 " >
                <h3
                  className={
                    "font-semi-bold text-3xl"
                  }
                >
                  Welcome Back,<span className={"font-bold"}>Thomas</span> 
                </h3>
                <p className="text-gray-400 text-sm" >You have 2 Matters on your list.</p>
                <p className="text-gray-400 text-sm" >To start adding, type in the name and click the add button below.</p>
                <div className="grid grid-flow-col grid-cols-6">
                    <div className="pr-2" >
                        <div className="relative flex w-full flex-wrap items-stretch mb-3 py-5">
                        <span className="z-10 h-full leading-snug font-normal absolute text-center text-blueGray-300 absolute bg-transparent rounded text-base items-center justify-center w-8 py-3">
                            <IoIcons.IoIosFolder/>
                        </span>
                        <input type="text" placeholder="Matter" className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full pl-10"/>
                        </div>
                    </div>
                    <div className="pr-2" >
                        <div className="relative flex w-full flex-wrap items-stretch mb-3 py-5">
                        <span className="z-10 h-full leading-snug font-normal absolute text-center text-blueGray-300 absolute bg-transparent rounded text-base items-center justify-center w-8 py-3">
                            <IoIcons.IoIosPerson/>
                        </span>
                        <input type="text" placeholder="Client" className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full pl-10"/>
                        </div>
                    </div>
                    <div className="pr-2" >
                        <div className="relative flex w-full flex-wrap items-stretch mb-3 py-5">
                        <button className="bg-gray-600 hover:bg-gray-500 text-gray-50 font-bold py-2.5 px-4 rounded items-center">+</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="pr-2" >
                <div className="relative flex w-full flex-wrap items-stretch mb-3 py-5">
                <span className="z-10 h-full leading-snug font-normal absolute text-center text-blueGray-300 absolute bg-transparent rounded text-base items-center justify-center w-8 py-3">
                    <IoIcons.IoIosSearch/>
                </span>
                <input type="text" placeholder="Type your question or search for keywords..." className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full pl-10"/>
                </div>
            </div>

            <div className="grid grid-flow-col grid-cols-4">
                <div className="pr-10" >
                    
                    <div className="w-full h-42 flex bg-white dark:bg-gray-800 rounded-lg border border-gray-400 mb-6 py-5 px-4">
                        <div>
                            <h4 tabIndex="0" className="focus:outline-none text-gray-800 dark:text-gray-100 font-bold mb-3">Matter 2</h4>
                            <p tabIndex="0" className="focus:outline-none text-gray-800 dark:text-gray-100 text-sm">Lorem Ipsum</p>
                            <br/>
                            <div className="grid grid-flow-col grid-cols-4 auto-cols-auto">
                                
                                <div className="-space-x-4">
                                    <img className="relative z-30 inline object-cover w-8 h-8 border-2 border-white rounded-full" src="https://as2.ftcdn.net/v2/jpg/00/63/06/45/1000_F_63064599_c2YEM1vnauuB1eenrhrAhhaSNwUHx2vQ.jpg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Profile image"/>
                                    <img className="relative z-20 inline object-cover w-8 h-8 border-2 border-white rounded-full" src="https://as1.ftcdn.net/v2/jpg/00/53/01/86/1000_F_53018616_nxpsx4iXIGTMMkfCuusbrd0jIqupmhcP.jpg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Profile image"/>
                                    <img className="relative z-10 inline object-cover w-8 h-8 border-2 border-white rounded-full" src="https://as1.ftcdn.net/v2/jpg/03/64/62/36/1000_F_364623643_58jOINqUIeYmkrH7go1smPaiYujiyqit.jpg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Profile image"/>
                                </div>
                                <div></div>
                                <div></div>
                                <div>
                                    <p tabIndex="0" className="self-end focus:outline-none text-xs text-gray-400">2 Nov 2021</p>
                                </div>
                            </div>
                        </div>
                    </div>
                
                </div>
                <div className="pr-10" >
                    
                    <div className="w-full h-42 flex bg-white dark:bg-gray-800 rounded-lg border border-gray-400 mb-6 py-5 px-4">
                        <div>
                            <h4 tabIndex="0" className="focus:outline-none text-gray-800 dark:text-gray-100 font-bold mb-3">Matter 2</h4>
                            <p tabIndex="0" className="focus:outline-none text-gray-800 dark:text-gray-100 text-sm">Lorem Ipsum</p>
                            <br/>
                            <div className="grid grid-flow-col grid-cols-4 auto-cols-auto">
                                
                                <div className="-space-x-4">
                                    <img className="relative z-30 inline object-cover w-8 h-8 border-2 border-white rounded-full" src="https://as2.ftcdn.net/v2/jpg/00/63/06/45/1000_F_63064599_c2YEM1vnauuB1eenrhrAhhaSNwUHx2vQ.jpg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Profile image"/>
                                    <img className="relative z-20 inline object-cover w-8 h-8 border-2 border-white rounded-full" src="https://as1.ftcdn.net/v2/jpg/00/53/01/86/1000_F_53018616_nxpsx4iXIGTMMkfCuusbrd0jIqupmhcP.jpg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Profile image"/>
                                    <img className="relative z-10 inline object-cover w-8 h-8 border-2 border-white rounded-full" src="https://as1.ftcdn.net/v2/jpg/03/64/62/36/1000_F_364623643_58jOINqUIeYmkrH7go1smPaiYujiyqit.jpg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Profile image"/>
                                </div>
                                <div></div>
                                <div></div>
                                <div>
                                    <p tabIndex="0" className="self-end focus:outline-none text-xs text-gray-400">2 Nov 2021</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <div className="pr-2" >
                    
                </div>
                <div className="pr-2" >
                    
                </div>
            </div>
        </div>
      </>
    );
  }


