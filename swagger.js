const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Key Manager Server",
    description: "APIs for Key Manager Server.",
  },
  servers: [
    {
      url: "https://some-server.com",
      description: "APIs for Key Manager Server.",
    },
  ],
  host: "localhost:9988",
};

const outputFile = "./swagger.json";
const routes = ["./routes/index.js"];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);
