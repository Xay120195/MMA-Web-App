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
export const me = /* GraphQL */ `
  query Me {
    me {
      id
      company {
        id
        name
        description
        users {
          nextToken
        }
        acls {
          nextToken
        }
        createdAt
        updatedAt
      }
      username
      type
      acls {
        items {
          id
          userID
          aclID
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const users = /* GraphQL */ `
  query Users {
    users {
      id
      company {
        id
        name
        description
        users {
          nextToken
        }
        acls {
          nextToken
        }
        createdAt
        updatedAt
      }
      username
      type
      acls {
        items {
          id
          userID
          aclID
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
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
      createdAt
      updatedAt
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
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getCompany = /* GraphQL */ `
  query GetCompany($id: ID!) {
    getCompany(id: $id) {
      id
      name
      description
      users {
        items {
          id
          username
          type
          createdAt
          updatedAt
        }
        nextToken
      }
      acls {
        items {
          id
          name
          mode
          fields
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const listCompanys = /* GraphQL */ `
  query ListCompanys(
    $filter: ModelCompanyFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCompanys(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        users {
          nextToken
        }
        acls {
          nextToken
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      company {
        id
        name
        description
        users {
          nextToken
        }
        acls {
          nextToken
        }
        createdAt
        updatedAt
      }
      username
      type
      acls {
        items {
          id
          userID
          aclID
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        company {
          id
          name
          description
          createdAt
          updatedAt
        }
        username
        type
        acls {
          nextToken
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getAcl = /* GraphQL */ `
  query GetAcl($id: ID!) {
    getAcl(id: $id) {
      id
      name
      company {
        id
        name
        description
        users {
          nextToken
        }
        acls {
          nextToken
        }
        createdAt
        updatedAt
      }
      mode
      fields
      user {
        items {
          id
          userID
          aclID
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const listAcls = /* GraphQL */ `
  query ListAcls(
    $filter: ModelAclFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAcls(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        company {
          id
          name
          description
          createdAt
          updatedAt
        }
        mode
        fields
        user {
          nextToken
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
