/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const addOAuthFromCode = /* GraphQL */ `
  mutation AddOAuthFromCode($code: String!) {
    addOAuthFromCode(code: $code)
  }
`;
export const createThread = /* GraphQL */ `
  mutation CreateThread(
    $input: CreateThreadInput!
    $condition: ModelThreadConditionInput
  ) {
    createThread(input: $input, condition: $condition) {
      id
      snippet
      historyId
    }
  }
`;
export const updateThread = /* GraphQL */ `
  mutation UpdateThread(
    $input: UpdateThreadInput!
    $condition: ModelThreadConditionInput
  ) {
    updateThread(input: $input, condition: $condition) {
      id
      snippet
      historyId
    }
  }
`;
export const deleteThread = /* GraphQL */ `
  mutation DeleteThread(
    $input: DeleteThreadInput!
    $condition: ModelThreadConditionInput
  ) {
    deleteThread(input: $input, condition: $condition) {
      id
      snippet
      historyId
    }
  }
`;
export const createUserOAuth = /* GraphQL */ `
  mutation CreateUserOAuth(
    $input: CreateUserOAuthInput!
    $condition: ModelUserOAuthConditionInput
  ) {
    createUserOAuth(input: $input, condition: $condition) {
      username
      email
      token
    }
  }
`;
export const updateUserOAuth = /* GraphQL */ `
  mutation UpdateUserOAuth(
    $input: UpdateUserOAuthInput!
    $condition: ModelUserOAuthConditionInput
  ) {
    updateUserOAuth(input: $input, condition: $condition) {
      username
      email
      token
    }
  }
`;
export const deleteUserOAuth = /* GraphQL */ `
  mutation DeleteUserOAuth(
    $input: DeleteUserOAuthInput!
    $condition: ModelUserOAuthConditionInput
  ) {
    deleteUserOAuth(input: $input, condition: $condition) {
      username
      email
      token
    }
  }
`;
