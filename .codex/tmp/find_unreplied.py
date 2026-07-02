import json
import subprocess
import sys

# 標準出力をUTF-8に変更
try:
    sys.stdout.reconfigure(encoding='utf-8')
except:
    pass

REPO = "ukimotodatascience/Local-LLM-Dashboard"
PR_NUMBER = "1"

cmd = f'gh api repos/{REPO}/pulls/{PR_NUMBER}/comments'
result = subprocess.run(cmd, shell=True, capture_output=True, text=True, encoding="utf-8")

if result.returncode != 0:
    print(f"Error running gh api: {result.stderr}")
    exit(1)

output = result.stdout.strip()
comments = json.loads(output)

print(f"Loaded {len(comments)} comments.")

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
    # サポート外の文字は除外して印字
    safe_body = t['body'].encode('cp932', errors='replace').decode('cp932')
    print(f"Body: {safe_body}")
    print("-" * 40)
