# 07: Contact window + client-local clock

**What to build:** Every client shows their current local time and day, a
green / amber / red light for whether it's a reasonable hour to text them, and
"opens in Xh Ym" when it isn't — with your own IST time shown alongside. The
timezone is chosen from a dropdown on the client edit form.

**Blocked by:** 03, 05.

**Status:** ready-for-agent

- [ ] `derive.contactWindowStatus(client, now)` returns
      `{ level: green|amber|red, localTime, localDay, opensInMinutes|null }`:
      green inside `[09:00, 20:00)` client-local, amber in `[08:00, 09:00)` or
      `[20:00, 21:00)`, red otherwise; `opensInMinutes` is minutes to the next
      local 09:00 when not green.
- [ ] `derive.nextContactWindow` renders `opensInMinutes` as "opens in Xh Ym".
- [ ] A client with no `timezone` shows "timezone not set" and no light.
- [ ] The client edit form sets `timezone` from a dropdown of IANA names (US
      zones prominent); `contact_hours` is a free-text field shown as a caption
      near the light and does NOT change the light logic in Phase 1.
- [ ] The client record and each Clients-list row show the client's local time
      + day, the light, "opens in…" when amber/red, and the operator's current
      time from `OPERATOR_TZ` (default `Asia/Kolkata`). The times tick live
      (≤60s).
- [ ] Tests: green/amber/red boundaries; `America/Chicago` evaluated in both
      January and July (DST) gives the correct local time and level;
      `opensInMinutes` correct for a red and an amber case; missing timezone
      handled.
