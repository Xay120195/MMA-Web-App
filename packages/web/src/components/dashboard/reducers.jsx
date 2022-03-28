import { MATTER_REQUEST, MATTER_SUCCESS, MATTER_ERROR } from "./constants";
//fecth all matter reducers
export const allMatterListReducer = (state, action) => {
  switch (action.type) {
    case MATTER_REQUEST:
      return {
        loading: true,
        listmatters: [],
        errorMatter: {},
      };
    case MATTER_SUCCESS:
      return {
        loading: false,
        listmatters: action.payload.matterlist,
        errorMatter: {},
      };
    case MATTER_ERROR:
      return {
        loading: false,
        listmatters: [],
        errorMatter: action.payload.error,
      };
  }
  return state;
};
