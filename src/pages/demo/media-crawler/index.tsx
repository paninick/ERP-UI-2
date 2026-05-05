import IframePage from '@/components/ui/IframePage';

export default function DemoMediaCrawlerPage() {
  return (
    <IframePage
      title="社媒爬取 MediaCrawler"
      subtitle="小红书 / 抖音 / B站 / 微博 · Python · 本地 http://localhost:8081"
      localUrl="http://localhost:8081"
      workDir="D:/ERP/external/MediaCrawler"
      startCmd="uv run uvicorn api.main:app --port 8081"
    />
  );
}
