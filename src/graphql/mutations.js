/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const addOAuthFromCode = /* GraphQL */ `
  mutation AddOAuthFromCode($code: String!) {
    addOAuthFromCode(code: $code)
  }
`;
export const threadCreate = /* GraphQL */ `
  mutation ThreadCreate($input: ThreadCreateInput) {
    threadCreate(input: $input) {
      id
      snippet
      historyId
    }
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
      createdAt
      updatedAt
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
      createdAt
      updatedAt
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
      createdAt
      updatedAt
    }
  }
`;
export const createCompany = /* GraphQL */ `
  mutation CreateCompany(
    $input: CreateCompanyInput!
    $condition: ModelCompanyConditionInput
  ) {
    createCompany(input: $input, condition: $condition) {
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
export const updateCompany = /* GraphQL */ `
  mutation UpdateCompany(
    $input: UpdateCompanyInput!
    $condition: ModelCompanyConditionInput
  ) {
    updateCompany(input: $input, condition: $condition) {
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
export const deleteCompany = /* GraphQL */ `
  mutation DeleteCompany(
    $input: DeleteCompanyInput!
    $condition: ModelCompanyConditionInput
  ) {
    deleteCompany(input: $input, condition: $condition) {
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
export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
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
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
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
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
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
export const createUserAcl = /* GraphQL */ `
  mutation CreateUserAcl(
    $input: CreateUserAclInput!
    $condition: ModelUserAclConditionInput
  ) {
    createUserAcl(input: $input, condition: $condition) {
      id
      userID
      aclID
      user {
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
      acl {
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
      createdAt
      updatedAt
    }
  }
`;
export const updateUserAcl = /* GraphQL */ `
  mutation UpdateUserAcl(
    $input: UpdateUserAclInput!
    $condition: ModelUserAclConditionInput
  ) {
    updateUserAcl(input: $input, condition: $condition) {
      id
      userID
      aclID
      user {
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
      acl {
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
      createdAt
      updatedAt
    }
  }
`;
export const deleteUserAcl = /* GraphQL */ `
  mutation DeleteUserAcl(
    $input: DeleteUserAclInput!
    $condition: ModelUserAclConditionInput
  ) {
    deleteUserAcl(input: $input, condition: $condition) {
      id
      userID
      aclID
      user {
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
      acl {
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
      createdAt
      updatedAt
    }
  }
`;
export const createAcl = /* GraphQL */ `
  mutation CreateAcl(
    $input: CreateAclInput!
    $condition: ModelAclConditionInput
  ) {
    createAcl(input: $input, condition: $condition) {
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
export const updateAcl = /* GraphQL */ `
  mutation UpdateAcl(
    $input: UpdateAclInput!
    $condition: ModelAclConditionInput
  ) {
    updateAcl(input: $input, condition: $condition) {
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
export const deleteAcl = /* GraphQL */ `
  mutation DeleteAcl(
    $input: DeleteAclInput!
    $condition: ModelAclConditionInput
  ) {
    deleteAcl(input: $input, condition: $condition) {
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
