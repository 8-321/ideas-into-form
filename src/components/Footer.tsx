import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__top">
          <p className="footer__statement">从想法出发，<br />让创造拥有形态。</p>
          <nav className="footer__links" aria-label="章节链接">
            <Link href="/image/">成象</Link>
            <Link href="/sound/">成声</Link>
            <Link href="/experience/">成境</Link>
          </nav>
        </div>
        <div className="footer__word serif" aria-hidden="true">由意成形</div>
        <div className="footer__bottom mono">
          <span>个人作品集 · 2026</span>
          <span>作品素材由创作者提供 · 智能辅助内容已在项目页标注</span>
          <span>由意成形</span>
        </div>
      </div>
    </footer>
  );
}