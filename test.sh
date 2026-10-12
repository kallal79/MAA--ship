#!/bin/bash

OUTPUT_PATH=""
MODE="$1"
shift || true

while [[ $# -gt 0 ]]; do
  case "$1" in
    --output_path)
      OUTPUT_PATH="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

# disable typecheck in vitest.config.ts by replacing enabled: true with enabled: false
sed -i 's/enabled: true/enabled: false/g' vitest.config.ts || true
sed -i 's/enabled: true/enabled: false/g' packages/zod/vitest.config.ts || true

REPORTER_ARGS="--no-typecheck"
if [ -n "$OUTPUT_PATH" ]; then
  REPORTER_ARGS="--reporter=junit --outputFile=$OUTPUT_PATH --no-typecheck"
fi

if [ "$MODE" = "base" ]; then
  npx vitest run packages/zod/src/v4/classic/tests/default.test.ts $REPORTER_ARGS
else
  npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts packages/zod/src/v4/classic/tests/default.test.ts $REPORTER_ARGS
fi
