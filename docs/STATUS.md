# Project Status

## Current state

All scripts running. Cron active. Logrotate configured. Dashboard live.

**Last major work (Phase 2 — June 2026):**
- Polling interval reduced from 1 min to 2 min
- `readtemp_utils.py` created — shared `get_data()` / `get_all_data()` replacing copy-pasted functions in three scripts
- `createChart-v3.py` switched to `get_all_data()` — chart now spans active + all rotated log files
- `createHtmlAndUpload-v6.py` and `sendEmailAndTemp-v4.py` import `get_data()` from utils
- Logrotate configured: `temperature.log` at 1 MB threshold (never deleted), script logs weekly (4 kept)
- `rotated/` directory created for all rotated files
- Daily email format updated: temperature now leads the subject and body preview

**Last minor work (November 2026):**
- 2026-11-21: Fixed logrotate data loss — `readtemp-data` changed from `rotate 0` (keeps none) to `rotate 9999` + `dateext`
- 2026-11-21: `pushTelemetry.py` `current_temp` now uses the latest raw reading instead of the partial-hour average
- 2026-11-21: `pushTelemetry.py` now also reads `rotated/temperature.log*`, so the dashboard chart survives rotations
- `sendEmailAndTemp-v4.py`: subject/body reordered to `<temp> C  —  <date>` so iOS mail preview shows the temperature immediately

---

## Next steps

1. Around 2026-12-01 `temperature.log` passes 1 MB and rotates. Verify `rotated/temperature.log-YYYYMMDD` exists and was not deleted, and that the dashboard chart still shows 30 days.
2. Consider aligning `pushTelemetry.py`'s log concatenation with `readtemp_utils.get_all_data()` (currently it has its own equivalent logic — not urgent)
3. Optional: rebuild hourly history for 2026-06-14 → 2026-10-04 from the GitHub history of `data/recent_temp.json`
4. Migration to Raspberry Pi 5 with new sensors (DS18B20 stays with the 3B+)

---

## Known issues

- **Data lost before 2026-10-05:** `rotate 0` deleted every rotated `temperature.log`. Fixed 2026-11-21.
- **Clock change (DST) hour:** at fall-back, the 01:00 hour has duplicate timestamps. `pushTelemetry.py` keeps one of each pair in an arbitrary order, so that one hourly point can vary by about 0.01°C. Negligible.

---

## Decisions and why

**2-minute polling (was 1 minute):** Keeps `temperature.log` under 1 MB for ~40 days per rotated file. All downstream consumers are interval-agnostic (hourly resample, last-row reads, visual chart at 30-day scale).

**`rotate 9999` + `dateext` for temperature.log:** Keeps every rotation in `rotated/` with fixed dated names. (Was wrongly `rotate 0` until 2026-11-21, which means keep none.)

**Dashboard `current_temp` = latest raw reading; chart = hourly averages:** Averages keep the JSON small (720 points instead of ~21,600). They were never needed for the Netlify credit limit, which counted deploys, not file size.

**Pi scripts not in GitHub:** Scripts are Pi-only runtime artifacts. Exception: `.gitignore` has `!pushTelemetry.py`, so a copy committed 2026-06-14 sits in the repo. It is a reference copy only (not what runs); last synced to the Pi version on 2026-11-21. Re-commit it whenever the Pi copy changes. `docs/` is the only Pi-side content pushed to GitHub. Dashboard code lives in `dashboard/`.

**`readtemp_utils.py` not in GitHub:** Pi-only. It is imported by scripts that also don't live in the repo.
