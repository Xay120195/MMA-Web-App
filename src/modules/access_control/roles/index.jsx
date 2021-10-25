import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import Select from "react-select";
import * as queries from "../../../graphql/queries";
import * as mutations from "../../../graphql/mutations";

const listOperationsQuery = `
query ListOperations {
  __schema{
   queryType{
     fields{
       name
     }
   }
   mutationType{
     fields{
       name
     }
   }
 }
}
`

const Role = ({ name, id, initialPermissions = [], allOperations }) => {
  console.log({initialPermissions})

  const PERMISSION_LIST = allOperations.map( p => ({label: p, value: p})) 
  console.log("ALL OPS", PERMISSION_LIST)
  const [fields, setFields] = useState(
    JSON.parse(initialPermissions)?.map((p) => ({ label: p, value: p }))
  );

  async function updateAcl(id, newFields) {
    try {
      const res = await API.graphql({
        query: mutations.updateAcl,
        variables: {
          input: {
            id,
            fields: JSON.stringify(newFields),
          },
        },
      });
      console.log(res);
    } catch {}
  }

  const postFields = (id, newFields) => {
    setFields(newFields);
    updateAcl(
      id,
      newFields.map((p) => p.value)
    );
  };

  return (
    <div className="flex m-2 p-2 border-b">
      <h2 className="font-semibold">{name}</h2>
      <div className="w-2/3 ml-auto">
        <Select
          isMulti
          value={fields}
          options={PERMISSION_LIST}
          onChange={(newFields) => postFields(id, newFields)}
        />
      </div>
    </div>
  );
};


const Roles = (props) => {
  console.log("role props", props)
  const [acl, setAcl] = useState([]);
  const [operationList, setOperationList] = useState([])
  const [isLoading, setIsLoading] = useState(true);

  async function fetchCompanyAcl () {
    try{
    const res = await API.graphql({
      query: queries.getCompany,
      variables: {
        id: props.company.id
      }
    });
    console.log('res',res.data.getCompany.acls.items)
    setAcl(res.data.getCompany.acls.items);
    setIsLoading(false);
  } 
  catch(err){
  console.log("err", err)
    // alert(err.errors[0].message)
    }
  }

  //fetch gql operations
  async function fetchOperationList () {
    try{
    const res = await API.graphql({
      query: listOperationsQuery,
    });
    const queryOps = res.data.__schema.queryType.fields.map(({name}) => `Query.${name}`)
    const mutationOps = res.data.__schema.mutationType.fields.map(({name}) => `Mutation.${name}`)  
    console.log('query operation',queryOps)
    console.log('mutation operation',mutationOps)

    setOperationList([...queryOps, ...mutationOps]);
    setIsLoading(false);
  } 
  catch(err){
  console.log("err", err)
    // alert(err.errors[0].message)
    }
  }

  useEffect(() => {
    setIsLoading(true);
    fetchOperationList()
    fetchCompanyAcl();
  }, []);

  if(isLoading){
    return null
  }

  return (
    <div className="flex flex-col">
      <h1 className="text-3xl font-bold text-red-400 self-center p-4">
        Manage Selected Role
      </h1>
      <div className="flex flex-col max-w-4xl">
        {acl.map(({ name,id, fields }) => (
          <Role key={id} id={id} name={name} initialPermissions={fields} allOperations={operationList} />
        ))}
      </div>
    </div>
  );
};

export default Roles;
