import { AccountResType, ChangePasswordBodyType, UpdateMeBodyType } from "@/schemaValidations/account.schema";
import http from "../lib/http";

const accountApiRequest = {
  me: () => http.get<AccountResType>("/accounts/me"),
  updateMe: (body: UpdateMeBodyType) => http.put<AccountResType>("/accounts/me", body),
  changePassword: (body: ChangePasswordBodyType) => http.put("/accounts/change-password", body),
};

export default accountApiRequest;
