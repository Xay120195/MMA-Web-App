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
  HIDETOAST,
} from "./constants";
//fecth all matter reducers
export const clientMatterReducers = (state, action) => {
  switch (action.type) {
    //fetch matter
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
    //search matter
    case SEARCH_MATTER_REQUEST:
      return {
        loading: true,
        listmatters: [],
        errorMatter: {},
      };
    case SEARCH_MATTER_SUCCESS:
      return {
        loading: false,
        listmatters: action.payload.matterlist,
        errorMatter: {},
      };
    case SEARCH_MATTER_ERROR:
      return {
        loading: false,
        listmatters: [],
        errorMatter: action.payload.error,
      };
    //create matter
    case CREATE_MATTER_REQUEST:
      return {
        loading: true,
        listmatters: [],
        errorMatter: {},
      };
    case CREATE_MATTER_SUCCESS:
      return {
        loading: false,
        toastMessage: action.payload.message,
        listmatters: action.payload.matterlist,
        toast: true,
        errorMatter: {},
      };
    case CREATE_MATTER_ERROR:
      return {
        loading: false,
        listmatters: [],
        errorMatter: action.payload.error,
      };

    //delete matter

    case DELETE_MATTER_REQUEST:
      return {
        loading: true,
        listmatters: [],
        errorMatter: {},
      };
    case DELETE_MATTER_SUCCESS:
      return {
        loading: false,
        listmatters: action.payload.matterlist,
        toastMessage: action.payload.message,
        errorMatter: {},
        toast: true,
      };
    case DELETE_MATTER_ERROR:
      return {
        loading: false,
        listmatters: [],
        errorMatter: action.payload.error,
      };
  }
  return state;
};
