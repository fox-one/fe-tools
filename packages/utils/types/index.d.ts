declare module "fe-utils/types/utils" {
  export type SimplizeConfigs = Record<
    string,
    { precision: number; units: string[] }
  >;

  export type NumberUtilConfigs = {
    simplize: SimplizeConfigs;
  };
}
