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
  DELETE_MATTER_ERROR,
} from "./constants";
import { API } from "aws-amplify";

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
  mutation createClientMatter($companyId: String, $client: ClientInput, $matter:MatterInput) {
    clientMatterCreate(companyId: $companyId, client: $client, matter:$matter) {
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

//fetch client matters
export const getMatterList = async (dispatch, companyId) => {
  try {
    dispatch({
      type: MATTER_REQUEST,
      payload: { loading: true },
    });

    let result = [];

    const clientMattersOpt = await API.graphql({
      query: listClientMatters,
      variables: {
        companyId: companyId,
      },
    });

    if (clientMattersOpt.data.company.clientMatters.items !== null) {
      result = clientMattersOpt.data.company.clientMatters.items;

    // Initialize filebucket/background orders
    
    //   const mInitMatterFileOrders = `
    //   mutation initializeOrder($clientMatterId: ID) {
    //     matterFileBulkInitializeOrders(clientMatterId: $clientMatterId) {
    //       id
    //     }
    //   }
    // `;

    //   const mInitBackgroundOrders = `
    //   mutation initializeOrder($clientMatterId: ID) {
    //     backgroundBulkInitializeOrders(clientMatterId: $clientMatterId) {
    //       id
    //     }
    //   }
    // `;

    //   let x = 0;

    //   result.map(async (i) => {
    //     x++;
    //     let matterId = i.id;

    //     if (x <= result.length) {
    //       await API.graphql({
    //         query: mInitMatterFileOrders,
    //         variables: { clientMatterId: matterId },
    //       }).then((res) => {
    //         console.log(matterId, "File Bucket: Initial Sorting Successful!");
    //         console.log(res);
    //       });

    //       await API.graphql({
    //         query: mInitBackgroundOrders,
    //         variables: { clientMatterId: matterId },
    //       }).then((res) => {
    //         console.log(matterId, "Background: Initial Sorting Successful!");
    //         console.log(res);
    //       });
    //     }
    //   });

      const dummyPersonResponsible = {
        id: localStorage.getItem("userId"),
        name:
          localStorage.getItem("firstName") +
          " " +
          localStorage.getItem("lastName"),
        email: localStorage.getItem("email"),
        profile_picture:
          "https://as1.ftcdn.net/v2/jpg/03/64/62/36/1000_F_364623643_58jOINqUIeYmkrH7go1smPaiYujiyqit.jpg?auto=compress&cs=tinysrgb&h=650&w=940",
      };

      var filtered = result.filter(function (el) {
        return el.client != null;
      });

      var apdPr = filtered.map((v) => ({
        ...v,
        substantially_responsible: dummyPersonResponsible,
      }));
      var apdMn = apdPr.map((v) => ({
        ...v,
        matter_number: `{${v.matter.name.charAt(2)}-${v.matter.id.slice(
          -4
        )}/${v.client.id.slice(-4)}}`,
      }));
    }
    //dispatch data to reducers

    dispatch({
      type: MATTER_SUCCESS,
      payload: { matterlist: apdMn ? apdMn : [] },
    });
  } catch (error) {
    dispatch({
      type: MATTER_ERROR,
      payload: error,
    });
  }
};

//create new client matters
export const addClientMatter = async (client, matter, companyId, dispatch) => {
  try {
    dispatch({
      type: CREATE_MATTER_REQUEST,
      payload: { loading: true },
    });
    console.log(client);

    await API.graphql({
      query: createClientMatter,
      variables: {
        companyId: companyId,
        client: client,
        matter: matter,
      },
    });

    let result = [];

    const clientMattersOpt = await API.graphql({
      query: listClientMatters,
      variables: {
        companyId: companyId,
      },
    });

    if (clientMattersOpt.data.company.clientMatters.items !== null) {
      result = clientMattersOpt.data.company.clientMatters.items;

      const dummyPersonResponsible = {
        id: 2,
        name: "Adrian Silva",
        email: "adrian.silva@lophils.com",
        profile_picture:
          "https://as1.ftcdn.net/v2/jpg/03/64/62/36/1000_F_364623643_58jOINqUIeYmkrH7go1smPaiYujiyqit.jpg?auto=compress&cs=tinysrgb&h=650&w=940",
      };

      var filtered = result.filter(function (el) {
        return el.client != null;
      });

      var apdPr = filtered.map((v) => ({
        ...v,
        substantially_responsible: dummyPersonResponsible,
      }));
      var apdMn = apdPr.map((v) => ({
        ...v,
        matter_number: `{${v.matter.name.charAt(2)}-${v.matter.id.slice(
          -4
        )}/${v.client.id.slice(-4)}}`,
      }));
    }
    //dispatch data to reducers
    dispatch({
      type: CREATE_MATTER_SUCCESS,
      payload: {
        matterlist: apdMn,
        message: `Successfully created Client ${client.name} and Matter ${matter.name}`,
      },
    });
  } catch (error) {
    dispatch({
      type: CREATE_MATTER_ERROR,
      payload: error,
    });
  }
};

//delete client and matter
export const deleteMatterClient = async (
  selectedClientMatter,
  dispatch,
  companyId
) => {
  try {
    dispatch({
      type: DELETE_MATTER_REQUEST,
      payload: { loading: true },
    });

    if (selectedClientMatter !== null && selectedClientMatter !== undefined) {
      await API.graphql({
        query: deleteClientMatter,
        variables: {
          id: selectedClientMatter,
        },
      });
    }

    let result = [];

    const clientMattersOpt = await API.graphql({
      query: listClientMatters,
      variables: {
        companyId: companyId,
      },
    });

    if (clientMattersOpt.data.company.clientMatters.items !== null) {
      result = clientMattersOpt.data.company.clientMatters.items;

      const dummyPersonResponsible = {
        id: 2,
        name: "Adrian Silva",
        email: "adrian.silva@lophils.com",
        profile_picture:
          "https://as1.ftcdn.net/v2/jpg/03/64/62/36/1000_F_364623643_58jOINqUIeYmkrH7go1smPaiYujiyqit.jpg?auto=compress&cs=tinysrgb&h=650&w=940",
      };

      var filtered = result.filter(function (el) {
        return el.client != null;
      });

      var apdPr = filtered.map((v) => ({
        ...v,
        substantially_responsible: dummyPersonResponsible,
      }));
      var apdMn = apdPr.map((v) => ({
        ...v,
        matter_number: `{${v.matter.name.charAt(2)}-${v.matter.id.slice(
          -4
        )}/${v.client.id.slice(-4)}}`,
      }));
    }
    //dispatch data to reducers
    dispatch({
      type: DELETE_MATTER_SUCCESS,
      payload: {
        matterlist: apdMn ? apdMn : [],
        message: `Successfully deleted`,
      },
    });
  } catch (error) {
    dispatch({
      type: DELETE_MATTER_ERROR,
      payload: error,
    });
  }
};

//search client matter
export const searchMatterClient = async (companyId, searchMatter, dispatch) => {
  try {
    dispatch({
      type: SEARCH_MATTER_REQUEST,
      payload: { loading: true },
    });

    let result = [];

    const clientMattersOpt = await API.graphql({
      query: listClientMatters,
      variables: {
        companyId: companyId,
      },
    });

    if (clientMattersOpt.data.company.clientMatters.items !== null) {
      result = clientMattersOpt.data.company.clientMatters.items;

      const dummyPersonResponsible = {
        id: 2,
        name: "Adrian Silva",
        email: "adrian.silva@lophils.com",
        profile_picture:
          "https://as1.ftcdn.net/v2/jpg/03/64/62/36/1000_F_364623643_58jOINqUIeYmkrH7go1smPaiYujiyqit.jpg?auto=compress&cs=tinysrgb&h=650&w=940",
      };

      var filtered = result.filter(function (el) {
        return el.client != null;
      });

      var apdPr = filtered.map((v) => ({
        ...v,
        substantially_responsible: dummyPersonResponsible,
      }));
      var apdMn = apdPr.map((v) => ({
        ...v,
        matter_number: `{${v.matter.name.charAt(2)}-${v.matter.id.slice(
          -4
        )}/${v.client.id.slice(-4)}}`,
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
        matterlist: matterslists,
      },
    });

    //dispatch data to reducers
  } catch (error) {
    dispatch({
      type: SEARCH_MATTER_ERROR,
      payload: error,
    });
  }
};
