# Playwright MCP vs Playwright CLI in Claude Code
**Author:** Bikash Dehury · Test Automation Specialist · [LinkedIn](https://www.linkedin.com/in/bikash-dehury-90a10577/) 

Every week someone on my feed says Playwright MCP is the way to give an AI agent a browser, and the next day someone else says the new Playwright CLI makes MCP obsolete because it uses a fraction of the tokens. Most of those posts quote the same two README paragraphs.

I wanted numbers from my own machine. So I set up two identical Playwright projects, gave one of them Playwright MCP and the other Playwright CLI, and ran the same three test automation tasks in Claude Code in both. Same app, same prompts, same model. The only difference is how the agent talks to the browser.

## TL;DR

| Scenario | What the agent had to do | Cost MCP | Cost CLI | Quality | Winner |
|---|---|---|---|---|---|
| S1 Self-heal | Fix 2 broken locators after a UI change | **$0.30** | $0.33 | MCP: 2/2 green, fixed only the 2 broken locators. CLI: [fill] | MCP (small margin) |
| S2 Exploratory | Find bugs as `problem_user` | $0.99 | **$0.91** | MCP 8 findings, CLI 14 (all 8 of MCP's plus 6 more) | **CLI** |
| S3 Suite generation | Write a 5-test page-object suite | $0.74 | **$0.62** | Both 15/15 over 3 repeats, same structure | **CLI** |

What surprised me:

1. **The token gap is 8 to 22%, not the ~4x you see quoted.** Claude Code loads MCP tools on demand. The Playwright MCP tool list cost 1.2k tokens in context, not the ~4.4k the full schema would take. On top of that, 95 to 98% of input tokens came from the prompt cache in every run.
2. **My S2 hypothesis was wrong.** I expected MCP to win exploratory testing because the page is the subject. The CLI found more bugs for less money.
3. **Same model, same result shape.** In S3 both agents produced the same 3 spec files and the same 7 page objects. The interface changed how many steps it took to get there (18 requests for MCP, 12 for CLI), not what got built.

## Setup

| | |
|---|---|
| Agent | Claude Code 2.1.281, model Claude Opus 5.5 (1M context) |
| MCP | `@playwright/mcp@0.0.82`, project scope, `--isolated` |
| CLI | `@playwright/cli@0.1.21` with its skill installed in `lab-cli/.claude/skills` |
| App under test | https://www.saucedemo.com (public demo shop) |
| Test runner | `@playwright/test`, Chromium only, `reporter: 'list'` |
| OS | Windows 11, VS Code, PowerShell |

`lab-mcp/` and `lab-cli/` have the same `playwright.config.ts` and the same starting test. `lab-mcp` has a `.mcp.json`; `lab-cli` has no MCP config at all. I checked with `claude mcp list` in both folders before every session.

Before every run: `git reset --hard` and `git clean -fd` to get back to the committed clean start, then a fresh `claude` session. After every run: `/context` and `/cost` screenshots (in `results/screenshots/`).

## The three scenarios

Each prompt starts with one line that differs per lab:

- MCP: `Browser tool for this task: use only the Playwright MCP browser tools.`
- CLI: `Browser tool for this task: use only playwright-cli through the Bash tool.`

Everything after that line is identical.

**S1 Self-heal.** `tests/s1-login.spec.ts` has two locators that no longer match the page (`#login-btn` and `[data-test="add-to-cart-backpack"]`). The agent has to run the spec, look at the live page, and fix only the broken locators with `getByTestId` or `getByRole`.

**S2 Exploratory.** Log in as `problem_user`, explore inventory, product detail, sorting, cart and checkout, and write every bug with on-page evidence to `reports/s2-exploratory.md`. No automated tests.

**S3 Suite generation.** Write five tests (login, locked-out user, add to cart, remove from cart, checkout) using a page-object pattern, put them in `tests/s3/`, and keep going until they pass.

## Results in detail

Tokens are from `/cost`. "Total input" = input + cache read + cache write.

### S1 Self-heal

| | MCP | CLI |
|---|---|---|
| Requests | 8 | 10 |
| Cache read | 398.6k | 491.0k |
| Cache write | 20.8k | 20.8k |
| Output | 2.6k | 3.2k |
| Cost | **$0.299** | $0.332 |
| API time | 35s | 50s |
| Messages in context at end | 19.4k | 20.7k |

MCP needed two fewer round trips. With MCP the page snapshot arrives with the tool result; with the CLI the agent takes a snapshot and then reads the file. On a task that is only about looking at the page, that saves a step.

The margin is small. A practice run of the same MCP task cost $0.367 with 12 requests, so run-to-run variation is in the same range as the gap.

### S2 Exploratory

| | MCP | CLI |
|---|---|---|
| Requests | 35 | 28 |
| Cache read | 2.0M | 1.6M |
| Cache write | 44.1k | 40.2k |
| Output | 11.8k | 12.9k |
| Cost | $0.99 | **$0.91** |
| API time | 2m 38s | 2m 45s |
| Messages in context at end | 40.2k | 40.1k |
| Findings | 8 | 14 |

Both agents found the same core problems: the last-name field writes into first name (checkout blocked), three products can't be added, remove doesn't work on the inventory page, product links open the wrong product, one product is "ITEM NOT FOUND", add/remove on detail pages does nothing, sorting doesn't sort, all images are the 404 placeholder.

The CLI agent also found a phantom item in the cart, item totals counted twice on the overview, an overview crash, the cart not being cleared after an order, a leftover "Remove" button after Reset App State, and an About link that goes to a 404. To be fair: it reached three of those by opening the checkout overview by URL and setting the cart through localStorage, because the last-name bug blocks a real customer. It said so in its report. Two others are in the burger menu, which was outside the charter.

Claude Code flagged that the CLI session read files for 174k tokens over the run. That is the CLI agent pulling snapshots into context. In exploratory work it has to look at nearly every page anyway, so the "keep page data on disk" advantage mostly disappears. The end context was the same in both labs (~40k).

Reports and evidence screenshots: `results/s2-mcp/` and `results/s2-cli/`.

### S3 Suite generation

| | MCP | CLI |
|---|---|---|
| Requests | 18 | 12 |
| Cache read | 892.1k | 694.2k |
| Cache write | 34.8k | 31.7k |
| Output | 14.2k | 11.4k |
| Cost | $0.74 | **$0.62** |
| API time | 2m 8s | 1m 49s |
| Context at end | ~65.3k | 61.5k |
| Tests passing (`--repeat-each=3`) | 15/15 | 15/15 |
| Locators only in page objects, testid only | yes | yes |
| `waitForTimeout` / `test.skip` | none | none |

Same quality, 33% fewer requests and 16% lower cost for the CLI. This is the task the CLI was built for: the agent looks at a few pages and then spends its turns writing and running code.

Generated code: `results/s3-mcp/` and `results/s3-cli/`.

## What I take from this

- For a coding agent that writes and maintains tests, I would default to the **CLI**. It was cheaper in S2 and S3 and never worse on quality.
- **MCP** still has a place when the job is purely "look at this live page and tell me what's wrong", like healing a locator. It was slightly more efficient there. It also works in chat clients that can't run shell commands, which the CLI can't.
- The token argument alone doesn't decide it anymore. With on-demand MCP tools, prompt caching and a 1M context, the difference is real but modest. Pick by task type.
- Neither belongs in CI. The agent writes the tests; `npx playwright test` runs them.

## Limitations

- One measured run per scenario per lab. LLM runs vary; my two MCP runs of S1 differed by about 20%. Treat small gaps as small.
- saucedemo.com is a well-known demo. The model may know some `problem_user` bugs from training. The S2 prompt asks for on-page evidence for every finding, and both reports include it, but an internal app would be a cleaner test.
- 10 other MCP tools from my global setup were visible in both labs. They were never loaded (0 tokens in the CLI lab), so they don't affect the comparison.
- The "Total code changes" line in `/cost` showed 0 for some runs that clearly edited files. I used `git diff` for code changes instead.
- Results are for Claude Code with Opus 5.5. Other agents handle MCP tool loading differently, so the gap may be bigger elsewhere.

## Repo layout

```
lab-mcp/        clean start for MCP runs (.mcp.json, .claude/settings.json, broken S1 spec)
lab-cli/        clean start for CLI runs (.claude/settings.json, broken S1 spec)
results/
  s2-mcp/       exploratory report + evidence screenshots from the MCP run
  s2-cli/       exploratory report + evidence screenshots from the CLI run
  s3-mcp/       page objects and specs the MCP agent wrote
  s3-cli/       page objects and specs the CLI agent wrote
  screenshots/  /context and /cost for every run
```

## Run it yourself

You need Node 18+, Git, Google Chrome and Claude Code.

```powershell
git clone https://github.com/bikashdehury919/playwright-mcp-vs-cli.git
cd playwright-mcp-vs-cli

cd lab-mcp
npm install
npx playwright install chromium
claude mcp list                 # should show playwright

cd ..\lab-cli
npm install
npm install -g @playwright/cli@0.1.21
playwright-cli install --skills
claude mcp list                 # should NOT show playwright
```

Then in each lab: `git init`, commit the clean start, start `claude`, paste a prompt, and take `/context` and `/cost` at the end. Reset with `git reset --hard` and `git clean -fd` before every run. Always check `git clean -fdn` first.

If you run it on your own app and get different numbers, I'd like to hear about it.

