/* eslint-disable @typescript-eslint/no-explicit-any */
import { type SafeParseReturnType } from "zod";

export class ZodError {
  public throw(schema: SafeParseReturnType<any, any>) {
    if (schema.success) return true;
    const { message, errors } = schema.error;
    let text = "";
    (text += message),
      errors.map((err) => {
        text += `${err.message}
      `;
      });
    throw new Error(text);
  }
}
