#!/usr/bin/env python3
"""
Stop フック: セッション終了後に学習キャプチャを context/content-memory.md に自動追記。
vinicius91carvalho/.claude の compound パターンを content-pipeline 向けに実装。
"""
import sys
import json
import os
from datetime import datetime

def main():
    try:
        hook_data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)

    # stop_reason が tool_use の場合はスキップ（中断時）
    stop_reason = hook_data.get("stop_reason", "")
    session_id = hook_data.get("session_id", "")

    # content-pipeline ディレクトリ内の作業か確認
    cwd = os.getcwd()
    if "content-pipeline" not in cwd:
        sys.exit(0)

    memory_path = os.path.join(cwd, "context", "content-memory.md")
    if not os.path.exists(memory_path):
        sys.exit(0)

    # セッションで書き込まれたドラフトファイルを検索
    drafts_dir = os.path.join(cwd, "note", "drafts")
    x_drafts_dir = os.path.join(cwd, "x", "drafts")

    today = datetime.now().strftime("%Y-%m-%d %H:%M")

    # 今日の日付で新しいドラフトがあるか確認
    today_date = datetime.now().strftime("%Y%m%d")
    new_drafts = []

    for root, dirs, files in os.walk(drafts_dir):
        for f in files:
            if today_date in f and f.endswith(".md"):
                new_drafts.append(os.path.join(root, f))

    for root, dirs, files in os.walk(x_drafts_dir):
        for f in files:
            if today_date in f and f.endswith(".md"):
                new_drafts.append(os.path.join(root, f))

    if not new_drafts:
        sys.exit(0)

    # 改善メモの追記
    log_entry = f"\n### {today} セッション記録\n"
    log_entry += f"- 生成ドラフト: {', '.join([os.path.basename(d) for d in new_drafts])}\n"
    log_entry += "- 改善点: <!-- 手動で追記してください -->\n"
    log_entry += "- 次回試すこと: <!-- 手動で追記してください -->\n"

    with open(memory_path, "a", encoding="utf-8") as f:
        f.write(log_entry)

    print(f"[learning] {len(new_drafts)}件のドラフトを記録しました → context/content-memory.md")
    sys.exit(0)

if __name__ == "__main__":
    main()
