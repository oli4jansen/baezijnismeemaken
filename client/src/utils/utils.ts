/**
 * Given an array of objects, will 
 */
export const groupBy = (array: { [key: string | number]: any }[], key: string | number): { [key: string | number]: any[] } => {
  return array.reduce((acc, cur) => {
    (acc[cur[key]] = acc[cur[key]] || []).push(cur);
    return acc;
  }, {});
};
