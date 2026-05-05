import IframePage from '@/components/ui/IframePage';

export default function DemoMaterialCrawlerPage() {
  return (
    <IframePage
      title="素材爬虫"
      subtitle="图片 / 视频素材批量抓取 · Python · 本地 http://localhost:3012"
      localUrl="http://localhost:3012"
      workDir="D:/ERP/external/ECommerceCrawlers"
      startCmd="# 素材爬虫脚本，各子目录独立运行"
    />
  );
}
