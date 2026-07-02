import json
import subprocess
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except:
    pass

REPO = "ukimotodatascience/Local-LLM-Dashboard"
PR_NUMBER = "1"

# PRレビューコメントの取得
cmd = f'gh api repos/{REPO}/pulls/{PR_NUMBER}/comments --paginate'
result = subprocess.run(cmd, shell=True, capture_output=True, text=True, encoding="utf-8")
output = result.stdout.strip()

comments = []
# ][ を置換する。ただし文字列内の ][ も考慮して、各ページの配列を切り出してデコードする。
# 最も安全な方法は、各ページの配列の開始 `[` と終了 `]` の対応をスタックで追うか、
# 単純に `][` でスプリットしたものが正常に json パースできるか試す。
if output:
    # ページ間の区切り ']\n[' を分割する
    # 改行や空白を含めて置換
    import re
    cleaned = re.sub(r'\]\s*\[', ',\n', output)
    # もし全体がひとつの大きな配列でなければ、外側を [] で囲む
    if not cleaned.startswith('['):
        cleaned = '[' + cleaned
    if not cleaned.endswith(']'):
        cleaned = cleaned + ']'
    
    try:
        comments = json.loads(cleaned)
    except Exception as e:
        print(f"Normal parse failed: {e}. Trying fallback chunk parse.")
        # フォールバック: 各ページの '[' から ']' をパースする
        # シンプルに '][' を区切りとして分割してみる
        chunks = output.replace('][', ']\n[')
        for chunk in chunks.split('\n'):
            if chunk.strip():
                try:
                    comments.extend(json.loads(chunk))
                except Exception as ex:
                    print(f"Chunk parse failed for: {chunk[:100]}... error: {ex}")

# 通常のPRコメント (Issueコメント) の取得
cmd_issue = f'gh api repos/{REPO}/issues/{PR_NUMBER}/comments --paginate'
result_issue = subprocess.run(cmd_issue, shell=True, capture_output=True, text=True, encoding="utf-8")
output_issue = result_issue.stdout.strip()
issue_comments = []
if output_issue:
    try:
        # 同様にマージ
        cleaned_issue = re.sub(r'\]\s*\[', ',\n', output_issue)
        if not cleaned_issue.startswith('['):
            cleaned_issue = '[' + cleaned_issue
        if not cleaned_issue.endswith(']'):
            cleaned_issue = cleaned_issue + ']'
        issue_comments = json.loads(cleaned_issue)
    except:
        chunks = output_issue.replace('][', ']\n[')
        for chunk in chunks.split('\n'):
            if chunk.strip():
                try:
                    issue_comments.extend(json.loads(chunk))
                except:
                    pass

print(f"Loaded {len(comments)} review comments and {len(issue_comments)} issue comments.")

comments = [c for c in comments if isinstance(c, dict)]
comment_dict = {c["id"]: c for c in comments}

threads = {}
for c in comments:
    parent_id = c.get("in_reply_to_id") or c["id"]
    if parent_id not in threads:
        threads[parent_id] = []
    threads[parent_id].append(c)

print(f"Total threads: {len(threads)}")

unreplied_threads = []
for parent_id, thread in threads.items():
    thread.sort(key=lambda x: x["created_at"])
    last_comment = thread[-1]
    
    if last_comment["user"]["login"] != "ukimotodatascience":
        parent_comment = comment_dict.get(parent_id)
        if parent_comment:
            unreplied_threads.append({
                "id": parent_id,
                "path": parent_comment["path"],
                "line": parent_comment.get("line") or parent_comment.get("original_line"),
                "author": last_comment["user"]["login"],
                "body": last_comment["body"],
                "last_id": last_comment["id"]
            })

print("\n--- Unreplied Threads ---")
for t in unreplied_threads:
    print(f"ID: {t['id']} (Last ID: {t['last_id']})")
    print(f"Path: {t['path']}:{t['line']}")
    print(f"Author: {t['author']}")
    safe_body = t['body'].encode('cp932', errors='replace').decode('cp932')
    print(f"Body: {safe_body}")
    print("-" * 40)
