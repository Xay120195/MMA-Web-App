# Porting 3P Backends to Serverless AppSync - Guide

## REST API Body to GRAPHQL Input Arguments

Change payload structure from `event.body` to `ctx.arguments`. If the REST API Accepts application/json format:

```
{
"someVariable":  "sampleValue"
}
```

the GraphQL Mutation version would be

```
mutation something {
	something(someVariable: String!): Something
}
```

## Cron Job Schedules

If the 3P backend implements some sort of cron-job schedule, we can leverage AWS EvenBridge Rule ( aka. CloudWatch Event Rules). We can define Cron Expression using the serverless framework on the function `events` definition.

```
functions:
  gmail-re-subsription-fn:
    handler: functions/event-bridge/gmail-re-subscription/index.handler
    events:
      - schedule: rate(6 hours)
```

## IaCfy the Resources

**DynamoDB example**

```
  TodoTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: TodoTable
      AttributeDefinitions:
        - AttributeName: id
          AttributeType: S
      KeySchema:
        - AttributeName: id
          KeyType: HASH
      BillingMode: PAY_PER_REQUEST
```
