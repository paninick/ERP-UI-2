import IframePage from '@/components/ui/IframePage';

// ECommerceCrawlers 是纯脚本集合，没有 Web UI
// 用 IframePage 指向一个本地说明页，或直接展示 GitHub README
export default function DemoEcommerceCrawlerPage() {
  return (
    <IframePage
      title="数据爬虫 ECommerceCrawlers"
      subtitle="淘宝 / 微博 / 招聘 / 点评等多平台爬虫脚本集合 · Python"
      localUrl="http://localhost:3011"
      onlineUrl="https://github.com/DropsDevopsOrg/ECommerceCrawlers"
      workDir="D:/ERP/external/ECommerceCrawlers"
      startCmd="# 各子目录独立运行，例：cd TaobaoCrawler && pip install -r requirements.txt && python main.py"
    />
  );
}
