const http = require("http");

const PORT = 4000;
const origin = `http://localhost:${PORT}`;
const db = [];
var dbsize = 0;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, origin);
  const query = url.search.substr(1).split("=");

  // route: /set?key=value
  if (req.method === "GET" && url.pathname === "/set" && query.length === 2) {
    if (query[0].length >= 1) {
      let [key, value] = query;
      let exists = false;

      db.map((kvPair) => {
        if (key in kvPair) {
          exists = true;
        }
      });

      if (exists) {
        // console.log(db);
        res
          .writeHead(200, { "Content-Type": "text/plain" })
          .end(`Value with key [${key}] already exists in the database.`);
      } else {
        let record = {};
        record[key] = value;
        dbsize = db.push(record);
        // console.log(db);
        res
          .writeHead(200, { "Content-Type": "text/plain" })
          .end(
            `New Entry: ${JSON.stringify(
              db[db.length - 1],
              undefined,
              2
            )}\n\nCurrent Database Size: ${dbsize}`
          );
      }
    } else {
      res.end("key passed should be at least 1 character");
    }
  }

  // route: /get?key=somekey
  else if (
    req.method === "GET" &&
    url.pathname === "/get" &&
    query[0] === "key" &&
    query.length === 2
  ) {
    if (query[1].length >= 1) {
      let [, key] = query;
      var foundkvp = {};
      db.map((kvPair) => {
        if (key in kvPair) foundkvp = kvPair;
      });
      if (Object.keys(foundkvp).length === 0) {
        res.end(`Value with key [${key}] not found in database.`);
      } else {
        res
          .writeHead(200, { "Content-Type": "text/plain" })
          .end(`Found Entry:\n ${JSON.stringify(foundkvp, undefined, 2)}`);
      }
    } else {
      res.end("key passed should be at least 1 character");
    }
  }

  // route: /db (test route to display current state of db)
  else if (req.method === "GET" && url.pathname === "/db") {
    res
      .writeHead(200, { "Content-Type": "text/plain" })
      .end(
        `Current DB State: ${JSON.stringify(
          db,
          undefined,
          2
        )}\n\nCurrent Database Size: ${dbsize}`
      );
  }

  // route: /* (404 Not Found)
  else {
    res.statusCode = 404;
    res.end("unexpected route");
  }
});

server.listen(PORT, () => {
  console.log(`Server ready at: ${origin}`);
});
