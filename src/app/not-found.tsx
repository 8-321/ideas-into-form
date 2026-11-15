import Link from "next/link";

export default function NotFound() {
  return (
    <main className="chapter-page not-found">
      <section className="wrap not-found__inner">
        <p className="mono not-found__label">页面不存在</p>
        <h1 className="serif">这里没有这一页。</h1>
        <p className="not-found__lead">链接可能已经移动，或地址输入有误。</p>
        <Link href="/" className="btn">回到首页</Link>
      </section>
    </main>
  );
}