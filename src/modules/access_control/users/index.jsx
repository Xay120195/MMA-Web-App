import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import Select from "react-select";
// import * as queries from "../../../graphql/queries";
import * as mutations from "../../../graphql/mutations";

const getCompanyUsers = `
query getCompanyUsers($id: ID!) {
  getCompany(id: $id){
    name
    users{
      items
      {
        id
        username
        acls {
          items{
            acl{
              id
              name
            }
            
          }
        }
      }
    }
    acls{
      items{
        id
        name
      }
    }
  }
}
`

const Users = (props) => {
  console.log("Props", props)
  const [users, setUsers] = useState([]);
  const [company, setCompany] = useState("");
  const [roleList, setRoleList] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  async function fetchCompany() {
    const res = await API.graphql({
      query: getCompanyUsers,
      variables: {
        id: props.company.id
      }
    });
    setCompany(res.data.getCompany.name)
    setUsers(res.data.getCompany.users.items);
    setRoleList(res.data.getCompany.acls.items)
    setIsLoading(false);
  }

  useEffect(() => {
    setIsLoading(true);
    fetchCompany();
  }, []);

  useEffect(() => {
    console.log("roles", roleList);
  }, [users, roleList]);

  if(isLoading){
    return null
  }

  return (
    <div className="flex flex-col">
      <h1 className="text-3xl font-bold text-red-400 self-center p-4">Users</h1>
      <div className="flex flex-col">
        <div className="flex flex-col max-w-4xl">
          {users.map((user) => (
            
            // <h1>{JSON.stringify(user)}</h1>
            <User
              key={user.id}
              name={user.username}
              initialRoles={user.acls.items}
              roleList={roleList}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const User = ({ name, initialRoles, roleList }) => {
  console.log({ initialRoles });
  const [roles, setRoles] = useState(
    initialRoles.map((l) => ({ label: l.acl.name, value: l.id }))
  );

  async function updateUser(username, newRoles) {
    console.log("mut", { username }, { newRoles });
    try {
      const res = await API.graphql({
        query: mutations.updateUser,
        variables: {
          input: {
            id: username,
            acl: newRoles,
          },
        },
      });
      console.log(res);
    } catch {}
  }

  const postUser = (username, newRoles) => {
    setRoles(newRoles);
    updateUser(
      username,
      newRoles.map((r) => r.value)
    );
  };
  return (
    <div className="flex m-2 p-2 border-b">
      <h2 className="font-semibold">{name}</h2>
      <div className="w-2/3 ml-auto">
        <Select
          isMulti
          value={roles}
          options={roleList.map((l) => ({ label: l.name, value: l.id }))}
          onChange={(newRoles) => postUser(name, newRoles)}
        />
      </div>
    </div>
  );
};

export default Users;
