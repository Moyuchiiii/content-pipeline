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

def check_brain_article(file_path: str, content: str) -> list[str]:
    """Brain 記事向けの厳格チェック。問題点のリストを返す。

    Brain は商品としての信頼性が命。tiptap マーク継続バグ対策 + 誇大表現禁止 +
    章番号禁止（自動目次二重化対策）+ 禁止タグ（ul/ol/table は Brain で崩れる）を強制する。
    """
    issues = []

    # brain/ 配下の html/md のみ対象
    if "brain/" not in file_path.replace("\\", "/"):
        return issues
    if not (file_path.endswith(".html") or file_path.endswith(".md")):
        return issues

    # --- 1. 誇大表現（景表法リスク + Brain レビュー即悪化）---
    exaggerations = [
        "誰でも稼げ", "必ず稼げ", "絶対稼げ", "確実に稼げ",
        "再現性100%", "再現性 100%", "世界初", "最強", "最速",
        "収入保証", "月収保証", "知らないと損", "知らないと危険",
        "1日5分で月", "1日10分で月", "1日30分で月",
    ]
    found_exagg = [w for w in exaggerations if w in content]
    if found_exagg:
        issues.append(f"【brain 誇大表現】禁止ワード検出: {', '.join(found_exagg)}（景表法リスク＋Brainレビュー即悪化）")

    # --- 2. 章番号禁止（Brain 自動目次と二重化する）---
    number_violations = []
    if re.search(r'<h2[^>]*>\s*第[0-9０-９]+章', content):
        number_violations.append('h2「第N章」')
    if re.search(r'<h[23][^>]*>\s*[0-9]+-[0-9]+\.', content):
        number_violations.append('「1-1.」「2-3.」階層番号')
    if re.search(r'<h3[^>]*>\s*Q[0-9]+\.', content):
        number_violations.append('FAQ「Q1.」番号')
    if re.search(r'<h2[^>]*>\s*Bonus\s+[0-9]', content):
        number_violations.append('「Bonus N」番号')
    if re.search(r'<h3[^>]*>\s*B[0-9]+-[0-9]+\.', content):
        number_violations.append('「B1-1.」Bonus階層番号')
    if number_violations:
        issues.append(f"【brain 章番号】自動目次と二重化する番号検出: {', '.join(number_violations)}")

    # --- 3. 禁止タグ（Brain エディタで崩れる）---
    forbidden_tags = []
    for tag in ['<ul>', '<ol>', '<table>', '<li>', '<tr>', '<td>']:
        if tag in content:
            forbidden_tags.append(tag)
    if forbidden_tags:
        issues.append(f"【brain 禁止タグ】Brain で崩れるタグ検出: {', '.join(forbidden_tags)}（「・ 項目」段落 or blockquote で代替）")

    # --- 4. 段落中間の <b>/<strong>（tiptap マーク継続バグで全段落太字化）---
    # <p>テキスト5字以上<b> or <strong> のパターン検出
    partial_bold = re.findall(r'<p>[^<]{5,}<(?:b|strong)>', content)
    if partial_bold:
        issues.append(f"【brain tiptap バグ】段落中間の <b>/<strong> {len(partial_bold)} 箇所検出。Ctrl+V で以降全段落太字化するバグ発動。独立段落に分離して `<p><strong>全文</strong></p>` 形式に")

    # --- 5. blockquote 連続3個以上（スマホで読みにくい目次型）---
    # </blockquote> 直後に空白+<blockquote> が 2 回以上連続 = 3 個連続以上
    consecutive_bq_count = len(re.findall(r'</blockquote>\s*<blockquote>\s*(?:<b>)?[^<]+(?:</b>)?\s*(?:<br>)?\s*[^<]+\s*</blockquote>\s*<blockquote>', content, re.DOTALL))
    if consecutive_bq_count >= 1:
        issues.append(f"【brain blockquote 連続】3 個以上の連続 blockquote 検出。目次的連続はスマホで読みにくい。`<p><strong>タイトル</strong></p><p>概要</p>` 段落形式で代替")

    return issues


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

    issues = []

    # note 系ドラフトチェック（既存）
    issues.extend(check_article(file_path, content))

    # brain 系チェック（新規・tiptap バグ対策 + Brain 特化ルール）
    issues.extend(check_brain_article(file_path, content))

    if issues:
        print(json.dumps({
            "decision": "block",
            "reason": "【品質チェック失敗】以下の問題を修正してから再保存してください:\n" + "\n".join(f"- {i}" for i in issues)
        }, ensure_ascii=False))
        sys.exit(2)

    sys.exit(0)


if __name__ == "__main__":
    main()
