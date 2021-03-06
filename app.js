const http = require("http");
const fs = require("fs");

const PORT = 4000;
const origin = `http://localhost:${PORT}`;

class Database {
  constructor(fname) {
    this.fn = `${fname}.json`;
    let state = new Map();
    try {
      let joe = fs.readFileSync(this.fn, {
        encoding: "utf-8",
        flag: "r+",
      });
      state = new Map(Object.entries(JSON.parse(joe)));
      console.log("\nInitializing from existing DB.\n");
    } catch (err) {
      console.log("\nNo DB found. Initializing new.\n");
      fs.writeFileSync(this.fn, JSON.stringify(Object.fromEntries(state)));
    }
    this.state = state;
  }
  setState(key, value) {
    this.state.set(key, value);
    return this.updateDb(this.state);
  }
  getValue(key) {
    return this.state.get(key);
  }
  hasValue(key) {
    return this.state.has(key);
  }
  getState(len = false) {
    return len ? this.state.size : this.state;
  }
  updateDb(state) {
    return fs.writeFile(
      this.fn,
      JSON.stringify(Object.fromEntries(state), undefined, 2),
      (err) => {
        if (err) {
          console.log("couldnt update db");
        }
        return true;
      }
    );
  }
}

const db2 = new Database("storage");

const server = http.createServer((req, res) => {
  const url = new URL(req.url, origin);
  const query = url.search.substr(1).split("=");

  // route: /set?key=value
  if (req.method === "GET" && url.pathname === "/set" && query.length === 2) {
    if (query[0].length >= 1) {
      let [key, value] = query;

      if (db2.hasValue(key)) {
        // console.log(db);
        res
          .writeHead(200, { "Content-Type": "text/plain" })
          .end(`Value with key [${key}] already exists in the database.`);
      } else {
        let record = {};
        record[key] = value;
        db2.setState(key, value);
        // console.log(db);
        res
          .writeHead(200, { "Content-Type": "text/plain" })
          .end(
            `New Entry: ${JSON.stringify(
              record,
              undefined,
              2
            )}\n\nCurrent Database Size: ${db2.getState((len = true))}`
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
      let fVal = db2.getValue(key);
      if (!fVal) {
        res.end(`Value with key [${key}] not found in database.`);
      } else {
        let record = {};
        record[key] = fVal;
        res
          .writeHead(200, { "Content-Type": "text/plain" })
          .end(`Found Entry:\n${JSON.stringify(record, undefined, 2)}`);
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
          Object.fromEntries(db2.getState()),
          undefined,
          2
        )}\n\nCurrent Database Size: ${db2.getState((len = true))}`
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
