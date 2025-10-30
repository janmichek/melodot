#!/usr/bin/env python3
"""Append an explanation instruction when the user prompt ends with -e."""
import json
import sys

def main() -> None:
    try:
        data = json.load(sys.stdin)
        prompt = data.get("prompt", "")
        if prompt.rstrip().endswith("-e"):
            print(
                "\ngive me a simple & short explanation\n"
                " DO NOT JUMP TO CONCLUSIONS!! DO NOT MAKE ASSUMPTIONS! QUIET YOUR EGO\n"
                " AND ASSUME YOU KNOW NOTHING. Take a deep breath, give it all you have.\n"
                "Then, suggest what the next step might be and why\n"
                "decorate and animate the response in nice minimal explainable way \n"
                "answer in short"
            )
        sys.exit(0)
    except Exception as e:
        print(f"append_explain error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
