export const pages=[
    {
      id: 1,
      name: 'All Pages',
      access: [
        {
          name: 'owner',
          has_access: 1
        },
        {
          name: 'legal_admin',
          has_access: 1
        },
        {
          name: 'barrister',
          has_access: 1
        },
        {
          name: 'expert',
          has_access: 1
        },
        {
          name: 'client',
          has_access: 1
        }
      ]
    },
    {
      id: 2,
      name: 'Matter Affidavits Overview',
      access: [
        {
          name: 'owner',
          has_access: 0
        },
        {
          name: 'legal_admin',
          has_access: 0
        },
        {
          name: 'barrister',
          has_access: 0
        },
        {
          name: 'expert',
          has_access: 0
        },
        {
          name: 'client',
          has_access: 0
        }
      ]
    },
    {
      id: 3,
      name: 'Witness Affidavits',
      access: [
        {
          name: 'owner',
          has_access: 1
        },
        {
          name: 'legal_admin',
          has_access: 1
        },
        {
          name: 'barrister',
          has_access: 1
        },
        {
          name: 'expert',
          has_access: 1
        },
        {
          name: 'client',
          has_access: 1
        }
      ]
    },
    {
      id: 4,
      name: 'RFI',
      access: [
        {
          name: 'owner',
          has_access: 0
        },
        {
          name: 'legal_admin',
          has_access: 0
        },
        {
          name: 'barrister',
          has_access: 0
        },
        {
          name: 'expert',
          has_access: 0
        },
        {
          name: 'client',
          has_access: 0
        }
      ]
    },
    {
      id: 5,
      name: 'Matters Library',
      access: [
        {
          name: 'owner',
          has_access: 1
        },
        {
          name: 'legal_admin',
          has_access: 1
        },
        {
          name: 'barrister',
          has_access: 1
        },
        {
          name: 'expert',
          has_access: 1
        },
        {
          name: 'client',
          has_access: 1
        }
      ]
    },
    {
      id: 6,
      name: 'Templates Library',
      access: [
        {
          name: 'owner',
          has_access: 0
        },
        {
          name: 'legal_admin',
          has_access: 0
        },
        {
          name: 'barrister',
          has_access: 0
        },
        {
          name: 'expert',
          has_access: 0
        },
        {
          name: 'client',
          has_access: 0
        }
      ]
    },
    {
      id: 7,
      name: 'Contacts',
      access: [
        {
          name: 'owner',
          has_access: 1
        },
        {
          name: 'legal_admin',
          has_access: 1
        },
        {
          name: 'barrister',
          has_access: 1
        },
        {
          name: 'expert',
          has_access: 1
        },
        {
          name: 'client',
          has_access: 1
        }
      ]
    },
    {
      id: 8,
      name: 'User Type Access',
      access: [
        {
          name: 'owner',
          has_access: 0
        },
        {
          name: 'legal_admin',
          has_access: 0
        },
        {
          name: 'barrister',
          has_access: 0
        },
        {
          name: 'expert',
          has_access: 0
        },
        {
          name: 'client',
          has_access: 0
        }
      ]
    }
  ];

  export const features = [
    {
      id:1,
      page_id: 2,
      name: 'matters_affidavits_overview',
      title: 'Matter Affidavits Overview',
      data: [
        {
          id: 1,
          name: 'Share',
          access: [
            {
              name:'owner',
              has_access: 1
            },{
              name:'legal_admin',
              has_access: 1
            },{
              name:'barrister',
              has_access: 1
            },{
              name:'expert',
              has_access: 1
            },{
              name:'client',
              has_access: 0
            }
          ]
        },
        {
          id: 2,
          name: 'Filter by Client',
          access: [
            {
              name:'owner',
              has_access: 1
            },{
              name:'legal_admin',
              has_access: 0
            },{
              name:'barrister',
              has_access: 1
            },{
              name:'expert',
              has_access: 0
            },{
              name:'client',
              has_access: 1
            }
          ]
        },
        {
          id: 3,
          name: 'Export',
          access: [
            {
              name:'owner',
              has_access: 1
            },{
              name:'legal_admin',
              has_access: 0
            },{
              name:'barrister',
              has_access: 1
            },{
              name:'expert',
              has_access: 0
            },{
              name:'client',
              has_access: 1
            }
          ]
        },
        {
          id: 4,
          name: 'Compose Email',
          access: [
            {
              name:'owner',
              has_access: 1
            },{
              name:'legal_admin',
              has_access: 1
            },{
              name:'barrister',
              has_access: 0
            },{
              name:'expert',
              has_access: 1
            },{
              name:'client',
              has_access: 1
            }
          ]
        },
        {
          id: 5,
          name: 'Delete',
          access: [
            {
              name:'owner',
              has_access: 1
            },{
              name:'legal_admin',
              has_access: 0
            },{
              name:'barrister',
              has_access: 1
            },{
              name:'expert',
              has_access: 0
            },{
              name:'client',
              has_access: 0
            }
          ]
        },
      ]
    },
    {
      id:2,
      page_id: 3,
      name: 'witness_affidavits',
      title: 'Witness Affidavits',
      data: [
        {
          id: 1,
          name: 'Export',
          access: [
            {
              name:'owner',
              has_access: 1
            },{
              name:'legal_admin',
              has_access: 0
            },{
              name:'barrister',
              has_access: 0
            },{
              name:'expert',
              has_access: 0
            },{
              name:'client',
              has_access: 1
            }
          ]
        },
        {
          id: 2,
          name: 'Compose Email',
          access: [
            {
              name:'owner',
              has_access: 1
            },{
              name:'legal_admin',
              has_access: 1
            },{
              name:'barrister',
              has_access: 0
            },{
              name:'expert',
              has_access: 0
            },{
              name:'client',
              has_access: 0
            }
          ]
        },
        {
          id: 3,
          name: 'Delete',
          access: [
            {
              name:'owner',
              has_access: 1
            },{
              name:'legal_admin',
              has_access: 1
            },{
              name:'barrister',
              has_access: 0
            },{
              name:'expert',
              has_access: 0
            },{
              name:'client',
              has_access: 0
            }
          ]
        },
        {
          id: 4,
          name: 'Extract from PDF',
          access: [
            {
              name:'owner',
              has_access: 1
            },{
              name:'legal_admin',
              has_access: 1
            },{
              name:'barrister',
              has_access: 0
            },{
              name:'expert',
              has_access: 0
            },{
              name:'client',
              has_access: 0
            }
          ]
        }
      ]
    },
    {
      id:3,
      page_id: 7,
      name: 'contacts',
      title: 'Contacts',
      data: [
        {
          id: 1,
          name: 'Add Contact',
          access: [
            {
              name:'owner',
              has_access: 1
            },{
              name:'legal_admin',
              has_access: 1
            },{
              name:'barrister',
              has_access: 1
            },{
              name:'expert',
              has_access: 1
            },{
              name:'client',
              has_access: 1
            }
          ]
        }
      ]
    },
    {
      id:4,
      page_id: 8,
      name: 'user_access',
      title: 'User Access',
      data: [
        {
          id: 1,
          name: 'Add User Type Access',
          access: [
            {
              name:'owner',
              has_access: 1
            },{
              name:'legal_admin',
              has_access: 0
            },{
              name:'barrister',
              has_access: 0
            },{
              name:'expert',
              has_access: 0
            },{
              name:'client',
              has_access: 0
            }
          ]
        }
      ]
    }
  ]
  