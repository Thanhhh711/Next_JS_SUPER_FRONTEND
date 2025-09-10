/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAppContext } from "@/components/app-provider";
import { Role } from "@/constants/type";
import { handleErrorApi } from "@/lib/utils";
import { useGuestLogoutMutation } from "@/queries/useGuest";
import { RoleType } from "@/types/jwt.types";
import Link from "next/link";
import { useRouter } from "next/navigation";

const menuItems: {
  title: string;
  href: string;
  role?: RoleType[];
  hideWhenLogin?: boolean;
}[] = [
  {
    title: "home",
    href: "/",
  },
  {
    title: "menu",
    href: "/guest/menu",
    role: [Role.Guest],
  },
  {
    title: "orders",
    href: "/guest/orders",
    role: [Role.Guest],
  },
  {
    title: "login",
    href: "/login",
    hideWhenLogin: true,
  },
  {
    title: "manage",
    href: "/manage/dashboard",
    role: [Role.Owner, Role.Employee],
  },
];

// Server trả về mons ăn, đăng nhập. Do server không biết trạng thái của client
//CLient: Đầu tiên hiển thị món ăn, đăng nhập
// nhưng ngay sau đó client hiện ra món ăn, đơn hàng , quản lý do là đã check được trạng thái đăng nhập
// lúc này server vẫn chưa biết do là trạng thái đăng nhập của user do chưa check cookie
export default function NavItems({ className }: { className?: string }) {
  const { role } = useAppContext();
  const logoutMutation = useGuestLogoutMutation();
  const router = useRouter();
  const logout = async () => {
    if (logoutMutation.isPending) return;
    try {
      await logoutMutation.mutateAsync();

      router.push("/");
    } catch (error: any) {
      handleErrorApi({
        error,
      });
    }
  };

  return (
    <>
      {menuItems.map((item) => {
        // trường hợp đăng nhập chỉ hiển thị menu đăng nhập
        const isAuth = item.role && role && item.role.includes(role);
        // Trường hợp menu item hiển thị dù đã đăng nhập hay chưa
        const canShow = (item.role === undefined && !item.hideWhenLogin) || (!role && item.hideWhenLogin);

        if (isAuth || canShow) {
          return (
            <Link href={item.href} key={item.href} className={className}>
              {item.title}
            </Link>
          );
        }
        return null;
      })}

      {role && (
        <div className={className} onClick={logout}>
          Đăng xuất
        </div>
      )}
    </>
  );
}
