import { MATTER_REQUEST, MATTER_SUCCESS, MATTER_ERROR } from "./constants";
import { API } from "aws-amplify";

export const getMatterList = async (dispatch, companyId) => {
  try {
    dispatch({
      type: MATTER_REQUEST,
      payload: { loading: true },
    });

    const listClientMatters = `
    query listClientMatters($companyId: String) {
      company(id: $companyId) {
        clientMatters {
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

    let result = [];

    const companyId = localStorage.getItem("companyId");
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

      var apdPr = result.map((v) => ({
        ...v,
        substantially_responsible: dummyPersonResponsible,
      }));
      var apdMn = apdPr
        .map((v) => ({
          ...v,
          matter_number: `{${v.matter.name.charAt(2)}-${v.matter.id.slice(
            -4
          )}/${v.client.id.slice(-4)}}`,
        }))
        .sort((a, b) => {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        })
        .reverse();
    }

    dispatch({
      type: MATTER_SUCCESS,
      payload: { matterlist: apdMn },
    });
  } catch (error) {
    dispatch({
      type: MATTER_ERROR,
      payload: error,
    });
  }
};
