# SparseMoney 2.0

### Round-Up Reconciliation & Risk Control Platform

**Exathon 2026 · Track 01 --- Money, Risk & Regulation**

> **Every rupee tracked, every mismatch explained.**

SparseMoney 2.0 connects automated micro-savings with financial
reconciliation and risk control. It demonstrates how spare change from
everyday purchases can be calculated, recorded in a wallet ledger,
allocated to simulated investments, and checked across bank, wallet, and
investment records.

The key idea is not only to help users save small amounts. It is to make
the complete financial journey easier to verify, investigate, and
explain.

> **Prototype status:** This is a hackathon prototype. Bank
> transactions, Account Aggregator-style feeds, and investment orders
> are simulated unless a specific integration is implemented and
> verified. Do not use real customer financial data or treat this
> project as a certified banking, investment, accounting, or regulatory
> system.

------------------------------------------------------------------------

## Table of Contents

-   [The Idea in One Minute](#the-idea-in-one-minute)
-   [Problem Statement](#problem-statement)
-   [Our Solution](#our-solution)
-   [Example: Every Rupee Accounted
    For](#example-every-rupee-accounted-for)
-   [End-to-End Workflow](#end-to-end-workflow)
-   [Core Features](#core-features)
-   [Three-Way Reconciliation](#three-way-reconciliation)
-   [Risk Rules and Exception
    Handling](#risk-rules-and-exception-handling)
-   [Ledger and Audit Principles](#ledger-and-audit-principles)
-   [User Interfaces](#user-interfaces)
-   [Technology and Architecture](#technology-and-architecture)
-   [Demo Scenarios](#demo-scenarios)
-   [Project Status and Scope](#project-status-and-scope)
-   [Getting Started](#getting-started)
-   [Security and Financial Safety](#security-and-financial-safety)
-   [Future Scope](#future-scope)

------------------------------------------------------------------------

## The Idea in One Minute

A customer spends **₹243**. SparseMoney calculates the round-up to ₹250
and identifies **₹7** as the expected spare-change contribution.

That ₹7 should be recorded in the savings wallet. When the user's
eligible savings pool reaches a configured threshold, the platform can
create a **simulated investment order**.

But what happens if the wallet receives only ₹5? Or the same bank event
arrives twice? Or the original purchase is refunded after the round-up
has been saved?

A conventional transaction history may show individual events without
explaining whether all related records agree. SparseMoney 2.0 adds a
financial control layer that compares records across the **bank, wallet,
and investment** lifecycle, flags discrepancies with deterministic
rules, tracks investigations, and preserves a traceable history of
actions.

**Core concept: Micro-savings + Financial integrity.**

## Problem Statement

People can find it difficult to save consistently, and small everyday
purchases can make spare-change saving a useful starting point. However,
once savings contributions move between separate financial
components---such as a bank transaction feed, a wallet ledger, and an
investment order system---keeping every record consistent becomes a
different problem.

These systems may record related events at different times or with
different statuses. Events can be delayed or duplicated; refunds may
require reversals; wallet credits may differ from expected amounts; and
an investment order may not agree with the wallet movement intended to
fund it. When records are disconnected, finance or operations teams may
need to compare them manually, investigate exceptions separately, and
reconstruct why a balance or order has a particular status.

SparseMoney 2.0 addresses this operational challenge by combining a
round-up savings flow with a reconciliation and risk-control layer. It
aims to make discrepancies visible, explain why a rule was triggered,
support controlled investigation and correction, and provide an
auditable history.

### Why it matters

-   **Transaction integrity:** prevent duplicate events from silently
    creating duplicate financial processing.
-   **Financial accuracy:** compare expected and recorded amounts.
-   **Investment funding visibility:** identify orders and wallet
    movements that do not correspond.
-   **Risk visibility:** surface potentially important discrepancies for
    review.
-   **Accountability:** track exception ownership, investigation notes,
    and resolution history.

A mismatch is evidence that records need investigation; it is not
automatically proof of fraud or a confirmed financial loss.

## Our Solution

SparseMoney 2.0 has two connected layers.

### 1. Automated micro-savings layer

1.  Receive a bank transaction event (simulated in the prototype).
2.  Validate the event and check its idempotency key.
3.  Calculate the round-up contribution using a configurable interval.
4.  Record the wallet movement in the ledger.
5.  Check the savings threshold and eligibility conditions.
6.  Create and track a simulated investment order when eligible.

### 2. Financial control layer

1.  Compare bank, wallet, and investment records.
2.  Identify matched records and potential discrepancies.
3.  Apply deterministic, explainable risk rules.
4.  Open an exception with evidence and a risk level.
5.  Allow an authorised operator to investigate and document a
    resolution.
6.  Record correcting movements as new ledger entries rather than
    silently rewriting history.
7.  Re-run reconciliation and produce operational reports.

**SparseMoney does not just move spare change. It verifies the financial
journey of each contribution.**

## Example: Every Rupee Accounted For

### Normal transaction

  Item                      Amount
  ---------------------- ---------
  Original purchase           ₹243
  Rounded target              ₹250
  Expected round-up             ₹7
  Actual wallet credit          ₹7
  Result                   Matched

### Faulty transaction

  Item                     Amount
  ---------------------- --------
  Original purchase          ₹243
  Rounded target             ₹250
  Expected round-up            ₹7
  Actual wallet credit         ₹5
  Difference               **₹2**

The reconciliation engine flags an amount mismatch. The rule engine
explains the difference and can place the **affected contribution or
pool** on hold according to the implemented eligibility logic. An
operator can inspect the source records, record the investigation, and
create a correction if appropriate. The system then re-runs
reconciliation to verify the resulting state.

All monetary calculations should use integer **paise** internally to
avoid floating-point rounding errors.

## End-to-End Workflow

``` text
01. BANK TRANSACTION
        |
        v
02. TRANSACTION INGESTION
   Validate event + idempotency check
        |
        v
03. ROUND-UP ENGINE
   Calculate expected spare change
        |
        v
04. WALLET LEDGER
   Record savings contribution
        |
        v
05. INVESTMENT ENGINE
   Check threshold + eligibility
        |
        v
06. INVESTMENT LEDGER
   Record simulated order and allocation
        |
        v
07. THREE-WAY RECONCILIATION
   Compare bank <-> wallet <-> investment
        |
        v
08. RISK DETECTION
   Apply deterministic rules
        |
        v
09. EXCEPTION MANAGEMENT
   Investigate -> document -> correct -> re-check
        |
        v
10. AUDIT & REPORTING
   Traceable history + reconciliation reports
```

The first six stages represent the intended financial activity.
Reconciliation and risk checks validate whether related records agree.
Exceptions are reviewed and resolved through controlled actions rather
than by deleting the original evidence.

## Core Features

### Round-up engine

-   Configurable rounding interval, such as the next ₹10.
-   Calculates the expected contribution from a transaction.
-   Links each contribution to its originating transaction.
-   Example: ₹243 rounds to ₹250, producing an expected ₹7 contribution.

### Transaction ingestion and idempotency

-   Validates incoming events before processing.
-   Uses a stable transaction/event identifier to detect repeated
    delivery.
-   Prevents a duplicate event from creating a second contribution when
    the idempotency logic is implemented correctly.
-   Keeps the repeated attempt available for review or logging where
    supported.

### Wallet and investment records

-   Tracks wallet credits, debits, reversals, and adjustments.
-   Uses a double-entry-style ledger design for financial movements.
-   Represents amounts in paise internally.
-   Tracks simulated investment orders and their relationship to wallet
    funding.
-   Investment eligibility should consider unresolved high-risk
    exceptions linked to the affected funds.

### Three-way reconciliation

-   Compares bank transactions, wallet entries, and investment records.
-   Checks transaction references, expected amounts, funding movements,
    and statuses.
-   Identifies missing counterparts, amount differences, duplicates, and
    inconsistent order funding.
-   Supports repeatable reconciliation runs and traceable results.

### Explainable risk rules

Each rule has a stable identifier and a clear reason. Example rules
include:

  -----------------------------------------------------------------------
  Rule                    Example condition       Typical severity
  ----------------------- ----------------------- -----------------------
  R1                      Expected wallet credit  Medium
                          differs from actual     
                          credit                  

  R2                      A transaction/event is  High
                          processed more than     
                          once                    

  R3                      A refund has no         High
                          corresponding round-up  
                          reversal                

  R4                      An investment order has High
                          no matching wallet      
                          debit                   

  R5                      Round-up frequency is   Low/Medium; optional
                          unusual compared with a 
                          baseline                

  R6                      Reconciliation has      Medium; optional
                          exceeded its allowed    
                          time                    
  -----------------------------------------------------------------------

The core prototype scope prioritises R1--R4. R5 and R6 are optional
extensions unless the implementation demonstrates them. Risk levels
should be derived from documented rules and available evidence, not
described as machine-learning predictions.

### Exception management

An exception can contain:

-   Exception identifier and type.
-   Linked source transactions.
-   Expected and observed values.
-   Calculated discrepancy.
-   Triggered rule and explanation.
-   Risk level and status.
-   Assigned owner.
-   Investigation notes and resolution reason.

Typical status progression:

`Pending -> Under Review -> Resolved`

A resolved case should be checked through re-reconciliation. A missing
match should not automatically be called fraud.

### Audit trail

The audit history is intended to record important events such as
ingestion attempts, reconciliation runs, exception assignment, status
changes, investigation notes, and corrective actions. Entries should
include the actor or service, action, timestamp, related record, and
reason where available.

A hash-linked audit chain can make tampering detectable if implemented
and verified; it does not by itself guarantee absolute immutability.

### Reports

The planned operational reports include:

-   Total records processed.
-   Matched and unmatched counts.
-   Discrepancy amounts.
-   Open exceptions and their age.
-   Reconciliation run history.
-   Resolution progress.
-   Daily/monthly close checklist.
-   CSV/PDF export where implemented.

Metrics must be calculated from actual records and reconciliation
results rather than hardcoded.

## Three-Way Reconciliation

SparseMoney compares three related sources of financial truth:

  -----------------------------------------------------------------------
  Source                  What it records         What SparseMoney checks
  ----------------------- ----------------------- -----------------------
  **Bank**                Original transactions,  Is the source event
                          refunds, reversals,     present and valid?
                          statuses                

  **Wallet**              Round-up credits,       Does the recorded
                          debits, reversals,      movement equal the
                          adjustments             expected amount?

  **Investment**          Simulated orders,       Does each order
                          funding references,     correspond to the
                          order statuses          correct wallet funding
                                                  movement?
  -----------------------------------------------------------------------

### Examples of discrepancies

-   **Missing round-up:** a bank transaction exists, but the expected
    savings contribution is missing.
-   **Amount mismatch:** expected ₹7, recorded credit ₹5.
-   **Duplicate event:** the same transaction identifier is received
    again.
-   **Missing reversal:** a refunded purchase has no corresponding
    savings reversal.
-   **Stuck funds:** a wallet debit exists, but no corresponding
    successful investment order is found.
-   **Unfunded order:** an investment order exists without a matching
    wallet debit.

Reconciliation outcomes should distinguish **matched**, **unmatched**,
and **discrepancy** states. Timing differences must be considered before
classifying an item as an error.

## Risk Rules and Exception Handling

The risk engine is designed to apply explicit rules to reconciliation
results. Each alert should answer:

1.  **What happened?** The detected condition.
2.  **Why was it flagged?** The rule identifier and evidence.
3.  **What is affected?** The linked transaction or contribution.
4.  **What should happen next?** A recommended investigation or
    correction.
5.  **What happened afterwards?** The operator's decision and
    re-reconciliation result.

Example explanation:

> Rule R1 triggered: expected wallet credit ₹7; actual credit ₹5;
> difference ₹2. The affected contribution requires review. Check the
> source transaction and wallet entry before recording a correction.

This is a deterministic, evidence-based explanation. An optional
language model may rephrase evidence for readability, but it must not
replace the financial calculation or invent evidence.

## Ledger and Audit Principles

SparseMoney follows these financial-system design principles:

-   **Integer monetary arithmetic:** store INR amounts as integer paise
    for calculations.
-   **Traceable references:** link round-ups, wallet movements, and
    investment orders to their originating records.
-   **Idempotent processing:** repeated delivery of the same event
    should not create duplicate financial effects.
-   **Corrective entries:** preserve original ledger entries and
    represent corrections as new entries.
-   **Controlled investment eligibility:** hold affected funds when an
    applicable high-risk exception remains unresolved, where the
    implemented logic supports it.
-   **Evidence-first investigation:** explain alerts using source
    records and deterministic rules.
-   **Human-controlled resolution:** require authorised action and a
    reason for case resolution or financial correction.
-   **Auditable operations:** retain reconciliation runs and important
    case events.

These are design goals; refer to the implementation and tests before
claiming that a specific control is fully operational.

## User Interfaces

### Customer dashboard

The intended customer experience provides visibility into:

-   Wallet balance and accumulated round-up savings.
-   Round-up transaction history.
-   Simulated investment status.
-   Reconciliation state for a contribution.
-   Plain-language notices for reversals or items requiring review.

### Operations / finance dashboard

The operations experience focuses on financial control:

-   Reconciliation summary and matched/unmatched records.
-   Discrepancy queue with risk level and status.
-   Source-record evidence and rule explanations.
-   Exception assignment and investigation notes.
-   Resolution and re-reconciliation status.
-   Audit history and reconciliation reports.
-   Fault-injection controls for repeatable demonstrations, where
    implemented.

The customer dashboard explains the user's activity; the operations
dashboard supports investigation and accountability.

## Technology and Architecture

The current repository's actual dependencies and working integrations
are the source of truth. The following is the **target architecture for
SparseMoney 2.0**, not a claim that every component is already
connected.

  -----------------------------------------------------------------------
  Layer                               Intended technology /
                                      responsibility
  ----------------------------------- -----------------------------------
  Frontend                            React + TypeScript

  UI styling                          Tailwind CSS

  Charts                              Recharts

  UI animation                        Framer Motion, where used

  Backend/API                         Node.js + Express.js, where
                                      implemented

  Data store                          Supabase PostgreSQL, where
                                      configured

  Financial data                      Bank transaction, round-up, wallet,
                                      investment and reconciliation
                                      records

  Background processing               Cron / scheduled function for
                                      incremental reconciliation, when
                                      configured

  Reporting                           CSV/PDF export, as implemented

  Optional AI                         Evidence-grounded wording
                                      assistance only; not the source of
                                      financial decisions
  -----------------------------------------------------------------------

### Conceptual architecture

``` text
Customer Dashboard                 Operations Dashboard
         \                                /
          \                              /
             Frontend / API Layer
                     |
          Transaction & Round-up Services
                     |
           Wallet & Investment Records
                     |
        Reconciliation + Deterministic Rules
                     |
          Exceptions + Audit + Reports
                     |
        PostgreSQL / Application Data Store

External bank and investment events are simulated in the prototype
unless a real integration is explicitly implemented and verified.
```

Do not claim a live bank, Account Aggregator, investment provider,
Exasol, Supabase, or AI integration unless it is present and tested in
the current codebase. Keep privileged credentials on the server side and
never expose them in frontend code.

## Demo Scenarios

Use synthetic data and demonstrate the same financial journey in three
scenarios.

### Scenario 1 --- Normal round-up

1.  Generate a simulated ₹243 purchase.
2.  Show the expected ₹7 round-up.
3.  Record the wallet contribution.
4.  Show the relevant records as matched.
5.  Show the resulting customer and operations views.

### Scenario 2 --- Incorrect wallet credit

1.  Inject a controlled fault so the wallet records ₹5 instead of the
    expected ₹7.
2.  Run reconciliation.
3.  Show the ₹2 difference.
4.  Show the R1 explanation and affected-funds hold if implemented.
5.  Open the exception and inspect the evidence.

### Scenario 3 --- Duplicate event and resolution

1.  Deliver the same simulated bank event again.
2.  Show the idempotency result and event log if implemented.
3.  Investigate the exception and record a reason.
4.  Create a correcting ledger entry where appropriate; do not erase the
    original entry.
5.  Re-run reconciliation and show the updated case status and audit
    history.
6.  Review or export the report if available.

Clearly label demo data and distinguish working features from mocked or
planned screens.

## Project Status and Scope

SparseMoney 2.0 is being developed as a hackathon prototype for Exathon
2026, Track 01 --- Money, Risk & Regulation.

To keep the README accurate for reviewers, use these labels in the
application and documentation:

-   **Implemented:** present in the repository and verified through a
    repeatable test or demo.
-   **Simulated:** generated locally or supplied as demo data rather
    than received from a live financial provider.
-   **Proposed / In development:** part of the target design but not yet
    demonstrated end to end.
-   **Future scope:** planned after the hackathon prototype.

The target MVP focuses on a transaction simulator, round-up calculation,
wallet and simulated investment records, three-way reconciliation, core
rules R1--R4, exception management, audit history, and at least one
useful reconciliation report. Only describe an item as implemented after
verifying it in the current application.

## Getting Started

### Prerequisites

For the current Base44-based repository workflow, you may need:

-   Git
-   Node.js and npm
-   Base44 CLI
-   Deno, if required by the configured local Base44 backend

### Clone and install

Replace the placeholders with your actual repository URL and directory
name.

``` bash
git clone <YOUR_PROJECT_GIT_URL>
cd <YOUR_PROJECT_DIRECTORY>
npm install
```

### Run with Base44

Install the CLI if needed:

``` bash
npm install -g base44@latest
```

Sign in and link the repository:

``` bash
base44 login
base44 link
```

Start local development:

``` bash
base44 dev
```

Open the local URL printed by the CLI, commonly `http://localhost:5173`.

Follow the repository's actual setup instructions if its scripts or
runtime differ. Do not run a second frontend development server unless
the project setup explicitly requires it.

### Demo data

-   Use synthetic transactions for demonstrations.
-   If local entities are in-memory, data may be cleared when the local
    backend restarts.
-   Do not use remote mode unless you deliberately intend to work with
    the configured hosted data.
-   Verify that dashboards, reconciliation results, and exception states
    are backed by the active dataset rather than static display values.

## Security and Financial Safety

-   Do not upload real customer financial records unless authorised and
    appropriately protected.
-   Do not store passwords, service-role keys, or database credentials
    in source control or frontend bundles.
-   Validate all imported or generated transaction records.
-   Use idempotency keys to prevent repeated processing.
-   Preserve source identifiers and original records.
-   Restrict exception resolution and financial corrections to
    authorised users.
-   Do not interpret a mismatch as proof of fraud without evidence.
-   Treat optional AI output as explanatory assistance, not
    authoritative financial logic.
-   Real financial integrations require appropriate partners, security
    review, operational controls, and assessment of applicable legal and
    regulatory obligations.

SparseMoney 2.0 is **not** a certified banking, investment, accounting,
fraud-prevention, or regulatory-compliance product.

## Future Scope

Potential extensions after the core prototype is validated:

-   Real bank data access through appropriate regulated partners and
    consent mechanisms.
-   Account Aggregator integration, subject to eligibility and partner
    requirements.
-   Real investment provider integration through appropriate authorised
    partners.
-   More advanced reconciliation for partial settlements and timing
    differences.
-   Hash-linked audit verification and stronger audit controls.
-   Evidence-grounded AI explanations.
-   Advanced anomaly analysis and configurable risk policies.
-   Expanded close-readiness analytics and scheduled reporting.
-   Group savings and additional savings experiences.

These are future possibilities, not claims about the current prototype.

------------------------------------------------------------------------

## Why SparseMoney 2.0?

**Micro-savings make the money move. Reconciliation makes the movement
explainable. Risk controls make discrepancies actionable. Audit history
makes decisions traceable.**

**SparseMoney 2.0 --- Every rupee tracked, every mismatch explained.**

Built for **Exathon 2026 · Track 01 --- Money, Risk & Regulation**.
