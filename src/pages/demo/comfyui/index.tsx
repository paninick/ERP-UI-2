import IframePage from '@/components/ui/IframePage';

export default function DemoComfyUIPage() {
  return (
    <IframePage
      title="电商自动化 ComfyUI"
      subtitle="ComfyUI 工作流 · 本地 http://localhost:8188"
      localUrl="http://localhost:8188"
      workDir="D:/ERP/external/ComfyUI-"
      startCmd="# 需先安装 ComfyUI 本体，然后加载 D:/ERP/external/ComfyUI-/ 中的工作流 JSON"
    />
  );
}
