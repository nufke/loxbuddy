export function isValidJSONObject(str: string) {
  let obj;
  try {
    obj = JSON.parse(str);
  } catch (e) {
    return false;
  }
  if (typeof obj === 'object') return true;
  else false;
}
