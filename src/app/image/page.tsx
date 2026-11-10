import type { Metadata } from "next";
import "./image.css";
import "./catalog.css";
import { ImageGallery } from "@/components/image/ImageGallery";
import { ArrowRight } from "@/components/Icons";
import { TransitionLink } from "@/components/TransitionLink";
import { IMAGE_FOLDERS } from "@/content/imageArchive";

export const metadata: Metadata = {
  title: "01 成象 / IMAGE",
  description: "成象作品档案：封面与主题、IP 与人物、校园与空间、图文与编排、绘画与造型、数字创意、界面与系统。",
};

export default function ImageChapterPage() {
  return (
    <div className="chapter-page image-chapter">
      <ImageGallery folders={IMAGE_FOLDERS} />
      <div className="wrap image-next">
        <TransitionLink href="/sound/" className="image-next__link">
          <span className="mono">NEXT CHAPTER / 02</span>
          <span className="image-next__title">成声 <em className="display">SOUND</em></span>
          <ArrowRight />
        </TransitionLink>
      </div>
    </div>
  );
}
