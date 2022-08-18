import {
  MATTER_REQUEST,
  MATTER_SUCCESS,
  MATTER_ERROR,
  SEARCH_MATTER_REQUEST,
  SEARCH_MATTER_SUCCESS,
  SEARCH_MATTER_ERROR,
  CREATE_MATTER_REQUEST,
  CREATE_MATTER_SUCCESS,
  CREATE_MATTER_ERROR,
  DELETE_MATTER_REQUEST,
  DELETE_MATTER_SUCCESS,
  DELETE_MATTER_ERROR
} from "./constants";
import { API } from "aws-amplify";

const qUserClientMatterAccess = `query getUserClientMatters($id: String) {
  user(id: $id) {
    clientMatterAccess {
      items {
        id
        userType
        clientMatter {
          id
          client {
            id
            name
          }
          matter {
            id
            name
          }
        }
      }
    }
  }
}`;

const listClientMatters = `
query listClientMatters($companyId: String) {
  company(id: $companyId) {
    clientMatters (sortOrder: CREATED_DESC) {
      items {
        id
        createdAt
        client {
          id
          name
        }
        matter {
          id
          name
        }
      }
    }
  }
}
`;

const createClientMatter = `
  mutation createClientMatter($companyId: String, $userId: ID, $client: ClientInput, $matter:MatterInput) {
    clientMatterCreate(companyId: $companyId, userId:$userId, client: $client, matter:$matter) {
      id
    }
}
`;

const deleteClientMatter = `
  mutation deleteClientMatter($id: ID) {
    clientMatterDelete(id: $id) {
      id
    }
}
`;

//fetch user client matter access
export const getUserClientMatterAccess = async () => {
  const userClientMatterAccess = await API.graphql({
    query: qUserClientMatterAccess,
    variables: {
      id: localStorage.getItem("userId")
    }
  });

  const clientMatterIds = userClientMatterAccess.data.user.clientMatterAccess.items.map(
    (i) => i.clientMatter.id
  );

  return clientMatterIds;
};

//fetch client matters
export const getMatterList = async (dispatch, companyId) => {
  try {
    dispatch({
      type: MATTER_REQUEST,
      payload: { loading: true }
    });

    let result = [];

    const clientMattersOpt = await API.graphql({
      query: listClientMatters,
      variables: {
        companyId: companyId
      }
    });

    if (clientMattersOpt.data.company.clientMatters.items !== null) {
      result = clientMattersOpt.data.company.clientMatters.items;

      const userClientMatterAccess = await getUserClientMatterAccess().catch((e) => {
        console.log(e.errors[0].message);
      });

      // result = result
      //   .map((item) => {
      //     const filterLabel = userClientMatterAccess.find((u) => u === item.id);

      //     if (filterLabel !== undefined) {
      //       return item;
      //     }
      //   })
      //   .filter((a) => a !== undefined);

      const dummyPersonResponsible = {
        id: localStorage.getItem("userId"),
        name: localStorage.getItem("firstName") + " " + localStorage.getItem("lastName"),
        email: localStorage.getItem("email"),
        profile_picture:
          "https://as1.ftcdn.net/v2/jpg/03/64/62/36/1000_F_364623643_58jOINqUIeYmkrH7go1smPaiYujiyqit.jpg?auto=compress&cs=tinysrgb&h=650&w=940"
      };

      var filtered = result.filter(function (el) {
        return el.client != null;
      });

      var apdPr = filtered.map((v) => ({
        ...v,
        substantially_responsible: dummyPersonResponsible
      }));
      var apdMn = apdPr.map((v) => ({
        ...v,
        matter_number: `{${v.matter.name.charAt(2)}-${v.matter.id.slice(-4)}/${v.client.id.slice(
          -4
        )}}`
      }));
    }
    //dispatch data to reducers

    dispatch({
      type: MATTER_SUCCESS,
      payload: { matterlist: apdMn ? apdMn : [] }
    });
  } catch (error) {
    dispatch({
      type: MATTER_ERROR,
      payload: error
    });
  }
};

