# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This directory holds the **Rosaville bakery ecosystem**: two frontends and one shared backend, not unrelated repos.

- `rosaville-front-last/` — the public customer-facing website (frontend only)
- `rosaville-admin-dashboard/` — the shop owner's back-office dashboard (frontend only)
- `rosaville-backend/` — the shared Django + DRF + PostgreSQL API both frontends call

Detailed commands and architecture for each live in `.claude/rules/` and load automatically. See `.claude/rules/ecosystem.md` for the standing goals — platform independence (done locally), connecting the two apps' data (partly done via the shared backend), and publishing (not started) — that should inform any cross-cutting or architectural work here.
