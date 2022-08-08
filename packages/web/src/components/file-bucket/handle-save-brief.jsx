import { API } from "aws-amplify";

var moment = require("moment");
export const mCreateBrief = `
  mutation MyMutation($clientMatterId: String, $date: AWSDateTime, $name: String, $order: Int) {
    briefCreate(clientMatterId: $clientMatterId, date: $date, name: $name, order: $order) {
      id
      name
      date
      createdAt
    }
  }
  `;

export const handleSaveBrief = async (briefname, matter_id) => {
  console.log("matterid", matter_id);
  console.log("briefname", briefname);

  // alert(briefname);

  const addBrief = await API.graphql({
    query: mCreateBrief,
    variables: {
      clientMatterId: matter_id,
      name: briefname,
      date: moment.utc(moment(new Date(), "YYYY-MM-DD")).toISOString(),
      order: 0,
    },
  });

  console.log("brief", addBrief);
  const getID = addBrief.data.briefCreate.id;
};
