#!/usr/bin/env python3
"""Ultrathink mode -u."""
import json
import sys

def main() -> None:
    try:
        input_data = json.load(sys.stdin)
        prompt: str = input_data.get("prompt", "")

        if prompt.rstrip().endswith("-u"):
            print(
                "\nUse the maximum amount of ultrathink. Take all the time you need. "
                "It's much better if you do too much research and thinking than not enough."
                "decorate and animate the response in explainable way \n"
            )
    except Exception as e:  # pragma no cover - simple hook, log and exit
        print(f"append_ultrathink hook error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

