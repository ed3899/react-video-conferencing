import {Request, RequestHandler} from "express";
import createToken from "./token";

type TokenResponse = {
  token?: string;
  errors: string[];
};

const check = (req: Request) => {
  const {roomName, identity, name, metadata} = req.query;
  let jres: TokenResponse = {
    errors: [],
  };

  if (typeof identity != "string" || typeof roomName != "string") {
    jres.errors?.push(
      "the query params 'identity' and 'roomName' must be strings"
    );
  }

  if (Array.isArray(name)) {
    jres.errors?.push("provide max one name");
  }

  if (Array.isArray(metadata)) {
    jres.errors?.push("provide max one metadata string");
  }

  return jres;
};

const getTokenHandler: RequestHandler = (req, res) => {
  const {roomName, identity, name, metadata} = req.query;
  const tr = check(req);

  if (tr.errors.length > 0) {
    res.status(403).json(tr).end();
    return;
  }

  res.sendStatus(403).json(createToken()).end();
  return;
};
