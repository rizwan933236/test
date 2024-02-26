const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { SQLDataSource } = require('apollo-datasource-sqlite');
const sqlite3 = require('sqlite3');
const fs = require('fs');

// Initialize SQLite database
const dbFile = 'orders.db';
if (!fs.existsSync(dbFile)) {
  const db = new sqlite3.Database(dbFile);
  db.exec(`
    CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        deliveryAddress TEXT NOT NULL,
        items TEXT NOT NULL,
        total REAL NOT NULL,
        discountCode TEXT,
        comment TEXT,
        status TEXT NOT NULL
    );
  `);
  db.close();
}

const typeDefs = gql`
  enum Status {
    PENDING
    PAID
    IN_PROGRESS
    IN_DELIVERY
    DELIVERED
  }

  type Order {
    id: ID!
    deliveryAddress: String!
    items: [String]!
    total: Float!
    discountCode: String
    comment: String
    status: Status!
  }

  type Query {
    orders(status: Status): [Order]!
    order(id: ID!): Order
  }

  type Mutation {
    updateStatus(id: ID!, status: Status!): Order
  }
`;

const server = new ApolloServer({
  typeDefs,
  dataSources: () => ({
    orderAPI: new OrderAPI()
  }),
  resolvers: {
    Query: {
      orders: (_, { status }, { dataSources }) =>
        status
          ? dataSources.orderAPI.getOrdersByStatus(status)
          : dataSources.orderAPI.getOrders(),
      order: (_, { id }, { dataSources }) =>
        dataSources.orderAPI.getOrderById(id)
    },
    Mutation: {
      updateStatus: (_, { id, status }, { dataSources }) =>
        dataSources.orderAPI.updateOrderStatus(id, status)
    }
  }
});

const app = express();
server.applyMiddleware({ app });

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/graphql`);
});
