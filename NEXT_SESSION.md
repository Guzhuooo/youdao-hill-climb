# Version 1.2.1 completion record

- Added a small menu-only `!` About entry without covering the driving HUD controls.
- Added a modal project introduction and author credit: GuZhuooo.
- Added a repeatable temporary backdoor: five quick author taps grant 10000000 coins and save immediately.
- Migrated progress from `hill_climb_progress_v7` to the Falcon storage namespace `/userdata/miniapp/hill_climb_ridge/progress.json`.
- Confirmed the requested `/userdate` directory does not exist; `/userdata/miniapp` is the real firmware path.
- Confirmed with a minimal device probe that QuickJS `std`/`os` are unavailable (`could not load module filename 'std'`). The current public Falcon API has no file API, so physical-path JSON output remains blocked pending a matching native JSAPI build environment.
- Real-device evidence confirms About layout, reward activation, wallet update to 10000000, and persistence after app switching.
- Physics parameters and four-map/four-vehicle content were not changed.
- Release: ui/8001799000000002.1_2_1.amr and dist/youdao-hill-climb-1.2.1-cv182x.amr.
- SHA-256: $hash.
