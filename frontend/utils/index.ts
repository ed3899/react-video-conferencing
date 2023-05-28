import * as R from "ramda";

export function isPresent(arg: unknown) {
  return R.not(R.or(R.isNil(arg), R.isEmpty(arg)));
}
