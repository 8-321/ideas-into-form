import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LightboxProvider } from "@/components/Lightbox";
import { MotionLayer } from "@/components/MotionLayer";
import { MotionProvider } from "@/components/MotionProvider";
import { SiteShell } from "@/components/SiteShell";
import { TransitionProvider } from "@/components/TransitionProvider";

export const metadata: Metadata = {
  title: {
    default: "由意成形 · IDEAS INTO FORM.",
    template: "%s · 由意成形",
  },
  description: "从想法出发，让创造拥有形态。一个以原点为视觉线索的个人数字创意作品档案馆。",
  applicationName: "由意成形",
  authors: [{ name: "PERSONAL PORTFOLIO" }],
  keywords: ["由意成形", "IDEAS INTO FORM", "作品集", "视觉设计", "IP", "影像", "声音"],
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "由意成形 · IDEAS INTO FORM.",
    description: "从想法出发，让创造拥有形态。",
    type: "website",
    locale: "zh_CN",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F2EC" },
    { media: "(prefers-color-scheme: dark)", color: "#151719" },
  ],
  width: "device-width",
  initialScale: 1,
};

const init = `(function(){try{var p=location.pathname;var t=(p.indexOf('/sound')===0||p.indexOf('/work/audio')===0)?'sound':((p.indexOf('/experience')===0||p.indexOf('/work/film')===0)?'experience':((p.indexOf('/image')===0||p.indexOf('/work/')===0)?'image':'home'));document.documentElement.dataset.theme=t;var m=localStorage.getItem('iif-motion');var r=m==='off'||(m===null&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);document.documentElement.dataset.reduce=r?'true':'false';document.documentElement.classList.add('js');}catch(e){document.documentElement.classList.add('js')}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/fonts/noto-serif-sc.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/noto-sans-sc.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <script id="iif-init" dangerouslySetInnerHTML={{ __html: init }} />
      </head>
      <body suppressHydrationWarning>
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important}.split-line>span{transform:none!important}.stagger>*{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <MotionProvider>
          <TransitionProvider>
            <LightboxProvider>
              <SiteShell>{children}</SiteShell>
              <MotionLayer />
            </LightboxProvider>
          </TransitionProvider>
        </MotionProvider>
      </body>
    </html>
  );
}