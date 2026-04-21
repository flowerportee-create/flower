"""
noteジェネレーター - 花屋・フローリスト向け有料note自動生成スクリプト

使い方:
  # ジャンルを指定して1本生成
  python generate_note.py --genre kasegikata --id 1

  # ジャンルを指定して全本生成
  python generate_note.py --genre business --all

  # 全ジャンル・全タイトルを一括生成
  python generate_note.py --all-genres

  # 利用可能なジャンルとタイトル一覧を表示
  python generate_note.py --list
"""

import anthropic
import json
import argparse
import re
from pathlib import Path
from typing import Optional

# ────────────────────────────────────────────
# パス設定
# ────────────────────────────────────────────
BASE_DIR = Path(__file__).parent.parent
TEMPLATES_DIR = BASE_DIR / "templates"
DATA_DIR = BASE_DIR / "data"
OUTPUT_DIR = BASE_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)
ALL100_FILE = DATA_DIR / "titles_all100.json"

# ────────────────────────────────────────────
# ジャンル定義
# ────────────────────────────────────────────
GENRES: dict[str, dict] = {
    "kasegikata": {
        "label": "副業・稼ぎ方系",
        "template_file": "kasegikata.md",
        "titles_file": "titles_kasegikata.json",
    },
    "mindset": {
        "label": "マインドセット・自己啓発系",
        "template_file": "mindset.md",
        "titles_file": "titles_mindset.json",
    },
    "business": {
        "label": "ビジネススキル系",
        "template_file": "business.md",
        "titles_file": "titles_business.json",
    },
    "health": {
        "label": "健康・美容系",
        "template_file": "health.md",
        "titles_file": "titles_health.json",
    },
    "goods": {
        "label": "おすすめ道具・グッズ系",
        "template_file": "goods.md",
        "titles_file": "titles_goods.json",
    },
}

# ────────────────────────────────────────────
# 共通システムプロンプト（キャッシュされる固定部分）
# ────────────────────────────────────────────
BASE_SYSTEM = """あなたはnoteで売れる有料記事を書く専門家です。
花屋・フローリストを目指す人の悩みを深く理解し、
具体的で実践的な記事を書きます。

## 守るべき文章スタイルルール
- 一文は60文字以内。短く切る
- 漢字率は30%以下。ひらがな多めで読みやすく
- 「〜です。〜ます。」の連続禁止。断定調と混ぜる
- 具体的な数字を必ず入れる（「たくさん」→「月収30万」）
- 冒頭3行で読者の痛みに触れる（フック）
- 箇条書きは5個以内
- CTAは「今すぐ」「限定」「残りわずか」を自然に使う
- 「あなた」「あなたも」の二人称を多用
- 情報商材っぽさを出さない（信頼性重視）
- スマホで読む前提（段落は短く）

## 品質基準
- 全体：3000〜8000字
- 無料パート：1500〜2500字（全体の約1/3）
- 有料パート：1500〜5500字（具体的な手順・テンプレート・数字）
- 冒頭フック：読者の悩みを言語化（3行以内）
- 構成：問題提起→原因分析→解決策→具体的手順→まとめ
- CTA：無料パートの最後に有料部分への誘導を自然に配置

## ターゲット読者
- 22〜60歳（ボリュームゾーンは20代後半〜30代女性）
- 花が好きで花の仕事に興味がある人
- スマホで読む"""


def load_genre(genre_key: str) -> tuple[str, list[dict]]:
    """ジャンルのテンプレートとタイトルリストを読み込む"""
    genre = GENRES[genre_key]
    template = (TEMPLATES_DIR / genre["template_file"]).read_text(encoding="utf-8")
    titles = json.loads((DATA_DIR / genre["titles_file"]).read_text(encoding="utf-8"))
    return template, titles


def build_system_prompt(template: str) -> str:
    """ジャンルテンプレートを含むシステムプロンプトを組み立てる"""
    return f"{BASE_SYSTEM}\n\n## このジャンルのテンプレート・KW情報\n{template}"


