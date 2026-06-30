#!/usr/bin/env python3
import argparse
import json
import os
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen


def choose_filename(game: dict, index: int) -> str:
    preferred = str(game.get("image", "")).strip()
    if preferred:
        return preferred

    url = str(game.get("coverUrl", "")).strip()
    parsed_name = Path(urlparse(url).path).name
    if parsed_name:
        return parsed_name

    return f"image_{index}.png"


def unique_path(path: Path) -> Path:
    if not path.exists():
        return path

    stem = path.stem
    suffix = path.suffix
    parent = path.parent
    n = 1
    while True:
        candidate = parent / f"{stem}_{n}{suffix}"
        if not candidate.exists():
            return candidate
        n += 1


def download(url: str, destination: Path, timeout: int) -> None:
    req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=timeout) as response:
        data = response.read()
    destination.write_bytes(data)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Download cover images from data.json (games[].coverUrl)."
    )
    parser.add_argument(
        "--data",
        default="data.json",
        help="Path to JSON file (default: data.json)",
    )
    parser.add_argument(
        "--out",
        default="images",
        help="Output folder for downloaded images (default: images)",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=20,
        help="HTTP timeout in seconds (default: 20)",
    )
    args = parser.parse_args()

    data_path = Path(args.data)
    out_dir = Path(args.out)

    if not data_path.exists():
        print(f"ERROR: JSON file not found: {data_path}")
        return 1

    try:
        payload = json.loads(data_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        print(f"ERROR: Invalid JSON in {data_path}: {exc}")
        return 1

    games = payload.get("games", [])
    if not isinstance(games, list):
        print('ERROR: Expected "games" to be an array.')
        return 1

    out_dir.mkdir(parents=True, exist_ok=True)

    total = len(games)
    ok = 0
    failed = 0

    for idx, game in enumerate(games, start=1):
        if not isinstance(game, dict):
            failed += 1
            print(f"[{idx}/{total}] SKIP: invalid entry type")
            continue

        url = str(game.get("coverUrl", "")).strip()
        if not url:
            failed += 1
            print(f"[{idx}/{total}] SKIP: missing coverUrl")
            continue

        filename = choose_filename(game, idx)
        destination = unique_path(out_dir / filename)

        try:
            download(url, destination, args.timeout)
            ok += 1
            print(f"[{idx}/{total}] OK: {destination.name}")
        except (HTTPError, URLError, TimeoutError, OSError) as exc:
            failed += 1
            print(f"[{idx}/{total}] ERROR: {url} ({exc})")

    print(f"\nDone. Success: {ok}, Failed: {failed}, Total: {total}")
    return 0 if failed == 0 else 2


if __name__ == "__main__":
    sys.exit(main())
