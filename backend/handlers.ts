import {Request, RequestHandler, Response} from "express";
import createToken from "./token";
import R from "ramda";
import {VideoGrant} from "livekit-server-sdk";

type TokenResponse = {
  token: string;
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
  const errors = queryPresenceCheck(req as any);
  if (errors.length > 0) {
    res.status(403).json({
      errors,
    });
    return;
  }

  const roomName = req.query.roomName;
  const roomPattern = /\w{4}\-\w{4}/;
  const matches = R.match(roomPattern, roomName);

  if (R.isEmpty(matches)) {
    res.status(403).json({
      errors: [
        `The room name '${roomName}' you provided must be in the following format: wwww-wwww`,
      ],
    });
    return;
  }
};
