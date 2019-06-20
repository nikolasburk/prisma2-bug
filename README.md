# Error

The latest release `0.0.87` seems to have broken something in `nexus-prisma`! Everything described below works when generating `photonsjs` and `nexus-prisma` with version `0.0.84`! The problem with `0.0.84` is that it sends double queries/mutations and creates double records.

The `findManyUsers` query from nexus-prisma is broken:

```graphql
{
	findManyUser {
    id
    name
    email
    posts {
      id
      title
    }
  }
}
```

It returns:

```json
{
  "data": {
    "findManyUser": null
  }
}
```

Oher CRUD operations as well:

```graphql
mutation {
  createOneUser(data:{
    email: "UUUUU" 
    name:"UUUUUD"
  }) {
    id
    name
    email
  }
}
```

Resoonse:

```json
{
  "errors": [
    {
      "message": "Cannot return null for non-nullable field Mutation.createOneUser.",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": [
        "createOneUser"
      ],
      "extensions": {
        "code": "INTERNAL_SERVER_ERROR",
        "exception": {
          "stacktrace": [
            "Error: Cannot return null for non-nullable field Mutation.createOneUser.",
            "    at completeValue (/Users/nikolasburk/Desktop/graphqlconf/dry-run/node_modules/graphql/execution/execute.js:579:13)",
            "    at /Users/nikolasburk/Desktop/graphqlconf/dry-run/node_modules/graphql/execution/execute.js:511:16",
            "    at processTicksAndRejections (internal/process/task_queues.js:89:5)"
          ]
        }
      }
    }
  ],
  "data": null
}
```

Note that the `users.create` did work though and there is a new record in the DB.

But the `users` query which resolves "manually" works:

```graphql
{
	users {
    id
    name
    email
    posts {
      id
      title
    }
  }
}
```

```json
{
  "data": {
    "users": [
      {
        "id": "cjx50g1bi00007bcbp3r8stet",
        "name": "UUUUUD",
        "email": "UUUUU",
        "posts": null
      }
    ]
  }
}
```

