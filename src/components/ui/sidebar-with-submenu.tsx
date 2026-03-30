"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  CircleHelp,
  CreditCard,
  Grid3X3,
  Layers3,
  Menu as MenuIcon,
  Package,
  Settings,
  X,
} from "lucide-react";

type MenuItem = {
  name: string;
  href: string;
  icon?: React.ReactNode;
};

type SidebarWithSubmenuProps = {
  userName?: string;
  userPlan?: string;
  userEmail?: string;
  avatarUrl?: string;
};

const CollapsibleMenu = ({
  children,
  items,
}: {
  children: React.ReactNode;
  items: MenuItem[];
}) => {
  const [isOpened, setIsOpened] = useState(false);
  const submenuId = useId();

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={() => setIsOpened((v) => !v)}
        aria-expanded={isOpened}
        aria-controls={submenuId}
      >
        <div className="flex items-center gap-2">{children}</div>
        <ChevronDown
          className={`size-4 transition-transform ${isOpened ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpened && (
        <ul id={submenuId} className="mx-4 mt-1 border-l pl-2 text-sm font-medium">
          {items.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="flex items-center gap-2 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.icon ? <span className="text-muted-foreground">{item.icon}</span> : null}
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function SidebarWithSubmenu({
  userName = "Alivika Tony",
  userPlan = "Hobby Plan",
  userEmail = "alivika@gmail.com",
  avatarUrl = "/images/avatar-placeholder.svg",
}: SidebarWithSubmenuProps) {
  const navigation: MenuItem[] = [
    { href: "#", name: "Overview", icon: <Grid3X3 className="size-4" /> },
    { href: "#", name: "Integration", icon: <Layers3 className="size-4" /> },
    { href: "#", name: "Plans", icon: <Package className="size-4" /> },
    { href: "#", name: "Transactions", icon: <CreditCard className="size-4" /> },
  ];

  const navsFooter: MenuItem[] = [
    { href: "#", name: "Help", icon: <CircleHelp className="size-4" /> },
    { href: "#", name: "Settings", icon: <Settings className="size-4" /> },
  ];

  const nestedNav: MenuItem[] = [
    { name: "Cards", href: "#" },
    { name: "Checkouts", href: "#" },
    { name: "Payments", href: "#" },
    { name: "Get paid", href: "#" },
  ];

  const menuRef = useRef<HTMLDivElement | null>(null);
  const profileButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isProfileActive, setIsProfileActive] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const profileMenuId = useId();

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsProfileActive(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-40 rounded-md border bg-background p-2 text-foreground shadow-sm sm:hidden"
        onClick={() => setIsMobileSidebarOpen((v) => !v)}
        aria-label="Toggle sidebar"
        aria-expanded={isMobileSidebarOpen}
      >
        {isMobileSidebarOpen ? <X className="size-5" /> : <MenuIcon className="size-5" />}
      </button>

      <nav
        className={`fixed left-0 top-0 z-30 h-full w-80 border-r bg-background transition-transform duration-200 sm:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col px-4">
          <div className="flex h-20 items-center pl-2">
            <div className="flex w-full items-center gap-4">
              <Image
                src={avatarUrl}
                className="size-10 rounded-full object-cover"
                alt="User avatar"
                width={40}
                height={40}
                unoptimized
              />
              <div>
                <span className="block text-sm font-semibold text-foreground">{userName}</span>
                <span className="block text-xs text-muted-foreground">{userPlan}</span>
              </div>

              <div className="relative ml-auto text-right" ref={menuRef}>
                <button
                  ref={profileButtonRef}
                  type="button"
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setIsProfileActive((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={isProfileActive}
                  aria-controls={profileMenuId}
                >
                  <ChevronDown className="size-5" aria-hidden="true" />
                </button>

                {isProfileActive && (
                  <div
                    id={profileMenuId}
                    role="menu"
                    className="absolute right-2 top-12 z-10 w-60 rounded-lg border bg-background text-sm text-muted-foreground shadow-md"
                  >
                    <div className="p-2 text-left">
                      <span className="block p-2 text-muted-foreground/80">{userEmail}</span>
                      <button
                        type="button"
                        className="block w-full rounded-md p-2 text-left transition-colors hover:bg-muted hover:text-foreground"
                        role="menuitem"
                      >
                        Add another account
                      </button>

                      <div className="relative rounded-md transition-colors hover:bg-muted">
                        <ChevronDown className="pointer-events-none absolute inset-y-0 right-1 my-auto size-4" />
                        <select className="w-full cursor-pointer appearance-none bg-transparent p-2 outline-none" defaultValue="">
                          <option value="" disabled hidden>
                            Theme
                          </option>
                          <option>Dark</option>
                          <option>Light</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        className="block w-full rounded-md p-2 text-left transition-colors hover:bg-muted hover:text-foreground"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-auto pb-4">
            <ul className="flex-1 text-sm font-medium">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <span className="text-muted-foreground">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              ))}

              <li>
                <CollapsibleMenu items={nestedNav}>
                  <CreditCard className="size-4 text-muted-foreground" />
                  Billing
                </CollapsibleMenu>
              </li>
            </ul>

            <div className="mt-2 border-t pt-2">
              <ul className="text-sm font-medium">
                {navsFooter.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <span className="text-muted-foreground">{item.icon}</span>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
