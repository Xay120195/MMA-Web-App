/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const threadsFromApi = /* GraphQL */ `
  query ThreadsFromApi($email: String!) {
    threadsFromApi(email: $email) {
      id
      snippet
      historyId
    }
  }
`;
export const threadsFromDb = /* GraphQL */ `
  query ThreadsFromDb {
    threadsFromDB {
      id
      snippet
      historyId
    }
  }
`;
export const getThread = /* GraphQL */ `
  query GetThread($id: ID!) {
    getThread(id: $id) {
      id
      snippet
      historyId
    }
  }
`;
export const listThreads = /* GraphQL */ `
  query ListThreads(
    $filter: ModelThreadFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listThreads(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        snippet
        historyId
      }
      nextToken
    }
  }
`;
export const getUserOAuth = /* GraphQL */ `
  query GetUserOAuth($username: ID!, $email: String!) {
    getUserOAuth(username: $username, email: $email) {
      username
      email
      token
    }
  }
`;
export const listUserOAuths = /* GraphQL */ `
  query ListUserOAuths(
    $username: ID
    $email: ModelStringKeyConditionInput
    $filter: ModelUserOAuthFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listUserOAuths(
      username: $username
      email: $email
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        username
        email
        token
      }
      nextToken
    }
  }
`;
