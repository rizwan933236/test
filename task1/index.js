const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const axios = require('axios');
const fs = require('fs');

const ELASTICSEARCH_URL = "PUT HERE ELASTIC SEARCH SERVER LINK"

const typeDefs = gql`
  type Query {
    bool: String
    fuzzy: String
    range: String
    sort: String
    source: String
    wildcard: String
  }
`;

const resolvers = {
  Query: {}
};

const songsData = JSON.parse(fs.readFileSync('./songs/songs.json', 'utf-8'));

const queryFiles = fs.readdirSync('./Queries/');

const executeQuery = async (query) => {
  try {
    const { data } = await axios.post(`${ELASTICSEARCH_URL}/songs/_search`, query);
    return JSON.stringify(data);
  } catch (error) {
    console.error('Error executing query:', error);
    throw new Error('Internal Server Error');
  }
};

queryFiles.forEach(file => {
  if (file.endsWith('.json')) {
    const queryName = file.split('.')[0];
    const query = require(`./Queries/${file}`);
    resolvers.Query[queryName] = async () => {
      return executeQuery(query);
    };
  }
});

const server = new ApolloServer({ typeDefs, resolvers });
const app = express();

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });
}

app.get('/', (req, res) => {
  res.send('Apollo GraphQL Express server is ready');
});

app.get('/execute-query/:queryName', async (req, res) => {
  try {
  const queryName = req.params.queryName;
  
  if (resolvers.Query.hasOwnProperty(queryName)) {
    try {
      const result = await resolvers.Query[queryName]();
      res.json({ result });
    } catch (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(404).json({ error: 'Query not found' }); 
  }
} catch (error) {
  console.error('Error executing query:', error);
  res.status(500).json({ error: 'Internal Server Error' });
}
});

startServer().then(() => {
  app.listen({ port: 8000 }, () => {
    console.log(`Server is running at http://localhost:8000`);
  });
}).catch(err => {
  console.error('Error starting server:', err);
});
