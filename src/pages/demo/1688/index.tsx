import IframePage from '@/components/ui/IframePage';

export default function Demo1688Page() {
  return (
    <IframePage
      title="1688 平台爬取"
      subtitle="1688 商品 / 供应商数据抓取 · Python 脚本"
      localUrl="http://localhost:3013"
      onlineUrl="https://github.com/DropsDevopsOrg/ECommerceCrawlers"
      workDir="D:/ERP/external/ECommerceCrawlers"
      startCmd="# 参考 TaobaoCrawler(new) 目录，支持 1688 数据抓取"
    />
  );
}
