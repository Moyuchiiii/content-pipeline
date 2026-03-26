#!/usr/bin/env python3
"""
UserPromptSubmit フック: /note-run や /x-run 実行時に関連スキル・コンテキストを自動サジェスト。
ChrisWiles/claude-code-showcase のスキル自動提案パターンを content-pipeline 向けに実装。
"""
import sys
import json
import os

SUGGESTIONS = {
    "note-run": [
        "context/writing-rules.md",
        "context/article-frameworks.md",
        "context/content-memory.md",
        "context/research-protocol.md",
    ],
    "x-run": [
        "context/x-hook-formulas.md",
        "context/voice-samples.md",
        "context/content-memory.md",
        "context/x-performance.md",
    ],
    "workflow-audit": [
        "context/content-memory.md",
        "logs/session-metrics.jsonl",
    ],
}

def main():
    try:
        hook_data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)

    prompt = hook_data.get("prompt", "").lower()
    cwd = os.getcwd()

    if "content-pipeline" not in cwd:
        sys.exit(0)

    matched = None
    for skill, files in SUGGESTIONS.items():
        if skill in prompt or f"/{skill}" in prompt:
            matched = (skill, files)
            break

    if not matched:
        sys.exit(0)

    skill_name, suggested_files = matched
    existing = [f for f in suggested_files if os.path.exists(os.path.join(cwd, f))]

    if existing:
        print(f"[{skill_name}] 関連ファイル: {', '.join(existing)}")

    sys.exit(0)

if __name__ == "__main__":
    main()
