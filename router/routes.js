const { graphqlExpress } = require('apollo-server-express');
const { expressPlayground } = require('graphql-playground-middleware');
const { makeExecutableSchema } = require('graphql-tools');

const express = require('express');
const router = express.Router();

const typeDefs = require('../graphql/schema').typeDefs;
const resolvers = require('../graphql/resolvers').resolvers;

// Put together a schema
const schemaIntern = makeExecutableSchema({
    typeDefs,
    resolvers,
});

//create function for /graphql endpoint and merge all the schemas
router.post('/', graphqlExpress({ schema: schemaIntern }));

// Playground, a visual editor for queries
router.get('/', expressPlayground({ endpointUrl: '/' }));

// Status query
router.get('/status', function (req, res) { res.status(200).json('OK'); });
    
module.exports = {
    router
}