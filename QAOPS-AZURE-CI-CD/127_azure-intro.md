# Azure Setup — Creating a Playwright Workspace (Notes)

## Goal of this lecture
Create the **cloud side** of QA Ops: an Azure account and a **Playwright workspace**. Later, tests started from our local
machine (and later from the GitHub Actions pipeline) will run on Azure's cloud browsers, and the reports will be shown in this workspace.

## Step by step (what was demonstrated)
1. **Create an Azure account**
   - Go to `azure.microsoft.com` → **Get started with Azure** → choose **Try Azure for free**
     (the "Pay as you go" plan is not needed for practice).
   - Sign in with / create a Microsoft account.
   - Sign-up may ask for a **credit card**. The first period is free, and per the instructor you are **not charged while you stay on the free model**.
     Money is only taken if you later change to a paid subscription. You can deactivate the service after practising.
   - After sign-up you land on the **Azure portal**.
2. **Create a resource**
   - In the portal click **Create a resource** and search for **Playwright workspace** (Azure has Playwright support built in).
   - Click **Create**.
3. **Fill in the workspace details**
   | Field | What to enter / meaning |
   |---|---|
   | **Subscription** | Your plan, e.g. "Azure subscription 1". If none is shown, use the link to create/apply a subscription first. |
   | **Workspace name** | 3-24 characters. All test runs and reports for this project sit in this workspace (instructor used `Rahul Shetty Academy playwright`). |
   | **Region** | Pick one close to you. |
   | **Reporting** | **Enable** it - needed for the dashboard (run summary, failures, traces, screenshots). |
   | **Storage account** | Where reports/artifacts are kept. Use the existing one, or create a new one if the list is empty (we revisit this later when it is actually needed). |
   | **Resource group** | The parent container - see below. Create a new one if you have none. |
4. Click **Review + create** → **Create**. Deployment takes **up to about 5 minutes**.
5. When deployment shows complete, open the details: you will see **the workspace + the storage account** that were created.
   Click **Go to resource** and you can see the **Test runs** area (empty for now).

## What is a Resource Group? (analogy from the lecture)
- A **parent container** that holds related Azure instances (workspaces, storage accounts...).
- Example: a "Finance unit" has 4 projects. Each project = one workspace; the unit = one resource group.
- You can apply **policies and permissions at the resource-group level** (e.g. a proxy, blocking some web pages) and every child
  inside **inherits them automatically**.
- Parent = resource group; children = the workspaces/storage under it.

## Terms
- **Subscription**: your billing plan; it limits how much you can scale (e.g. how many parallel workers). Free trial credit is given first.
- **Playwright workspace**: Azure's home for your Playwright runs: cloud browsers to execute tests **plus** reports.
- **Region**: the Azure data-centre location where it is created.
- **Storage account**: cloud storage used for the test artifacts and reports.
- **Resource group**: container/parent for related resources, used for common policies and permissions.

## Where this fits in the QA Ops plan
- This is **Part 1 (Azure first, from local)** from the plan in `126_plan-to-implement-qaOps.md`.
- End result of this lecture: the cloud is ready. Nothing in our project code has changed yet.
- **Next lecture:** go back to the local workspace (VS Code) and connect it to this workspace, so execution is delegated to Azure
  and results appear in the portal's **Test runs**.

## Things to keep in mind
- **Portal wording changes.** Microsoft renames and moves things over time. The lecture's service was "Microsoft Playwright Testing";
  Microsoft's current docs call it **Playwright Workspaces** (under Azure App Testing), described as "a fully managed cloud browser
  platform" that runs Playwright tests on cloud-hosted browsers. If your screens differ from the lecture
  (names, steps, or what is offered in the free tier), follow the current Microsoft docs:
  https://learn.microsoft.com/en-us/azure/app-testing/playwright-workspaces/overview-what-is-microsoft-playwright-workspaces
- **Check cost and free limits yourself** before running big tests; the lecture's "free for the first month" statement may not match your account.
- **Never commit secrets.** Any access token/URL for the workspace goes into environment variables (locally) and GitHub secrets (in the pipeline), not into code.
