"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { Icon } from "./Icon";
const navLinks = [
  { href: "/", label: "Yozish testi", icon: "keyboard" },
  { href: "/analytics", label: "Analitika", icon: "chart" },
  { href: "/leaderboard", label: "Reyting", icon: "trophy" },
  { href: "/profile", label: "Mening profilim", icon: "user" },
  { href: "/settings", label: "Sozlamalar", icon: "settings" },
];
export function Navbar() {
  const { user, loading, loginUrl, logout } = useAuth();
  const pathname = usePathname();
  const helpRef = useRef<HTMLDialogElement>(null);
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const revealCurrentPage = () => {
      const active = nav.querySelector<HTMLElement>(".active");
      if (!active || nav.scrollWidth <= nav.clientWidth) return;
      const item = active.getBoundingClientRect();
      nav.scrollLeft +=
        item.left -
        nav.getBoundingClientRect().left -
        (nav.clientWidth - item.width) / 2;
    };
    const observer = new ResizeObserver(revealCurrentPage);
    observer.observe(nav);
    revealCurrentPage();
    return () => observer.disconnect();
  }, [pathname, user?.role]);
  const title =
    navLinks.find((l) => l.href === pathname)?.label ??
    (pathname === "/admin" ? "Boshqaruv paneli" : "Xush kelibsiz");
  return (
    <>
      <aside className="sidebar">
        <Link href="/" className="brand" aria-label="Yozaver uz bosh sahifa">
          <span className="brand-symbol">
            y<span>.</span>
          </span>
          <span>
            yozaver<span className="brand-domain">.uz</span>
          </span>
        </Link>
        <div className="sidebar-label">SIZNING MAYDONINGIZ</div>
        <nav
          ref={navRef}
          className="sidebar-nav"
          aria-label="Asosiy navigatsiya"
        >
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? "page" : undefined}
              className={`nav-item ${pathname === l.href ? "active" : ""}`}
            >
              <Icon name={l.icon} />
              <span>{l.label}</span>
              {pathname === l.href && <span className="nav-active-dot" />}
            </Link>
          ))}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className={`nav-item ${pathname === "/admin" ? "active" : ""}`}
            >
              <Icon name="shield" />
              <span>Boshqaruv</span>
            </Link>
          )}
        </nav>
        <div className="sidebar-bottom">
          <button
            className="nav-item help-link"
            aria-label="Qanday ishlaydi?"
            onClick={() => helpRef.current?.showModal()}
          >
            <Icon name="help" />
            <span>Qanday ishlaydi?</span>
          </button>
        </div>
      </aside>
      <header className="topbar">
        <div className="breadcrumb">
          Yozaver
          <Icon name="chevron" size={13} />
          <span>{title}</span>
        </div>
        <div className="topbar-actions">
          <span className="topbar-motto">
            <span className="online-dot" />
            O‘sish harflardan boshlanadi
          </span>
          {!loading && !user && (
            <a href={loginUrl} className="login-button">
              <span className="google-g">G</span>Kirish
              <Icon name="arrow" size={16} />
            </a>
          )}
          {user && (
            <>
              <Link
                href="/profile"
                className="header-avatar"
                aria-label="Profilim"
              >
                {user.name.slice(0, 1).toUpperCase()}
              </Link>
              <button
                className="icon-button"
                onClick={logout}
                aria-label="Hisobdan chiqish"
              >
                <Icon name="logout" size={17} />
              </button>
            </>
          )}
        </div>
      </header>
      <dialog
        ref={helpRef}
        className="help-dialog"
        onClick={(e) => {
          if (e.target === e.currentTarget) helpRef.current?.close();
        }}
      >
        <button
          className="icon-button dialog-close"
          aria-label="Yopish"
          onClick={() => helpRef.current?.close()}
        >
          <Icon name="close" />
        </button>
        <span className="feature-icon">
          <Icon name="keyboard" size={26} />
        </span>
        <h2>
          Yozishni boshlang.
          <br />
          Qolganini biz hisoblaymiz.
        </h2>
        <ol>
          <li>Til, test turi va davomiyligini tanlang.</li>
          <li>
            Ko‘rsatilgan so‘zlarni yozing. Birinchi harf bilan vaqt boshlanadi.
          </li>
          <li>Keyingi so‘zga o‘tish uchun bo‘sh joy tugmasini bosing.</li>
          <li>Natijangiz va tezlik grafigi avtomatik saqlanadi.</li>
        </ol>
        <p>
          <kbd>Esc</kbd> testni yangilaydi. <kbd>Tab</kbd> tugmalar orasida
          harakatlanadi. WPM — bir daqiqadagi so‘zlar tezligi; bir so‘z 5
          belgiga teng.
        </p>
        <button
          className="primary-button"
          onClick={() => helpRef.current?.close()}
        >
          Tushunarli
          <Icon name="check" size={17} />
        </button>
      </dialog>
    </>
  );
}
