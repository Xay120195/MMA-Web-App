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
export const searchMatterClient = async (
  companyId,
  listmatters,
  searchMatter,
  dispatch
) => {
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
      var allrecords = apdPr.map((v) => ({
        ...v,
        matter_number: `{${v.matter.name.charAt(2)}-${v.matter.id.slice(
          -4
        )}/${v.client.id.slice(-4)}}`,
      }));
    }

    const str = searchMatter.replace(/\s/g, "");
    console.log(str);
    const matterslists = listmatters.filter(
      (x) =>
        x.matter.name.toUpperCase().includes(str.toUpperCase()) ||
        x.client.name.toUpperCase().includes(str.toUpperCase())
    );

    //dispatch data to reducers
    dispatch({
      type: SEARCH_MATTER_SUCCESS,
      payload: {
        matterlist: searchMatter.length <= 1 ? allrecords : matterslists,
      },
    });
  } catch (error) {
    dispatch({
      type: SEARCH_MATTER_ERROR,
      payload: error,
    });
  }
};
