export const AuthFields = {
    signup: [
        {
          type: "given_name",
          label: "First Name",
          placeholder: "",
          required: true,
          handleInputChange: (event) => {
            return event.target.value = clean_up(event.target.value);
          }
        },
        {
          type: "family_name",
          label: "Last Name",
          placeholder: "",
          required: true,
          handleInputChange: (event) => {
            return event.target.value = clean_up(event.target.value);
          }
        },
        {
          type:'custom:company_name',
          key:'custom:company_name',
          label: "Company Name",
          placeholder: "",
          required: true,
          handleInputChange: (event) => {
            return event.target.value = clean_up(event.target.value);
          }
        },
        {
          type: "email",
          label: "Email Address",
          autoComplete: "off",
          placeholder: "",
          required: true,
          handleInputChange: (event) => {
            return event.target.value = clean_up(event.target.value);
          }
        },
        {
          type: "password",
          label: "Password",
          autoComplete: "off",
          placeholder: "",
          required: true,
          handleInputChange: (event) => {
            return event.target.value = clean_up(event.target.value);
          }
        },
    ],
    login: [
        {
          type: "email",
          label: "Email Address",
          placeholder: "",
          required: true
        },
        {
          type: "password",
          label: "Password",
          placeholder: "",
          required: true
        },
    ],
    forgotpassword: [
        {
          type: "email",
          label: "Email Address *",
          placeholder: "",
          required: true
        }
    ]
}

function clean_up(v) {
  let c = v.replace(/\s+/g, ' ');
  return c === ' ' ? '' : c;  
}