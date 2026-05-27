import type { ComponentProps } from "react";
import { Link, useLocation } from "react-router-dom";

type NavLinkProps = ComponentProps<typeof Link>

export function NavLink(props: NavLinkProps) {

  const { pathname } = useLocation()

  return (
    <Link
      {...props}
      data-current={pathname === props.to}
      className="flex items-center gap-3 px-3 py-1.5 text-sm font-medium text-zinc-50 transition-all data-[current=true]:bg-zinc-800 data-[current=true]:rounded-lg data-[current=true]:text-zinc-50"
    />
  )
}