//create new client matters
export const addClientMatter = async (client, matter, companyId, userId, dispatch) => {
  try {
    dispatch({
      type: CREATE_MATTER_REQUEST,
      payload: { loading: true }
    });
    console.log(client);

    await API.graphql({
      query: createClientMatter,
      variables: {
        companyId: companyId,
        userId: userId,
        client: client,
        matter: matter
      }
    });

    let result = [];

    const clientMattersOpt = await API.graphql({
      query: listClientMatters,
      variables: {
        companyId: companyId
      }
    });

    if (clientMattersOpt.data.company.clientMatters.items !== null) {
      result = clientMattersOpt.data.company.clientMatters.items;

      const dummyPersonResponsible = {
        id: 2,
        name: "Adrian Silva",
        email: "adrian.silva@lophils.com",
        profile_picture:
          "https://as1.ftcdn.net/v2/jpg/03/64/62/36/1000_F_364623643_58jOINqUIeYmkrH7go1smPaiYujiyqit.jpg?auto=compress&cs=tinysrgb&h=650&w=940"
      };

      var filtered = result.filter(function (el) {
        return el.client != null;
      });

      var apdPr = filtered.map((v) => ({
        ...v,
        substantially_responsible: dummyPersonResponsible
      }));
      var apdMn = apdPr.map((v) => ({
        ...v,
        matter_number: `{${v.matter.name.charAt(2)}-${v.matter.id.slice(-4)}/${v.client.id.slice(
          -4
        )}}`
      }));
    }
    //dispatch data to reducers
    dispatch({
      type: CREATE_MATTER_SUCCESS,
      payload: {
        matterlist: apdMn,
        message: `Successfully created Client ${client.name} and Matter ${matter.name}`
      }
    });
  } catch (error) {
    dispatch({
      type: CREATE_MATTER_ERROR,
      payload: error
    });
  }
};

//delete client and matter
export const deleteMatterClient = async (selectedClientMatter, dispatch, companyId) => {
  try {
    dispatch({
      type: DELETE_MATTER_REQUEST,
      payload: { loading: true }
    });

    if (selectedClientMatter !== null && selectedClientMatter !== undefined) {
      await API.graphql({
        query: deleteClientMatter,
        variables: {
          id: selectedClientMatter
        }
      });
    }

    let result = [];

    const clientMattersOpt = await API.graphql({
      query: listClientMatters,
      variables: {
        companyId: companyId
      }
    });

    if (clientMattersOpt.data.company.clientMatters.items !== null) {
      result = clientMattersOpt.data.company.clientMatters.items;

      const dummyPersonResponsible = {
        id: 2,
        name: "Adrian Silva",
        email: "adrian.silva@lophils.com",
        profile_picture:
          "https://as1.ftcdn.net/v2/jpg/03/64/62/36/1000_F_364623643_58jOINqUIeYmkrH7go1smPaiYujiyqit.jpg?auto=compress&cs=tinysrgb&h=650&w=940"
      };

      var filtered = result.filter(function (el) {
        return el.client != null;
      });

      var apdPr = filtered.map((v) => ({
        ...v,
        substantially_responsible: dummyPersonResponsible
      }));
      var apdMn = apdPr.map((v) => ({
        ...v,
        matter_number: `{${v.matter.name.charAt(2)}-${v.matter.id.slice(-4)}/${v.client.id.slice(
          -4
        )}}`
      }));
    }
    //dispatch data to reducers
    dispatch({
      type: DELETE_MATTER_SUCCESS,
      payload: {
        matterlist: apdMn ? apdMn : [],
        message: `Successfully deleted`
      }
    });
  } catch (error) {
    dispatch({
      type: DELETE_MATTER_ERROR,
      payload: error
    });
  }
};

//search client matter
export const searchMatterClient = async (companyId, searchMatter, dispatch) => {
  try {
    dispatch({
      type: SEARCH_MATTER_REQUEST,
      payload: { loading: true }
    });

    let result = [];

    const clientMattersOpt = await API.graphql({
      query: listClientMatters,
      variables: {
        companyId: companyId
      }
    });

    if (clientMattersOpt.data.company.clientMatters.items !== null) {
      result = clientMattersOpt.data.company.clientMatters.items;

      const dummyPersonResponsible = {
        id: 2,
        name: "Adrian Silva",
        email: "adrian.silva@lophils.com",
        profile_picture:
          "https://as1.ftcdn.net/v2/jpg/03/64/62/36/1000_F_364623643_58jOINqUIeYmkrH7go1smPaiYujiyqit.jpg?auto=compress&cs=tinysrgb&h=650&w=940"
      };

      var filtered = result.filter(function (el) {
        return el.client != null;
      });

      var apdPr = filtered.map((v) => ({
        ...v,
        substantially_responsible: dummyPersonResponsible
      }));
      var apdMn = apdPr.map((v) => ({
        ...v,
        matter_number: `{${v.matter.name.charAt(2)}-${v.matter.id.slice(-4)}/${v.client.id.slice(
          -4
        )}}`
      }));
    }

    const matterslists = apdMn.filter(
      (x) =>
        x.matter.name.toUpperCase().includes(searchMatter.toUpperCase()) ||
        x.client.name.toUpperCase().includes(searchMatter.toUpperCase())
    );

    dispatch({
      type: SEARCH_MATTER_SUCCESS,
      payload: {
        matterlist: matterslists
      }
    });

    //dispatch data to reducers
  } catch (error) {
    dispatch({
      type: SEARCH_MATTER_ERROR,
      payload: error
    });
  }
};
