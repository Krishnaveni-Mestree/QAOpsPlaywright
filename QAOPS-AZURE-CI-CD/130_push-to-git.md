# Pushing the Project to a GitHub Repository

## Goal
Tests already run on Azure from your laptop and the report is visible in the portal.
Next step toward CI/CD: put the code in a **remote GitHub repository**, so a pipeline (GitHub Actions, next lecture) can run it automatically.

## Setup
1. Create a **GitHub account** (github.com -> Sign up).
2. Create a new repository, e.g. `QAOpsPlaywright`. Visibility **public** (so others can view it), keep the other defaults, click **Create repository**. You get an empty repo.
3. Install **Git** locally (check with `git --version`):
   - Windows: download the installer from git-scm.com and click through it.
   - Mac: `brew install git` (install Homebrew first if you don't have it).

## Commands (run in the project root)
```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/<your-username>/QAOpsPlaywright.git
git push -u origin main
```
| Command | Meaning |
|---|---|
| `git init` | Turns the folder into a Git repository (prints "Reinitialized" if it already was one) |
| `git add .` | Moves **all** project files to the **staging** area. Only staged files can be committed |
| `git commit -m "msg"` | Saves the staged files as a snapshot in your **local** history |
| `git branch -M main` | Names the branch `main` |
| `git remote add origin <url>` | Tells your local repo **where the remote repository is**. Without it, Git has no idea where to push |
| `git push -u origin main` | Uploads `main` to GitHub. `-u` remembers it, so later `git push` is enough |

- The empty-repo page suggests `git add README.md`. In our case we already have many files, so we use `git add .`.
- `remote add origin` fails with **"remote origin already exists"** if it was set before. That is fine. Use `git remote -v` to check the URL, or `git remote set-url origin <url>` to change it.
- Use `git status` any time to see what is staged, modified or committed.

## Authorization when pushing
- You can't push to a repo you aren't authorized for. The first push asks you to sign in:
  - **Browser sign-in** (lecture): choose "Sign in with browser" -> **Authorize**.
  - **Personal Access Token (PAT)** over HTTPS: enter your username, and paste the token as the password.
- After a successful push, refresh the repo page on github.com to see all your files.

## Problems we hit (and fixes)
| Error | Cause | Fix |
|---|---|---|
| `403 Permission to <repo> denied to <other-user>` | Git/keychain used a **different GitHub account** (e.g. a work login) | Set a **repo-local** identity: `git config --local user.name/user.email`. Add `credential.useHttpPath true` and `credential.https://github.com.username <user>` so the keychain keeps separate logins per repo |
| `403 ... denied to <your-user>` | Right account, but the **token has no write access** | Fine-grained token: Repository access -> select the repo, Repository permissions -> **Contents: Read and write**. Classic token: tick `repo` |
| `refusing to allow a Personal Access Token to create or update workflow ... without workflow scope` | The commit contains `.github/workflows/*.yml` | Fine-grained token: add **Workflows: Read and write**. Classic token: add the **`workflow`** scope |

- **Commit author**: the commit uses `user.name` / `user.email`. Check with `git log --format='%an <%ae>'`. To fix the last unpushed commit: `git commit --amend --reset-author --no-edit`.
- **Never share or screenshot a token.** If you do, regenerate or delete it.
- Clear a wrong saved credential for one repo: `git credential reject` (with the host/path/username on stdin), or remove it in Keychain Access.

## Where we are in the architecture
- Done: Azure Playwright Workspace, cloud test runs, reporting dashboard, **code on GitHub**.
- Next lecture: **GitHub Actions** and the **workflow YAML file** to run the tests automatically on every push (CI/CD).
