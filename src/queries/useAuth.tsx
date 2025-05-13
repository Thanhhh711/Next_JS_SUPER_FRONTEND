import authApiRequest from "@/apiRequest/auth";
import { LoginBodyType } from "@/schemaValidations/auth.schema";
import { useMutation } from "@tanstack/react-query";

export const useLoginAuth = () => {
  return useMutation({
    mutationFn: (body: LoginBodyType) => authApiRequest.login(body),
  });
};
