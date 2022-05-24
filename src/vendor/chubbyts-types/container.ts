export type Container = {
  get: <T>(id: string) => T;
  has: (id: string) => boolean;
};
