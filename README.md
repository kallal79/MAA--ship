# MAA--ship: Zod v4 `skipEncoding` Feature & Nova Agent Benchmark

[![Local Verification](https://img.shields.io/badge/Local%20Verification-100%25%20PASS-brightgreen.svg)]()
[![Nova Benchmark Pass Rate](https://img.shields.io/badge/Nova%20Benchmark-15.4%25%20(2%2F13)-blue.svg)]()
[![Disk-to-Git Parity](https://img.shields.io/badge/Disk--to--Git%20Parity-100%25%20(1852%2F1852)-success.svg)]()
[![Zod Version](https://img.shields.io/badge/Zod-v4-purple.svg)]()

A comprehensive repository containing the complete implementation, compliance test suites, automated verification pipelines, and multi-agent benchmark trajectories for the **Zod v4 `skipEncoding` Feature** (Olympus AI Agent Challenge).

---

## 📌 Executive Summary & Problem Specification

The project implements a first-class `skipEncoding` option for `.default()` schemas within **Zod v4** (supporting both Classic and Mini APIs). When encoding data models, default-valued outputs can be omitted cleanly across container hierarchies.

### Core Architectural Requirements

1. **Container Omission & Compaction**:
   - **Objects & Records**: The matching property key and value are omitted entirely from the output object.
   - **Maps**: If either the key schema or the value schema triggers `skipEncoding`, the entire key-value entry is omitted.
   - **Arrays & Sets**: Matching elements are stripped.
   - **Tuples**: Matching elements are removed, automatically compacting the tuple output array rather than preserving sparse holes.
2. **Inner Value Evaluation**:
   - For literal defaults, `skipEncoding` evaluates both the actual value and the default value *after inner encoding*.
   - In nested defaulted chains, each defaulted schema independently evaluates its own rule without cross-level interference.
3. **Equality Comparison Modes**:
   - `skipEncoding: true` behaves identically to `{ mode: "deep" }`.
   - **Deep Equality (`{ mode: "deep" }`)**: Compares primitives via `Object.is()`, `Date` instances by timestamp, `Array` recursively (treating sparse holes as undefined), plain objects recursively (order-insensitive key comparison), `Map` instances (order-insensitive matching keys and values), and `Set` instances (order-insensitive 1-to-1 bipartite matching).
   - **Shallow Equality (`{ mode: "shallow" }`)**: Compares elements in `Array` and `Set` by identity with `Object.is()`; for `Map`, compares keys and values by identity; for plain objects, compares property values by identity.
   - **Strict Equality (`{ mode: "strict" }`)**: Compares values directly via `Object.is()`.
4. **Predicates & Factory Defaults**:
   - Custom predicate functions receive `(encodedValue, rawDefaultValue)` returning a boolean or `Promise<boolean>` (with `rawDefaultValue` being `undefined` for factory defaults).
   - Calling `.encode()` synchronously with an async predicate throws: `"Cannot use async skipEncoding in synchronous encode"`.
   - Factory defaults (`z.default(() => value)`) only support predicate-based `skipEncoding`. Passing a boolean or mode object throws an error mentioning `skipEncoding` and `factory default`.
   - Transparency: Omission operates transparently through wrappers such as `.optional()`, `.nullable()`, `.nullish()`, `.catch()`, unions, intersections, and lazy schemas.

---

## 📂 Repository Directory Layout

```
MAA--ship/
├── 1_UPLOAD_THIS_AS_TEST_PATCH/           # Golden compliance test patch
│   └── test.patch                         # 30 targeted test cases for encode-defaults
├── 2_UPLOAD_THIS_AS_SOLUTION_PATCH/       # Golden reference solution patch
│   └── solution.patch                     # Implementation across classic, core & mini schemas
├── 3_UPLOAD_THIS_AS_PROMPT/               # Golden task prompt & specifications
│   └── prompt.txt
├── FINAL_SUBMIT_HERE/                     # Complete submission archive & candidate tests
│   ├── solution.patch                     # Production solution patch
│   ├── test.patch                         # Production test patch
│   ├── prompt.txt                         # Specification prompt
│   ├── NOVA_RESULTS.md                    # Benchmark report across 12 Nova agents
│   ├── agent-runs-READY-TO-SUBMIT.zip     # Packaged agent evaluation run package
│   ├── CANDIDATE_TEST_45.ts / 49.ts       # Calibrated discriminator candidate suites
│   └── *.patch                            # Historical calibrated & versioned patches
├── FINAL_UPLOAD/                          # Definitive upload bundles
│   ├── DEFINITIVE_SOLUTION_PATCH.patch
│   ├── DEFINITIVE_TEST_PATCH.patch
│   └── desktop_patches/                   # Backup & desktop historical patch variations
├── final_submission/                      # Deployment bundle for automated evaluation
│   ├── solution.patch
│   ├── test.patch
│   └── test.sh
├── agent-runs-LAST-FINAL-NEW/             # Extracted benchmark runs for Nova #1 to Nova #13
│   ├── Nova_Nova_1/ ... Nova_Nova_13/
│   │   ├── eval-result.json               # Vitest execution metrics
│   │   ├── junit-baseline.xml             # Baseline test execution report
│   │   ├── junit-new.xml                  # Post-patch test execution report
│   │   ├── run.txt                        # Execution console logs
│   │   ├── solution-patch.patch           # Individual agent solution patch
│   │   ├── test-log.txt                   # Detailed test runner log
│   │   ├── trajectory.json                # Complete agent reasoning trajectory
│   │   └── workspace-diff.patch           # Full workspace diff
├── agent-runs-THE-FINAL-ONE/              # Calibrated final run package (Nova 1 to 12)
├── agent-runs-FINAL-UNZIPPED/             # Unzipped multi-agent validation traces
├── agent-runs-ORIGINAL-ONE/               # Baseline agent run traces
├── *.zip archives                         # Full standalone agent run archives
│   ├── agent-runs--the-ORIGANAL-ONE.zip
│   ├── agent-runs-THE -LAST AND FINAL AND MAIN ONE.zip
│   ├── agent-runs-THE FECK-ONE.zip
│   └── agent-runs-READY-TO-SUBMIT.zip
├── zod/                                   # Full Zod v4 monorepo codebase
│   ├── packages/zod/src/v4/               # Classic, core, and mini schema source code
│   └── packages/docs/, bench/, integration/, resolution/, tsc/, treeshake/
├── zod_repo.bundle                        # Self-contained Git history bundle for Zod
├── setup_zod_git.js                       # Automation script to restore zod/.git
├── verify_submission_local.cjs            # Local verification pipeline script
├── run_full_verification.js               # Multi-agent benchmark runner & auditor
└── audit_file_parity.js                   # Automated 100% disk-to-git parity verifier
```

---

## 🧪 Local Verification & Benchmark Results

The entire verification pipeline has been executed and validated locally:

### 1. Fail-to-Pass (F2P) Baseline Check
* **Target**: Unpatched base Zod codebase + `test.patch`
* **Result**: **30 / 30 FAILED** (0 passed, 30 failed)
* **Verdict**: Confirms all 30 tests in `test.patch` specifically test new functionality and cannot pass by default without the implementation.

### 2. Reference Solution (F2P Resolution)
* **Target**: Base Zod + `test.patch` + `solution.patch`
* **Result**: **30 / 30 PASSED (100% Success)**
* **Verdict**: Validates complete adherence to all requirements, equality modes, factory handling, and wrapper transparency.

### 3. Pass-to-Pass (P2P) Regression Check
* **Target**: Base Zod + `solution.patch` against existing test suite (`default.test.ts`)
* **Result**: **40 / 40 PASSED (0 regressions)**
* **Verdict**: Guarantees zero backwards incompatibility or breaking changes to existing `.default()` parsing or encoding.

### 4. Nova 13-Agent Benchmark Audit
Evaluating all 13 Nova candidate agents against the compliance suite demonstrates high discriminative capability:

| Agent | Status | Tests Passed | Tests Failed | Verdict |
|---|---|---|---|---|
| **Nova #1** | ✅ **PASS** | 30 / 30 | 0 | Legitimate Solve |
| **Nova #2** | ✅ **PASS** | 30 / 30 | 0 | Legitimate Solve |
| **Nova #3** | ❌ **FAIL** | 29 / 30 | 1 | Missed Requirement |
| **Nova #4** | ❌ **FAIL** | 29 / 30 | 1 | Missed Requirement |
| **Nova #5** | ❌ **FAIL** | 29 / 30 | 1 | Missed Requirement |
| **Nova #6** | ❌ **FAIL** | 29 / 30 | 1 | Missed Requirement |
| **Nova #7** | ❌ **FAIL** | 29 / 30 | 1 | Missed Requirement |
| **Nova #8** | ❌ **FAIL** | 29 / 30 | 1 | Missed Requirement |
| **Nova #9** | ❌ **FAIL** | 29 / 30 | 1 | Missed Requirement |
| **Nova #10** | ❌ **FAIL** | 28 / 30 | 2 | Missed Requirement |
| **Nova #11** | ❌ **FAIL** | 29 / 30 | 1 | Missed Requirement |
| **Nova #12** | ❌ **FAIL** | 29 / 30 | 1 | Missed Requirement |
| **Nova #13** | ❌ **FAIL** | 29 / 30 | 1 | Missed Requirement |

* **Overall Benchmark Solve Rate**: **15.4% (2 / 13 passing agents)**.

---

## 🚀 How to Run & Verify Locally

### Prerequisites
* Node.js v18+ / v20+
* pnpm v9+ or npm / npx
* Git

### Step-by-Step Execution

1. **Restore the Zod Git Environment**:
   ```bash
   node setup_zod_git.js
   ```
   *Restores `zod/.git` automatically from `zod/.git_internal` or `zod_repo.bundle`.*

2. **Run Local Verification**:
   ```bash
   node verify_submission_local.cjs
   ```
   *Executes the full pipeline: F2P validation, reference solution test, P2P regression check, and the 13 Nova agent benchmark.*

3. **Run Multi-Agent Benchmark Auditor**:
   ```bash
   node run_full_verification.js
   ```

4. **Verify 100% Repository File Parity**:
   ```bash
   node audit_file_parity.js
   ```

5. **Direct Vitest Execution**:
   ```bash
   cd zod
   pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false
   ```

---

## 🔒 Verification & Parity Guarantee

Every single file in this project is strictly version-controlled with zero untracked or omitted files:
* **Tracked files in Git**: `1,852`
* **Local disk files**: `1,852`
* **Parity Score**: **100%**