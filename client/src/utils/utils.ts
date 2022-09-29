export const groupBy = (xs: any[], key: string): { [key: string]: any[] } => {
  return xs.reduce((rv, x) => {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};
