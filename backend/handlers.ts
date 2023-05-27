import {Request, RequestHandler, Response} from "express";
import createToken from "./token";
import R from "ramda";
import {VideoGrant} from "livekit-server-sdk";

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

type QueryParams = {
  roomName: string;
  identity: string;
  name: string;
  metadata: string;
};

/**
 * @abstract Returns an array with formatted errors
 * @param req
 * @returns
 */
const queryPresenceCheck = (req: Request): string[] => {
  const expectedKeys: (keyof QueryParams)[] = [
    "roomName",
    "identity",
    "name",
    "metadata",
  ];
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

export const getTokenHandler: RequestHandler<
  {},
  Partial<TokenResponse>,
  any,
  QueryParams
> = (req, res) => {
  try {
    const errors = queryPresenceCheck(req);
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
