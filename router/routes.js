const { graphqlExpress } = require('apollo-server-express');
const { expressPlayground } = require('graphql-playground-middleware');
const { makeExecutableSchema, mergeSchemas } = require('graphql-tools');
const { GraphQLObjectType } = require('graphql/type/definition');
const { getIntrospectSchema } = require('../graphql/introspection');
const express = require('express');
const router = express.Router();

const typeDefs = require('../graphql/schema').typeDefs;
const resolvers = require('../graphql/resolvers').resolvers;

// Put together a schema
const schemaIntern = makeExecutableSchema({
    typeDefs,
    resolvers,
});

const endpoints = [
    // 'https://dev-api.travelgatex.com'
    'http://localhost:9002/graphql'
];

(async function () {
    try {
        //promise.all to grab all remote schemas at the same time, we do not care what order they come back but rather just when they finish
        allSchemas = await Promise.all(endpoints.map(ep => getIntrospectSchema(ep)));

        // Add intern schema
        allSchemas.push(schemaIntern);

        //create function for /graphql endpoint and merge all the schemas
        router.post('/', graphqlExpress({
            schema: mergeSchemas({
                schemas: allSchemas,
                onTypeConflict: (leftType, rightType) => {
                    if (leftType instanceof GraphQLObjectType) {
                        return mergeObjectTypes(leftType, rightType);
                    }
                    return leftType;
                }
            })
        }));
        // Playground, a visual editor for queries
        router.get('/', expressPlayground({ endpointUrl: '/' }));

        // Status query
        router.get('/status', function (req, res) {
            res.status(200).json('OK');
        });

    } catch (error) {
        console.log('ERROR: Failed to grab introspection queries', error);
    }
})();

function mergeObjectTypes(leftType, rightType) {
    if (!rightType) {
        return leftType;
    }
    if (leftType.constructor.name !== rightType.constructor.name) {
        throw new TypeError(`Cannot merge with different base type. this: ${leftType.constructor.name}, other: ${rightType.constructor.name}.`);
    }
    leftType.getFields() // Populate _fields
    leftType.getInterfaces() // Populate _interfaces
    var count = 0
    for (const [key, value] of Object.entries(rightType.getFields())) {
        leftType._fields[key+count] = value;
        count = count + 1;
    }
    for (const [key, value] of Object.entries(rightType.getInterfaces())) {
        leftType._interfaces[key+count] = value;
        count = count + 1;
    }
    return leftType;
}

module.exports = {
    router
}