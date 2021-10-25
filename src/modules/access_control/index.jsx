import { Switch, Route, useRouteMatch, NavLink } from "react-router-dom";
import Users from "./users";
import Roles from "./roles";
import { API, Auth } from "aws-amplify";
import { useEffect, useState } from "react";

const getUserCompanyQuery = `
query getUser($id: ID!){
  getUser(id: $id){
    company{
      id
      name
    }
  }
}
`

const UserAccess = () => {
  const match = useRouteMatch();
  const [company, setCompany] = useState()


  async function fetchUserCompany(){
    let user = await Auth.currentUserPoolUser()
    console.log("he", {user})
    const res = await API.graphql({
      query: getUserCompanyQuery,
      variables: {
        id: user.attributes.sub
      }
    });
    setCompany(res.data.getUser.company)
    console.log("company", res)
  }

  useEffect(() => {
    fetchUserCompany()
  }, [])

  // if(!company){
  //   return null
  // }

  return (
    <div className="flex flex-col">
      <h1 className="text-3xl font-bold text-red-400 self-center p-4">
        Access Control
      </h1>
      {company?
      <h1 className="text-3xl m-2">
        {`${company.name} company`}
      </h1>
      : null
      } 
      <div className="flex gap-3 px-2 py-6  text-xl">
        <NavLink
          exact
          className="px-3 py-1 border-b-2 border-white"
          activeClassName="border-red-400"
          to={match.path}
        >
          Users
        </NavLink>
        <NavLink
          className="px-3 py-1 border-b-2 border-white"
          activeClassName="border-red-400"
          ac
          to={`${match.path}/roles`}
        >
          Roles
        </NavLink>
      </div>

      <Switch>
        {company?
        <>
        <Route exact path={match.path} render={() => (<Users company={company}/>)} />
        <Route path={`${match.path}/roles`} render={() => (<Roles company={company}/>)}/>
        </>:
         null
        }
      
      </Switch>
    </div>
  );
};

export default UserAccess;
