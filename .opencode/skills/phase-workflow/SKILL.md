---
name: phase-workflow
description: Use this when implementing a phase, writing or running tests, or when the user says build, implement, make the tests pass, or go red then green in the Ol-Kinyi project. Enforces plan-first approval, stub-with-NotImplemented, red-green testing, and one-phase-per-task discipline.
---

# Phase workflow

This project ships one phase at a time. Follow this exactly.

## 1. Plan, then stop
- Read the phase prompt.
- Give a short plan: files to touch, tests to write, open questions.
- Stop and wait for explicit approval. Do not write code yet.

## 2. Red
- Create stubs that throw `Error("NotImplemented")`.
- Write the failing tests for this phase.
- Run the tests and show them red.
- Stop if the plan is not approved.

## 3. Green
- Write the minimum code to turn the approved tests green.
- Do not edit tests to make them pass. Fix the code.
- Setup or fixture bugs may be fixed, but report every one.

## 4. Stop and report
- One phase equals one task. Do not start the next phase.
- Report what is green and any fixups made to fixtures or setup.

## Never
- Never delete, skip, loosen, or rewrite an approved test.
- Never guess a library API. Check the installed version's docs.
- Never add unused code, extra features, or debug logs.
- Never swallow exceptions; name the failing field, e.g. `targets[1].summary`.

## If a test seems wrong
Stop and report the test name, what it asserts, why it is wrong, and the proposed change. Wait for approval before touching it.