def generate_note(title_data: dict, system_prompt: str, client: anthropic.Anthropic) -> str:
    """1本のnoteを生成する（システムプロンプトをキャッシュ）"""
    title = title_data["title"]
    keyword = title_data["keyword"]
    target_pain = title_data["target_pain"]
    price = title_data.get("price", 980)

    angle = title_data.get("angle", "")
    emotion = title_data.get("emotion", "")
    optional_hints = ""
    if angle:
        optional_hints += f"\n切り口：{angle}"
    if emotion:
        optional_hints += f"\n感情トリガー：{emotion}"

    print(f"  生成中: {title}")

    response = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=8000,
        thinking={"type": "adaptive"},
        system=[
            {
                "type": "text",
                "text": system_prompt,
                # ジャンルごとにシステムプロンプトをキャッシュ
                # 同じジャンル内の複数記事生成でAPI費用を削減
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=[
            {
                "role": "user",
                "content": f"""以下の条件でnote記事を書いてください。

タイトル：{title}
SEOキーワード：{keyword}
読者の悩み：{target_pain}
有料パートの価格：¥{price}{optional_hints}

## 出力形式
Markdown形式で書いてください。
無料パートと有料パートを以下の区切り線で明確に分けてください。

---無料パートここまで---

---有料パート（¥{price}）---

記事本文を今すぐ書いてください。""",
            }
        ],
    )

    for block in response.content:
        if block.type == "text":
            # キャッシュ使用状況をログ出力
            usage = response.usage
            cache_read = getattr(usage, "cache_read_input_tokens", 0)
            cache_create = getattr(usage, "cache_creation_input_tokens", 0)
            if cache_read > 0:
                print(f"    💾 キャッシュヒット: {cache_read} tokens 節約")
            elif cache_create > 0:
                print(f"    📝 キャッシュ作成: {cache_create} tokens")
            return block.text

    return ""


def save_note(title_data: dict, content: str, genre_key: str) -> Path:
    """生成したnoteをジャンル別フォルダにMarkdownとして保存"""
    genre_dir = OUTPUT_DIR / genre_key
    genre_dir.mkdir(exist_ok=True)

    safe_title = re.sub(r'[^\w\s-]', '', title_data["title"])
    safe_title = re.sub(r'\s+', '_', safe_title)[:50]
    filename = f"{title_data['id']:03d}_{safe_title}.md"
    output_path = genre_dir / filename

    full_content = f"""---
id: {title_data['id']}
genre: {genre_key}
title: {title_data['title']}
keyword: {title_data['keyword']}
target_pain: {title_data['target_pain']}
price: {title_data.get('price', 980)}
---

# {title_data['title']}

{content}
"""
    output_path.write_text(full_content, encoding="utf-8")
    print(f"    ✅ 保存: {output_path.relative_to(BASE_DIR)}")
    return output_path


def run_genre(genre_key: str, target_id: Optional[int], client: anthropic.Anthropic):
    """指定ジャンルの記事を生成する"""
    genre_label = GENRES[genre_key]["label"]
    print(f"\n📁 ジャンル: {genre_label} ({genre_key})")

    template, titles = load_genre(genre_key)
    system_prompt = build_system_prompt(template)

    if target_id is not None:
        title_data = next((t for t in titles if t["id"] == target_id), None)
        if not title_data:
            print(f"  ❌ ID {target_id} が見つかりません")
            return
        content = generate_note(title_data, system_prompt, client)
        save_note(title_data, content, genre_key)
    else:
        for title_data in titles:
            content = generate_note(title_data, system_prompt, client)
            save_note(title_data, content, genre_key)
        print(f"  完了: {len(titles)}本")


def run_all100(genre_filter: Optional[str], target_id: Optional[int], client: anthropic.Anthropic):
    """titles_all100.json を使って記事を生成する"""
    titles = json.loads(ALL100_FILE.read_text(encoding="utf-8"))

    if target_id is not None:
        titles = [t for t in titles if t["id"] == target_id]
        if not titles:
            print(f"  ❌ ID {target_id} が見つかりません")
            return

    if genre_filter:
        titles = [t for t in titles if t["genre"] == genre_filter]
        if not titles:
            print(f"  ❌ ジャンル '{genre_filter}' のタイトルが見つかりません")
            return

    # ジャンルごとにグループ化してシステムプロンプトキャッシュを活用
    titles_by_genre: dict[str, list] = {}
    for t in titles:
        titles_by_genre.setdefault(t["genre"], []).append(t)

    total = 0
    for genre_key, group in titles_by_genre.items():
        genre_label = GENRES[genre_key]["label"]
        print(f"\n📁 ジャンル: {genre_label} ({genre_key})  {len(group)}本")
        template, _ = load_genre(genre_key)
        system_prompt = build_system_prompt(template)
        for title_data in group:
            content = generate_note(title_data, system_prompt, client)
            save_note(title_data, content, genre_key)
            total += 1

    print(f"\n🎉 all100 完了: {total}本を生成しました")


def print_list():
    """利用可能なジャンル・タイトル一覧を表示"""
    for genre_key, genre_info in GENRES.items():
        print(f"\n【{genre_info['label']}】  --genre {genre_key}")
        try:
            _, titles = load_genre(genre_key)
            for t in titles:
                print(f"  [{t['id']:2d}] ¥{t.get('price', 980):,}  {t['title']}")
        except FileNotFoundError:
            print("  （タイトルファイルが見つかりません）")


def main():
    parser = argparse.ArgumentParser(
        description="note記事ジェネレーター（花屋ジャンル）",
        formatter_class=argparse.RawTextHelpFormatter,
    )
    parser.add_argument(
        "--genre",
        choices=list(GENRES.keys()),
        help="ジャンルを指定: " + " / ".join(GENRES.keys()),
    )
    parser.add_argument("--id", type=int, help="生成するタイトルのID")
    parser.add_argument("--all", action="store_true", help="指定ジャンルの全タイトルを生成")
    parser.add_argument("--all-genres", action="store_true", help="全ジャンル・全タイトルを生成")
    parser.add_argument(
        "--all100",
        action="store_true",
        help="titles_all100.json をソースとして生成（--genre / --id と組み合わせ可）",
    )
    parser.add_argument("--list", action="store_true", help="利用可能なタイトル一覧を表示")
    args = parser.parse_args()

    # 一覧表示
    if args.list:
        print_list()
        return

    # all100 モード
    if args.all100:
        client = anthropic.Anthropic()
        run_all100(genre_filter=args.genre, target_id=args.id, client=client)
        return

    # 全ジャンル一括生成
    if args.all_genres:
        client = anthropic.Anthropic()
        total = 0
        for genre_key in GENRES:
            run_genre(genre_key, target_id=None, client=client)
            _, titles = load_genre(genre_key)
            total += len(titles)
        print(f"\n🎉 全ジャンル完了: 合計 {total} 本を生成しました")
        return

    # ジャンル指定が必要な操作
    if not args.genre:
        parser.print_help()
        print("\n\n📋 タイトル一覧を見るには: python generate_note.py --list")
        return

    client = anthropic.Anthropic()

    if args.all:
        run_genre(args.genre, target_id=None, client=client)
    elif args.id:
        run_genre(args.genre, target_id=args.id, client=client)
    else:
        print(f"ジャンル '{args.genre}' のタイトル一覧:")
        _, titles = load_genre(args.genre)
        for t in titles:
            print(f"  [{t['id']:2d}] ¥{t.get('price', 980):,}  {t['title']}")
        print(f"\n例: python generate_note.py --genre {args.genre} --id 1")


if __name__ == "__main__":
    main()
