#!/usr/bin/env python3
"""Run basic structural checks for the static website."""

from __future__ import annotations

import re
import shutil
import subprocess
import sys
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.glob("*.html"))
JS_FILES = sorted((ROOT / "assets").rglob("*.js"))
LOCAL_REFERENCE = re.compile(r"(?:href|src)=[\"']([^\"'#?]+)")
ID_ATTRIBUTE = re.compile(r"\bid=[\"']([^\"']+)[\"']")
SITE_LINK_ATTRIBUTE = re.compile(r"data-site-link=[\"']([^\"']+)[\"']")
SITE_LINK_KEY = re.compile(r"^\s{4}([A-Za-z][A-Za-z0-9]*):", re.MULTILINE)
EXTERNAL_BLANK_LINK = re.compile(
    r"<a\b(?=[^>]*\btarget=[\"']_blank[\"'])([^>]*)>", re.IGNORECASE
)


def check_html() -> list[str]:
    errors: list[str] = []
    site_file = ROOT / "assets" / "data" / "site.js"
    site_keys = set(SITE_LINK_KEY.findall(site_file.read_text(encoding="utf-8")))

    for html_file in HTML_FILES:
        text = html_file.read_text(encoding="utf-8")
        ids = ID_ATTRIBUTE.findall(text)
        duplicates = sorted({item for item in ids if ids.count(item) > 1})
        if duplicates:
            errors.append(f"{html_file.name}: duplicate id(s): {', '.join(duplicates)}")

        if not re.search(r"<html\b[^>]*\blang=[\"'][^\"']+[\"']", text, re.IGNORECASE):
            errors.append(f"{html_file.name}: missing html lang attribute")

        for key in SITE_LINK_ATTRIBUTE.findall(text):
            if key not in site_keys:
                errors.append(f"{html_file.name}: unknown data-site-link key: {key}")

        for attributes in EXTERNAL_BLANK_LINK.findall(text):
            rel_match = re.search(r"\brel=[\"']([^\"']*)[\"']", attributes, re.IGNORECASE)
            rel_tokens = set(rel_match.group(1).lower().split()) if rel_match else set()
            if not {"noopener", "noreferrer"}.issubset(rel_tokens):
                errors.append(f"{html_file.name}: target=_blank link must use rel=\"noopener noreferrer\"")

        if html_file.name != "preview_render.html":
            if not re.search(r"<a\b[^>]*data-site-link=[\"']ustc[\"'][^>]*>[\s\S]*?class=[\"'][^\"']*ustc-seal", text, re.IGNORECASE):
                errors.append(f"{html_file.name}: header USTC emblem must link to the USTC homepage")
            if html_file.name.endswith("-en.html") and "Dark mode" not in text:
                errors.append(f"{html_file.name}: English theme control must use English mode labels")

        for raw_reference in LOCAL_REFERENCE.findall(text):
            parsed = urlparse(raw_reference)
            if parsed.scheme or raw_reference.startswith("//"):
                continue
            target = (html_file.parent / unquote(parsed.path)).resolve()
            if not target.exists():
                errors.append(f"{html_file.name}: missing local file: {raw_reference}")

        if "assets/js/render.js" in text or "assets/js/common.js" in text:
            core_position = text.find("assets/js/core.js")
            dependent_positions = [
                position
                for position in (
                    text.find("assets/js/render.js"),
                    text.find("assets/js/common.js"),
                )
                if position >= 0
            ]
            if core_position < 0 or any(core_position > position for position in dependent_positions):
                errors.append(f"{html_file.name}: core.js must load before render.js/common.js")

    return errors


def check_javascript() -> list[str]:
    node = shutil.which("node")
    if not node:
        return ["Node.js was not found; JavaScript syntax checks were skipped."]

    errors: list[str] = []
    for js_file in JS_FILES:
        result = subprocess.run(
            [node, "--check", str(js_file)],
            capture_output=True,
            text=True,
            check=False,
        )
        if result.returncode:
            message = (result.stderr or result.stdout).strip()
            errors.append(f"{js_file.relative_to(ROOT)}: {message}")
    return errors


def main() -> int:
    failures = check_html()
    javascript_results = check_javascript()
    failures.extend(item for item in javascript_results if not item.endswith("were skipped."))

    for note in javascript_results:
        if note.endswith("were skipped."):
            print(f"NOTE: {note}")

    if failures:
        print("Site check failed:\n")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print(f"Site check passed: {len(HTML_FILES)} HTML files, {len(JS_FILES)} JavaScript files.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
