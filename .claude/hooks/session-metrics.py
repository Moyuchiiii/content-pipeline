#!/usr/bin/env python3
"""
Stop フック: セッションのメトリクス（コスト・所要時間・生成ドラフト情報）を記録。
CloudAI-X/claude-workflow-v2 のセッションメトリクスパターンを content-pipeline 向けに実装。
"""
import sys
import json
import os
from datetime import datetime

METRICS_PATH = "logs/session-metrics.jsonl"

def main():
    try:
        hook_data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)

    cwd = os.getcwd()
    if "content-pipeline" not in cwd:
        sys.exit(0)

    # ログディレクトリ作成
    logs_dir = os.path.join(cwd, "logs")
    os.makedirs(logs_dir, exist_ok=True)

    metrics = {
        "timestamp": datetime.now().isoformat(),
        "session_id": hook_data.get("session_id", ""),
        "total_cost_usd": hook_data.get("total_cost_usd", 0),
        "usage": hook_data.get("usage", {}),
        "stop_reason": hook_data.get("stop_reason", ""),
    }

    # 今日生成したドラフトの文字数カウント
    today_date = datetime.now().strftime("%Y%m%d")
    draft_stats = []

    for root, dirs, files in os.walk(os.path.join(cwd, "note", "drafts")):
        for f in files:
            if today_date in f and f.endswith(".md"):
                filepath = os.path.join(root, f)
                try:
                    content = open(filepath, encoding="utf-8").read()
                    draft_stats.append({
                        "file": f,
                        "chars": len(content),
                    })
                except Exception:
                    pass

    metrics["drafts"] = draft_stats

    metrics_file = os.path.join(cwd, METRICS_PATH)
    with open(metrics_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(metrics, ensure_ascii=False) + "\n")

    if metrics["total_cost_usd"]:
        print(f"[metrics] コスト: ${metrics['total_cost_usd']:.4f} / ドラフト: {len(draft_stats)}件")

    sys.exit(0)

if __name__ == "__main__":
    main()
