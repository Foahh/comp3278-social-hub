#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
PROJECT_ROOT=$(cd -- "$SCRIPT_DIR/.." && pwd)
PROJECT_NAME=$(basename -- "$PROJECT_ROOT")
DEFAULT_OUTPUT="$PROJECT_ROOT/${PROJECT_NAME}-submission.zip"

if ! command -v zip >/dev/null 2>&1; then
  echo "Error: zip is required." >&2
  exit 1
fi

OUTPUT_PATH=${1:-$DEFAULT_OUTPUT}
if [[ "$OUTPUT_PATH" != /* ]]; then
  OUTPUT_PATH="$PROJECT_ROOT/$OUTPUT_PATH"
fi

mkdir -p -- "$(dirname -- "$OUTPUT_PATH")"
OUTPUT_PATH=$(cd -- "$(dirname -- "$OUTPUT_PATH")" && pwd)/$(basename -- "$OUTPUT_PATH")

declare -a FILES=()
RELATIVE_OUTPUT=""

if [[ "$OUTPUT_PATH" == "$PROJECT_ROOT/"* ]]; then
  RELATIVE_OUTPUT=${OUTPUT_PATH#"$PROJECT_ROOT"/}
fi

while IFS= read -r -d '' absolute_path; do
  relative_path=${absolute_path#"$PROJECT_ROOT"/}

  if [[ -n "$RELATIVE_OUTPUT" && "$relative_path" == "$RELATIVE_OUTPUT" ]]; then
    continue
  fi

  case "$relative_path" in
    .git/*|*/.git/*|.venv/*|*/.venv/*|venv/*|*/venv/*|.pytest_cache/*|*/.pytest_cache/*|.ruff_cache/*|*/.ruff_cache/*|.mypy_cache/*|*/.mypy_cache/*|.chroma/*|*/.chroma/*|.vanna/*|*/.vanna/*|.claude/*|*/.claude/*|.cursor/*|*/.cursor/*|.worktrees/*|*/.worktrees/*)
      continue
      ;;
    .codex|.codex/*|*/.codex/*)
      continue
      ;;
    */node_modules/*|node_modules/*|*/dist/*|dist/*|*/build/*|build/*|*/__pycache__/*|__pycache__/*)
      continue
      ;;
    *.pyc|*.pyo)
      continue
      ;;
  esac

  FILES+=("$relative_path")
done < <(find "$PROJECT_ROOT" -type f -print0)

if [[ ${#FILES[@]} -eq 0 ]]; then
  echo "Error: no files selected for submission archive." >&2
  exit 1
fi

rm -f -- "$OUTPUT_PATH"

(
  cd -- "$PROJECT_ROOT"
  zip -q -X -9 "$OUTPUT_PATH" "${FILES[@]}"
)

echo "Created submission archive:"
echo "  $OUTPUT_PATH"
echo "Included ${#FILES[@]} project files after excluding local/development artifacts."
