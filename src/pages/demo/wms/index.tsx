import IframePage from '@/components/ui/IframePage';

export default function DemoWmsPage() {
  return (
    <IframePage
      title="WMS 仓储管理系统"
      subtitle="RuoYi-WMS-VUE · Vue3 · 本地 http://localhost:3010"
      localUrl="http://localhost:3010"
      onlineUrl="https://wms.ichengle.top/"
      workDir="D:/ERP/external/RuoYi-WMS-VUE"
      startCmd="npm run dev -- --port 3010"
    />
  );
}
