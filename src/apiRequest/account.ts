import {
  AccountListResType,
  AccountResType,
  ChangePasswordBodyType,
  ChangePasswordV2ResType,
  CreateEmployeeAccountBodyType,
  UpdateEmployeeAccountBodyType,
  UpdateMeBodyType,
} from "@/schemaValidations/account.schema";
import http from "../lib/http";

const prefix = "/accounts";

const accountApiRequest = {
  me: () => http.get<AccountResType>(`${prefix}/me`),
  updateMe: (body: UpdateMeBodyType) => http.put<AccountResType>(`${prefix}/me`, body),
  changePassword: (body: ChangePasswordBodyType) =>
    http.put<ChangePasswordV2ResType>(`${prefix}/change-password`, body),

  list: () => http.get<AccountListResType>(`${prefix}`),
  addEmployee: (body: CreateEmployeeAccountBodyType) => http.post<AccountResType>(prefix, body),
  updateEmployee: (id: number, body: UpdateEmployeeAccountBodyType) =>
    http.put<AccountResType>(`${prefix}/detail/${id}`, body),
  getEmployee: (id: number) => http.get<AccountResType>(`${prefix}/detail/${id}`),
  deleteEmployee: (id: number) => http.delete<AccountResType>(`${prefix}/detail/${id}`),
};

export default accountApiRequest;
