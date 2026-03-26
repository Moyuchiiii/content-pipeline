#!/usr/bin/env python3
"""
PostToolUse フック: 記事ファイル書き込み直後に品質を自動チェックする。
disler/claude-code-hooks-mastery のパターンを content-pipeline 向けに実装。

チェック項目:
- 文字数（最低ライン）
- 見出し（h2 or ## の存在）
- ソース・URL の存在（deep_research 系記事）
- AI 定型フレーズの混入
"""

import json
import sys
import re
import os

def check_article(file_path: str, content: str) -> list[str]:
    """記事品質チェック。問題点のリストを返す。"""
    issues = []

    # ドラフトファイル以外はスキップ
    if "drafts" not in file_path:
        return issues

    # .md ファイルのみ対象（.html はスキップ）
    if not file_path.endswith(".md"):
        return issues

    # --- 文字数チェック ---
    char_count = len(content.replace(" ", "").replace("\n", ""))
    if char_count < 500:
        issues.append(f"文字数が少なすぎます（{char_count}字）。速報でも800字以上を目安に。")

    # --- 見出しチェック ---
    has_h2_md = bool(re.search(r"^##\s+\S", content, re.MULTILINE))
    has_h2_html = bool(re.search(r"<h2[^>]*>", content))
    if not has_h2_md and not has_h2_html:
        issues.append("見出し（## または <h2>）が存在しません。セクション分けをしてください。")

    # --- AI 定型フレーズチェック ---
    ai_phrases = [
        "〜と言えるでしょう",
        "〜ではないでしょうか",
        "〜と考えられます",
        "非常に重要です",
        "効果的に活用",
        "積極的に取り組",
        "様々な観点から",
        "包括的に",
    ]
    found_phrases = [p for p in ai_phrases if p in content]
    if found_phrases:
        issues.append(f"AI 定型フレーズが混入しています: {', '.join(found_phrases)}")

    # --- ソースチェック（ノウハウ・速報記事向け）---
    is_knowhow_or_sokuho = "knowhow" in file_path or "sokuho" in file_path
    if is_knowhow_or_sokuho:
        has_url = bool(re.search(r"https?://", content))
        has_source_tag = "✅" in content or "🔶" in content
        if not has_url and not has_source_tag:
            issues.append("ソース URL または信頼度タグ（✅/🔶）が見当たりません。根拠を明記してください。")

    # --- フロントマター存在チェック ---
    if not content.startswith("---"):
        issues.append("フロントマター（--- で始まるメタ情報）がありません。title, type, price, tags, created を付与してください。")

    return issues


def main():
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        sys.exit(0)

    tool_name = data.get("tool_name", "")
    if tool_name != "Write":
        sys.exit(0)

    tool_input = data.get("tool_input", {})
    file_path = tool_input.get("file_path", "")
    content = tool_input.get("content", "")

    if not file_path or not content:
        sys.exit(0)

    issues = check_article(file_path, content)

    if issues:
        print(json.dumps({
            "decision": "block",
            "reason": "【品質チェック失敗】以下の問題を修正してから再保存してください:\n" + "\n".join(f"- {i}" for i in issues)
        }, ensure_ascii=False))
        sys.exit(2)

    sys.exit(0)


if __name__ == "__main__":
    main()
