/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateThread = /* GraphQL */ `
  subscription OnCreateThread {
    onCreateThread {
      id
      snippet
      historyId
    }
  }
`;
export const onUpdateThread = /* GraphQL */ `
  subscription OnUpdateThread {
    onUpdateThread {
      id
      snippet
      historyId
    }
  }
`;
export const onDeleteThread = /* GraphQL */ `
  subscription OnDeleteThread {
    onDeleteThread {
      id
      snippet
      historyId
    }
  }
`;
export const onCreateUserOAuth = /* GraphQL */ `
  subscription OnCreateUserOAuth {
    onCreateUserOAuth {
      username
      email
      token
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateUserOAuth = /* GraphQL */ `
  subscription OnUpdateUserOAuth {
    onUpdateUserOAuth {
      username
      email
      token
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteUserOAuth = /* GraphQL */ `
  subscription OnDeleteUserOAuth {
    onDeleteUserOAuth {
      username
      email
      token
      createdAt
      updatedAt
    }
  }
`;
export const onCreateCompany = /* GraphQL */ `
  subscription OnCreateCompany {
    onCreateCompany {
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
export const onUpdateCompany = /* GraphQL */ `
  subscription OnUpdateCompany {
    onUpdateCompany {
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
export const onDeleteCompany = /* GraphQL */ `
  subscription OnDeleteCompany {
    onDeleteCompany {
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
export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser {
    onCreateUser {
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
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser {
    onUpdateUser {
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
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser {
    onDeleteUser {
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
export const onCreateUserAcl = /* GraphQL */ `
  subscription OnCreateUserAcl {
    onCreateUserAcl {
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
export const onUpdateUserAcl = /* GraphQL */ `
  subscription OnUpdateUserAcl {
    onUpdateUserAcl {
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
export const onDeleteUserAcl = /* GraphQL */ `
  subscription OnDeleteUserAcl {
    onDeleteUserAcl {
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
export const onCreateAcl = /* GraphQL */ `
  subscription OnCreateAcl {
    onCreateAcl {
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
export const onUpdateAcl = /* GraphQL */ `
  subscription OnUpdateAcl {
    onUpdateAcl {
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
export const onDeleteAcl = /* GraphQL */ `
  subscription OnDeleteAcl {
    onDeleteAcl {
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
