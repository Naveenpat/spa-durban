declare module "joi-objectid" {
  import { AnySchema } from "joi";

  export default function joiObjectId(joi: any): AnySchema;
}
