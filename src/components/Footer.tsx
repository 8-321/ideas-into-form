import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__top">
          <p className="footer__statement">从想法出发，<br />让创造拥有形态。</p>
          <div className="footer__links">
            <Link href="/image/">01 成象 / IMAGE</Link>
            <Link href="/sound/">02 成声 / SOUND</Link>
            <Link href="/experience/">03 成境 / EXPERIENCE</Link>
          </div>
        </div>
        <div className="footer__word display" aria-hidden="true">
          IDEAS INTO <em>FORM.</em>
        </div>
        <div className="footer__bottom mono">
          <span>PERSONAL PORTFOLIO · 2026</span>
          <span>作品素材由创作者提供 · AI 辅助内容已在项目页标注</span>
          <span>由意成形 / IDEAS INTO FORM.</span>
        </div>
      </div>
    </footer>
  );
}