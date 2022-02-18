import React from "react";

export const Welcome = (props) => {
    return(
        <>
        <h3 className="font-semi-bold text-3xl">
            Welcome Back, <span className="font-bold text-3xl">{props.user.firstName }</span> 
        </h3>
        <p className="text-gray-400 text-sm mt-2">
            You have <span className="font-bold">{props.clientmatters.length}</span> Matters on your list.
        </p>
        </>
    )    
}
