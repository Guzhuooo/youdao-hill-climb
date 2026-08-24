# Current project state — 2026-08-24

## Frozen X5 edition

- Version: 1.2.1
- Location: `releases/x5-1.2.1/`
- Contains: AMR, source ZIP, real-device screenshot, README and SHA-256 list.
- Target verified profile: X5/cv182x, firmware 3.4.6, logical 800×254.
- This directory is the immutable X5-specific handoff.

## Adaptive edition

- Version: 1.3.0
- Location: `releases/adaptive-1.3.0/`
- Strategy: `setViewPort(800)` + full-height flex page + fixed bottom controls + bottom-anchored 166-unit physics scene.
- Detailed design: `docs/SCREEN_ADAPTATION.md`.
- Automated layout/storage/physics/content tests pass and AMR packaging succeeds.
- Current limitation: ADB disconnected before 1.3.0 installation, so only X5 1.2.1 has fresh real-device evidence. Other models remain unverified candidates.

## Repository

- GitHub: `https://github.com/Guzhuooo/youdao-hill-climb`
- Branch: `main`

## Persistence and backdoor

- Falcon Storage namespace: `/userdata/miniapp/hill_climb_ridge/progress.json`.
- It is a logical storage key, not an absolute-path JSON file.
- Five quick taps on `GuZhuooo` grant 10000000 coins and save immediately.
