import React, { useEffect, useState, Fragment  } from "react";

const dummyData = [
    {
      id: 0,
      labelName: "Test1",
      conversations: [
        { id: 111, subject: "Test message", from: "kmfrias@up.edu.ph" }, 
        { id: 222, subject: "Test message", from: "kmfrias@up.edu.ph" },
      ]
    },
    {
      id: 1,
      labelName: "Test2",
      conversations: [
        { id: 333, subject: "Test message", from: "kmfrias@up.edu.ph" }, 
        { id: 222, subject: "Test message", from: "kmfrias@up.edu.ph" }, 
        { id: 111, subject: "Test message", from: "kmfrias@up.edu.ph" }
      ]
    },
    {
      id: 2,
      labelName: "Test3",
      conversations: [
        { id: 231, subject: "Test message", from: "kmfrias@up.edu.ph" }, 
        { id: 123, subject: "Test message", from: "kmfrias@up.edu.ph" }, 
        { id: 112, subject: "Test message", from: "kmfrias@up.edu.ph" },
        { id: 223, subject: "Test message", from: "kmfrias@up.edu.ph" },
        { id: 321, subject: "Test message", from: "kmfrias@up.edu.ph" }
      ]
    }
  ];


export default dummyData;