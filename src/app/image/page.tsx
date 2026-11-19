import type { Metadata } from "next";
import "./image.css";
import "./image-book.css";
import { ImageBook } from "@/components/image/ImageBook";
import { IMAGE_FOLDERS } from "@/content/imageArchive";

export const metadata: Metadata = {
  title: "成象 · 视觉档案",
  description: "成象作品档案：封面与主题、角色与人物、校园与空间、图文与编排、绘画与造型、数字创意、界面与系统。",
};

export default function ImageChapterPage() {
  return (
    <div className="chapter-page image-chapter">
      <ImageBook folders={IMAGE_FOLDERS} />
    </div>
  );
}
