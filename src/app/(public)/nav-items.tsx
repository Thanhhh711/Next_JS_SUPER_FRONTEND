"use client";

import { useAppContext } from "@/components/app-provider";
import Link from "next/link";

const menuItems = [
  {
    title: "Món ăn",
    href: "/menu", // authRequired = undefined là nghĩa đăng nhập ha chưa đều sẽ hiển thị
  },
  {
    title: "Đơn hàng",
    href: "/orders",
    authRequired: true,
  },
  {
    title: "Đăng nhập",
    href: "/login",
    authRequired: false, // khi false nghĩa là chưa đăng nhập sẽ hiển thị
  },
  {
    title: "Quản lý",
    href: "/manage/dashboard",
    authRequired: true, // đăng nhập rồi mới hiển thị
  },
];

// Server trả về mons ăn, đăng nhập. Do server không biết trạng thái của client
//CLient: Đầu tiên hiển thị món ăn, đăng nhập
// nhưng ngay sau đó client hiện ra món ăn, đơn hàng , quản lý do là đã check được trạng thái đăng nhập
// lúc này server vẫn chưa biết do là trạng thái đăng nhập của user do chưa check cookie
export default function NavItems({ className }: { className?: string }) {
  const { isAuth } = useAppContext();

  return menuItems.map((item) => {
    if ((item.authRequired === false && isAuth) || (item.authRequired === true && !isAuth)) return null;
    return (
      <Link href={item.href} key={item.href} className={className}>
        {item.title}
      </Link>
    );
  });
}
