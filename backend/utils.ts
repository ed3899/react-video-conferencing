import R from "ramda";

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
