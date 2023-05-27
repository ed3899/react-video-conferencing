import { Request } from "express";
import R from "ramda";

/**
 * @abstract Gets either a normal live kit url or one region based
 * @param region
 * @returns
 */
export function getLiveKitUrl(region: string | string[]): string {
  const correctEnvVar = R.ifElse(
    R.is(Array),
    () => `LIVEKIT_URL_${String(R.__)}`.toUpperCase(),
    () => "LIVEKIT_URL"
  );

  const envVar = correctEnvVar(region);
  const url = process.env[envVar];
  const urlIsEmpty = R.or(R.isEmpty(url), R.isNil(url));
  if (urlIsEmpty) {
    throw new Error(`${envVar} is not defined`);
  }

  return url!;
}

/**
 * @abstract Returns an array with formatted errors if the expected keys are not present
 * @param req
 * @returns
 */
export const queryRuntimeCheck = (req: Request, expectedKeys: string[]): string[] => {
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
