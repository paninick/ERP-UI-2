import IframePage from '@/components/ui/IframePage';

export default function DemoRuoyiAppPage() {
  return (
    <IframePage
      title="若依移动端"
      subtitle="RuoYi-App · UniApp · H5 模式 · 本地 http://localhost:3014"
      localUrl="http://localhost:3014"
      workDir="D:/ERP/external/RuoYi-App"
      startCmd="# 需 HBuilderX 打开项目，运行到浏览器（H5 模式），默认端口 8080 或自定义"
    />
  );
}
