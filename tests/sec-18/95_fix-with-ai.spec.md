# Fixing failed tests with AI (Playwright's "Copy Prompt" feature)

Conceptual lecture only - no new test code introduced yet, just a new Playwright tooling feature.

## What it is
Playwright's HTML report now includes a **Copy Prompt** button on failed tests. Instead of manually
copying the raw error log and writing your own question for an LLM (ChatGPT, Copilot, etc), this button
auto-generates a complete, ready-to-paste prompt for you.

## What the generated prompt contains
- Instructions telling the LLM: "a Playwright test failed, explain why and suggest best practices"
- The failing test's info (file, line, test name)
- The exact error message/stack
- A **page snapshot as YAML** - an accessibility-tree style description of what the page looked like at
  the moment of failure (roles, buttons, headers, rows, etc) - this is the key extra context a plain
  error log doesn't give you
- The actual test source code around the failing line

## Why the page snapshot matters
Without it, an error like "element not found" is ambiguous - was the whole locator wrong, or just one
part of it? With the YAML snapshot included, the LLM can see the real DOM/accessibility structure and
pinpoint exactly which part of the locator doesn't match anything on the page (e.g. a typo like `rts`
instead of `tr` in a CSS selector), instead of guessing.

## How to use it
1. Run a test that fails.
2. Open the HTML report, find the failed test, click **Copy Prompt**.
3. Paste the copied prompt into an LLM of your choice.
4. The LLM responds with a specific diagnosis and a suggested code fix.

## Security/practice note
Before pasting any failure prompt (which may include internal UI structure, URLs, or test data) into a
public/global LLM at work, check with your team's DevOps/security policy on which AI tools are approved
for company code. For personal practice projects, this is safe to use freely.
