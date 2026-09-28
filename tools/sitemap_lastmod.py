"""Refresh <lastmod> in sitemap.xml from each page's real change date.

Run from the site root before pushing:  python tools/sitemap_lastmod.py
- A page with uncommitted edits gets today's date.
- Otherwise it gets the date of the last commit that touched it.
Google uses <lastmod> only when it's consistently accurate, so never set it by hand.
"""
import datetime as dt
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://erenforbusiness.com/"


def git(*args):
    return subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True).stdout.strip()


def changed_on(path: str) -> str:
    today = dt.date.today().isoformat()
    status = git("status", "--porcelain", "--", path)
    if status.startswith("??"):
        return today
    # Real edits not yet committed (line-ending-only noise from Windows is ignored).
    if status and subprocess.run(["git", "diff", "--ignore-cr-at-eol", "--quiet", "HEAD", "--", path],
                                 cwd=ROOT).returncode != 0:
        return today
    return git("log", "-1", "--format=%cs", "--", path) or today


def main():
    sitemap = ROOT / "sitemap.xml"
    text = sitemap.read_text(encoding="utf-8")
    changes = []

    def fix(match):
        loc = match.group(1)
        rel = loc[len(SITE):] or "index.html"
        new = changed_on(rel)
        old = match.group(2)
        if new != old:
            changes.append(f"{rel}: {old} -> {new}")
        return match.group(0).replace(f"<lastmod>{old}</lastmod>", f"<lastmod>{new}</lastmod>")

    text = re.sub(r"<loc>([^<]+)</loc>\s*<lastmod>([^<]+)</lastmod>", fix, text)
    sitemap.write_text(text, encoding="utf-8", newline="")
    print("\n".join(changes) or "sitemap already current")


if __name__ == "__main__":
    main()
