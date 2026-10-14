# 四六级背单词

Vue3 + Spring Boot + MySQL + Ollama 的记忆型背单词应用，算法基于 SM-2 间隔重复。

## 功能
- 四六级词库（3920 词，CET4/CET6 标注）
- SM-2 间隔重复算法，按遗忘曲线推送复习
- 熟词/生词标记，状态持久化
- AI 问答（Ollama 流式输出）

## 快速启动（Docker）
docker compose up -d
docker exec cet-ollama ollama pull qwen2.5:3b
访问 http://localhost:5173

## 本地开发
后端：IDEA 运行 CetVocabBackendApplication（需要本地 MySQL + Ollama）
前端：npm install && npm run dev
