---
title: Network Architecture
sidebar_position: 5
---

[![](https://mermaid.ink/img/pako:eNp9lE1v2zAMhv-KoHOD3nMYkC3dUHRZgmbbpd5BkRlHq00ZlJQsKPrfR1tyErlB7Is-HpF6X9J-k9qWIKdyMpkU6I2vYSoKyS_2KwVua3vQO0VefH8uUPDjwqYi1e6EdfalkMsWUKxtIA1iuXFAe6BC_ols96jWdNh6KWZtK-7FbPWY7bemhdogMDRXXp3mGWSwhH9AA5OmLk-Eqj467xiapeG1GGIyYYkrshocAzz9dM754VaJtodOVc-yno85I7ZgM-urIQHLkXvaNk1A44983QdtHUeBJrvv3nqWyNvfLHuKCtnhe_G7X81AT6BcoCyS-JkWc6_J_gXdW7RKw2w_uJjxlxvnGE5GoZ-DqcsktD8zChGpZ9gDBkjccMuRIWxnpB9xa6lJcNQ-IhbgyehTzWxtdIo2xI7c14DD5VQF6COTK1j0B4a7pdaI4IWCG1Se8gYYpdzERq3xqshsFJfhqR-IH-APll7zevTquzr2A_GA1fib6bW_RDsMVsmLS0Jb9KRiPyyRP3OD57Ur6aKIuaHYOGOHT0kj98Xi1lQsd0DPofMWuHRoRbAFAu71a3U-RTgX-oQN_dyB8k42QI0yJf_b3rqlQvodNGxQ938rVedmge_MqeDt-ohaTj0FuJNkQ7WT062qHc9CWyoPc6O4Mk1aff8PNmWg1g?type=png)](https://mermaid.live/edit#pako:eNp9lE1v2zAMhv-KoHOD3nMYkC3dUHRZgmbbpd5BkRlHq00ZlJQsKPrfR1tyErlB7Is-HpF6X9J-k9qWIKdyMpkU6I2vYSoKyS_2KwVua3vQO0VefH8uUPDjwqYi1e6EdfalkMsWUKxtIA1iuXFAe6BC_ols96jWdNh6KWZtK-7FbPWY7bemhdogMDRXXp3mGWSwhH9AA5OmLk-Eqj467xiapeG1GGIyYYkrshocAzz9dM754VaJtodOVc-yno85I7ZgM-urIQHLkXvaNk1A44983QdtHUeBJrvv3nqWyNvfLHuKCtnhe_G7X81AT6BcoCyS-JkWc6_J_gXdW7RKw2w_uJjxlxvnGE5GoZ-DqcsktD8zChGpZ9gDBkjccMuRIWxnpB9xa6lJcNQ-IhbgyehTzWxtdIo2xI7c14DD5VQF6COTK1j0B4a7pdaI4IWCG1Se8gYYpdzERq3xqshsFJfhqR-IH-APll7zevTquzr2A_GA1fib6bW_RDsMVsmLS0Jb9KRiPyyRP3OD57Ur6aKIuaHYOGOHT0kj98Xi1lQsd0DPofMWuHRoRbAFAu71a3U-RTgX-oQN_dyB8k42QI0yJf_b3rqlQvodNGxQ938rVedmge_MqeDt-ohaTj0FuJNkQ7WT062qHc9CWyoPc6O4Mk1aff8PNmWg1g)


## Actor Overview

### Kariba

#### Policy Engine

The policy engine defines the funding policy for the program.
It takes as input, preferences from the community (e.g. governance votes)
and metrics as measured by OSO,
and produces a funding schedule to the funding agent.

Some example policies we could take inspiration from:
- **linear**
    - users directly choose how much projects get (e.g. Optimism RF3)
- **quadratic** - users influence quadratic funding (e.g. Gitcoin matching funds)
- **metric funding** - users choose which metrics are worth funding, which generates a project funding schedule (e.g. Optimism RF4)

### Funding agent / contracts

The policy engine should produce a funding schedule, that defines how much
each project receives per funding period.
The funding agent takes the schedule and allocates funding into onchain
contracts for the projects to claim.
Funding agents are often empowered by an ecosystem treasury,
but in theory anyone could contribute to a funding pool.

### Ecosystem

#### Projects / Users

Developers build applications, services, and experiences for users,
which bring revenue to the ecosystem.
The goal is to fund the work that best delivers value to users
and increases revenue for the ecosystem.
In crypto, this usually comes in the form of transaction fees,
but any revenue can work (including enterprise sales).

#### Goverance

The primary purpose of governance in this model is to define
what "good" looks like.
Good will look different in every ecosystem,
and embodies a unique combination of goals and strategy
into a North Star for the entire ecosystem.

### Open Source Observer

OSO serves as the measurement infrastructure across the entire
ecosystem, measuring governance, project activity,
user behavior, and financial flows.
As an open source, open data, open infrastructure data pipeline,
a public community of data scientists and engineers evolve the
data models, insights, and metrics, 
used for better governance.


