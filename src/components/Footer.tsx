import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__top">
          <nav className="footer__links" aria-label="章节链接">
            <Link href="/image/">成象</Link>
            <Link href="/sound/">成声</Link>
            <Link href="/experience/">成境</Link>
          </nav>
        </div>
        <div className="footer__word serif" aria-hidden="true">由意成形</div>
        <div className="footer__bottom mono">
          <span>个人作品集 · 2026</span>
          <span>由意成形</span>
        </div>
      </div>
    </footer>
  );
}