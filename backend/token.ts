import * as dotenv from "dotenv";
import {AccessToken} from "livekit-server-sdk";
import type {AccessTokenOptions, VideoGrant} from "livekit-server-sdk";

dotenv.config();

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;

const createToken = (userInfo: AccessTokenOptions, grant: VideoGrant) => {
  const at = new AccessToken(apiKey, apiSecret, userInfo);
  at.ttl = "5m";
  at.addGrant(grant);
  return at.toJwt();
};

export default createToken
