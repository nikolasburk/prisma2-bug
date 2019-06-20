import { ApolloServer } from 'apollo-server'
import { makeSchema, objectType } from '@prisma/nexus'
import Photon from '@generated/photon'
import { nexusPrismaMethod } from '@generated/nexus-prisma'
import { join } from 'path'

const photon = new Photon()

async function main() {
  const newUser = await photon.users.findMany()
  console.log(newUser)
}

// main()
//   .catch(e => console.error(e))
//   .finally(async () => {
//     await photon.disconnect()
//   })

const nexusPrisma = nexusPrismaMethod({
  photon: (ctx) => ctx.photon,
})

const User = objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.email()
    t.model.posts()
  },
})

const Post = objectType({
  name: 'Post',
  definition(t) {
    t.model.id()
    t.model.title()
    t.model.published()
    t.model.author()
  },
})

const Query = objectType({
  name: 'Query',
  definition(t) {
    t.crud.findManyUser()
    t.crud.findManyPost()
    t.list.field('users', {
      type: 'User',
      resolve: async () => {
        const users = await photon.users()
        console.log(users)
        return users
      }
    })
  },
})

const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    t.crud.createOneUser()
    t.crud.createOnePost()
    t.crud.updateOneUser()
    t.crud.updateOnePost()
    t.crud.deleteOneUser()
    t.crud.deleteOnePost()
  },
})

const schema = makeSchema({
  types: [Query, Post, User, Mutation, nexusPrisma],
  outputs: {
    typegen: join(__dirname, 'generated/nexus.ts'),
    schema: join(__dirname, 'generated/schema.graphql'),
  },
  typegenAutoConfig: {
    sources: [
      {
        source: '@generated/photon',
        alias: 'photon',
      },
    ],
  },
})

const server = new ApolloServer({
  schema,
  context: { photon }
})
server
  .listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000`),
  )
  .then(serverInfo => {
    async function cleanup() {
      serverInfo.server.close()
      await photon.disconnect()
    }

    process.on('SIGINT', cleanup)
    process.on('SIGTERM', cleanup)
  })

// // const schema = makeSchema({
// //   types: [Mutation, Query, User, Post, nexusPrisma],
// //   outputs: {
// //     schema: __dirname + '/generated/schema.graphql',
// //     typegen: __dirname + '/generated/nexus.ts',
// //   },
// //   typegenAutoConfig: {
// //     sources: [
// //       {
// //         source: '@generated/photon',
// //         alias: 'photon',
// //       },
// //       {
// //         source: __dirname + '/index.ts',
// //         alias: 'ctx',
// //       },
// //     ],
// //     contextType: 'ctx.Context',
// //   },
// // })
