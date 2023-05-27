import {Request, RequestHandler, Response} from "express";
import createToken from "./token";
import R from "ramda";
import {VideoGrant} from "livekit-server-sdk";
import {getLiveKitUrl} from "./utils";

class EmptyQueryParams extends Error {
  errors?: string[];
  constructor(message: string, errors?: string[]) {
    super(message);
    this.errors = errors;
  }
}

class TokenError extends Error {
  errors?: string[];
  constructor(message: string, errors?: string[]) {
    super(message);
    this.errors = errors;
  }
}

type TokenResponse = {
  token: string;
  identity: string;
  errors: string[];
};

/**
 * @abstract Returns an array with formatted errors
 * @param req
 * @returns
 */
const queryRuntimeCheck = (req: Request, expectedKeys: string[]): string[] => {
  const presentKeys = R.keys(req.query);

  if (presentKeys.length != expectedKeys.length) {
    // Return an array with formatted errors
    return R.map(
      (q: string | number) => `the query param '${q}' must be present`,
      R.difference(expectedKeys, presentKeys)
    );
  }

  return [];
};

type TokenQueryParams = {
  roomName: string;
  identity: string;
  name: string;
  metadata: string;
};

export const getTokenHandler: RequestHandler<
  {},
  Partial<TokenResponse>,
  any,
  TokenQueryParams
> = (req, res) => {
  try {
    const errors = queryRuntimeCheck(req, [
      "roomName",
      "identity",
      "name",
      "metadata",
    ] as (keyof TokenQueryParams)[]);
    if (errors.length > 0) {
      throw new TokenError("Some params were not present", errors);
    }

    const {roomName, identity, name, metadata} = req.query;
    const roomPattern = /\w{4}\-\w{4}/;
    const matches = R.match(roomPattern, roomName);
    if (R.isEmpty(matches)) {
      throw new TokenError("Wrong room name", [
        `The room name '${roomName}' you provided must be in the following format: wwww-wwww`,
      ]);
    }

    const grant: VideoGrant = {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    };

    const token = createToken({identity, name, metadata}, grant);
    const response: Partial<TokenResponse> = {
      identity,
      token,
    };

    res.status(200).json(response).end();
  } catch (error) {
    const te = error as TokenError;
    res.statusMessage = te.message;
    res
      .status(403)
      .json({
        errors: te.errors,
      })
      .end();
  }
};

type UrlResponse = {
  url: string;
  errors: string[];
};

type UrlQueryParams = {
  region: string;
};

export const getServerUrlHandler: RequestHandler<
  {},
  Partial<UrlResponse>,
  any,
  UrlQueryParams
> = (req, res) => {
  try {
    const errors = queryRuntimeCheck(req, [
      "region",
    ] as (keyof UrlQueryParams)[]);
    if (R.not(R.isEmpty(errors))) {
      throw new EmptyQueryParams("Query params missing", errors);
    }

    const url = getLiveKitUrl(req.query.region);
    res
      .status(200)
      .json({
        url,
      })
      .end();
  } catch (error) {
    const gue = error as EmptyQueryParams;
    res.statusMessage = gue.message;
    res
      .status(403)
      .json({
        errors: gue.errors,
      })
      .end();
  }
};
