import config from "config";
import express from "express";
import createToken from "./token";

const roomPattern = /\w{4}\-\w{4}/;

const app = express();
const port = config.get("express.port");

type TokenResponse = {
  token: string;
  error: string;
};

app.get("/getToken", (req, res) => {
  const {roomName, identity, name, metadata} = req.query;
  let jres: Partial<TokenResponse>;

  if (typeof identity != "string" || typeof roomName != "string") {
    jres = {
      error: "the query params 'identity' and 'roomName' must be strings",
    };
    res.status(403).json(jres).end();
    return;
  }

  if (Array.isArray(name)) {
    jres = {
      error: "provide max one name",
    };
  }

  if (Array.isArray(metadata)) {
    jres = {
      error: "provide max one metadata string",
    };
  }

  res.send(createToken()).end();
  return;
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
