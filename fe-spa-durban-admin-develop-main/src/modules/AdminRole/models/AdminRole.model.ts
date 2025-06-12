export type AdminRole = {
  roleName: string;
  _id: string;
  createdAt:Date;
};

export type AdminRoleFormValues = {
  roleName: string;
  modules: string[];
};
