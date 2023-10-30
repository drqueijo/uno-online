/* eslint-disable @typescript-eslint/no-explicit-any */
import { type z } from "zod";

export type ApiResponse<T> = {
  error: boolean;
  message: string;
  reponse: T;
};

export const apiResponse = <T>(
  entety: T,
  validator: z.SafeParseReturnType<any, any>,
  successMessage: string
): ApiResponse<T> => {
  let message = "";
  let error = false;
  if (validator.success) message = successMessage;
  if (!validator.success) {
    message = validator.error.issues[0]?.message ?? "";
    error = true;
  }

  return {
    reponse: entety,
    message,
    error,
  };
};
