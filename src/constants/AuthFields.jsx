export const AuthFields = {
    signup: [
        {
          type: "given_name",
          label: "First Name",
          placeholder: "",
          required: false,
        },
        {
          type: "family_name",
          label: "Last Name",
          placeholder: "",
          required: false,
        },
        {
          type:'custom:company_name',
          key:'custom:company_name',
          label: "Company Name *",
          placeholder: "",
          required: true,
        },
        {
          type: "email",
          label: "Email Address *",
          autoComplete: "off",
          placeholder: "",
          required: true,
        },
        {
          type: "password",
          label: "Password *",
          autoComplete: "off",
          placeholder: "",
          required: true,
        },
    ],
    login: [
        {
          type: "email",
          label: "Email Address *",
          placeholder: "",
          required: true,
        },
        {
          type: "password",
          label: "Password *",
          placeholder: "",
          required: true,
        },
    ],
    forgotpassword: [
        {
          type: "email",
          label: "Email Address *",
          placeholder: "",
          required: true,
        }
    ]
}