---
title: Implementation
sidebar_position: 6
---

:::warning
These are very preliminary thoughts for the purposes of a prototype.
All of this is likely to change very quickly.
:::

## Product Overview

### Goals

- **Simple**: The application should be simple enough for the average delegate/voter to do without hand-holding
- **Low overhead**: We want to reduce the amount of work a voter needs to do to get quality results.
- **Composable**: We want to be able to replace different modules as necessary to easily evolve with the community.

## Users

1. **Admin** - has the power to create/edit/cancel a funding pool.
2. **Funder** - wants to contribute financial resources to a funding pool.
3. **Project** - wants to be rewarded for impact

## Flows

### Create a funding pool

For a program with many badgeholders,
they would each get their own funding pool allocation

1. Admin logs in
2. Admin fills out a form with: name, description, funding schedule (start/end/frequency), funding cap per period, minimum number of projects.
3. Admin creates funding pool
4. Funding pool is shareable via link

### Email

#### Funding review

Before the end of the funding period when settlement happens,
admins will get an email overview with:
- Total funding going out
- Which projects will be funded and by how much (with diffs against previous period)
- Link to confirm/authorize the distribution

They will be redirected to the application where they can:
- Edit the metric weights for how allocations are determined
- Edit/remove any project allocation
- Scale up/down the total distribution for this period
- Confirm the transaction to authorize the spending

#### General notifications
- Warnings if there aren't enough projects participating before the start date
- Warnings if the funding pool is low on funds
- Notifications if the funding pool is starting / ending

### Edit a funding pool

1. Admin views all of their funding pools in a dashboard
2. Admin can go in and edit any funding pool (e.g. metric weights)
3. Admin gets to see who funded their funding pool
4. Admin sees all registered projects and their allocation for the next distribution.

### Contribute to a funding pool

1. Funder gets a share link for a funding pool.
2. Funder can see how the funding pool is configured and a history of distributions
3. Funder enters how much to fund the pool.
4. Funder sends a transaction to add funds.

### Register your project

1. Project logs in with GitHub.
2. Create a project
3. Enter a destination wallet address.
4. Enter their oss-directory `project_name`.

### Project applies for a funding pool

1. Project receives a share link from the funding pool admin
2. Project clicks "Register".

### Project withdraws funds

1. Project can see all funding pools they are apart of
2. Project can see their total balance
3. Project can withdraw their balance to designated wallet

### Analytics

Admin can see:
- How much they've funded across all projects
- What other funding these projects have gotten

Funder can see:
- Total they've distributed across all projects over all funding pools.

Projects can see:
- How much they've received and from which funding pools

## Components

### Frontend

Propose we get running with a simple Next.js application + Plasmic + Supabase.
We can no-code most of the application surfaces

### SDK

This would wrap some other funding primitive (e.g. 0xSplits SDK)
and complete the actions above, including:

- Create funding pool
- Edit funding pool
- Authorize distribution
- Cancel funding pool

We can import these functions into Plasmic for use.