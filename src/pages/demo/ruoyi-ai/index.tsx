import IframePage from '@/components/ui/IframePage';

export default function DemoRuoyiAiPage() {
  return (
    <IframePage
      title="AI 助手平台 RuoYi-AI"
      subtitle="企业级 AI 助手 · 多智能体 / RAG / 工作流 · 在线 Demo 可直接体验"
      localUrl="http://localhost:5666"
      onlineUrl="https://admin.pandarobot.chat"
      workDir="D:/ERP/external/ruoyi-ai"
      startCmd="# 需 Java 17 + MySQL + Redis，参考 docs/ 目录部署文档"
    />
  );
}
