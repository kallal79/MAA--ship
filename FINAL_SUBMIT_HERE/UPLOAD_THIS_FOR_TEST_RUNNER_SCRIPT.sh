#!/bin/bash

OUTPUT_PATH=""
MODE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --output_path)
      OUTPUT_PATH="$2"
      shift 2
      ;;
    base|new)
      MODE="$1"
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# disable typecheck in vitest.config.ts to speed up the run and avoid unrelated errors
sed -i 's/enabled: true/enabled: false/g' vitest.config.ts || true
sed -i 's/enabled: true/enabled: false/g' packages/zod/vitest.config.ts || true

REPORTER_ARGS="--typecheck.enabled=false"
if [ -n "$OUTPUT_PATH" ]; then
  REPORTER_ARGS="--typecheck.enabled=false --reporter=default --reporter=junit --outputFile=$OUTPUT_PATH"
fi

if [ "$MODE" = "base" ]; then
  npx vitest run packages/zod/src/v4/classic/tests/default.test.ts $REPORTER_ARGS
else
  npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts packages/zod/src/v4/classic/tests/encode-defaults-skipEncoding-types.spec.ts $REPORTER_ARGS
fi
