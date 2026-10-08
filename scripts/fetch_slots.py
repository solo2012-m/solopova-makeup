#!/usr/bin/env python3
"""Fetch free slots from Cal.com public endpoint and write assets/slots.json."""
import json, urllib.request, urllib.parse, datetime, zoneinfo

SERVICES = [
    ("porocno-licenje", 7393742), ("poskusno-licenje", 7393743), ("dnevno-licenje", 7393744),
    ("vecerno-licenje", 7393745), ("lifting-licenje", 7393746), ("kreativno-licenje", 7393747),
    ("laminacija-trepalnic", 7393740), ("laminacija-obrvi", 7393748), ("obrvi-paket", 7393749),
    ("barvanje-obrvi", 7393750), ("korekcija-obrvi", 7393751), ("stajling-las", 7393752),
    ("podaljsevanje-las", 7393753),
]
TZ = zoneinfo.ZoneInfo("Europe/Ljubljana")
DAYS = 35

def fetch(event_id, start, end):
    inp = {"json": {"eventTypeId": event_id, "startTime": start, "endTime": end, "timeZone": "Europe/Ljubljana"}}
    url = "https://cal.com/api/trpc/slots/getSchedule?input=" + urllib.parse.quote(json.dumps(inp))
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (slots-sync)"})
    with urllib.request.urlopen(req, timeout=40) as r:
        data = json.loads(r.read().decode())
    return ((data.get("result") or {}).get("data") or {}).get("json") or {}

def main():
    now = datetime.datetime.now(datetime.timezone.utc)
    start = now.replace(minute=0, second=0, microsecond=0).isoformat().replace("+00:00", "Z")
    end = (now + datetime.timedelta(days=DAYS)).isoformat().replace("+00:00", "Z")
    out = {"updated": now.isoformat(), "timeZone": "Europe/Ljubljana", "slots": {}}
    for slug, eid in SERVICES:
        try:
            res = fetch(eid, start, end)
        except Exception as ex:
            print("ERR", slug, ex)
            continue
        days = {}
        for day, items in (res.get("slots") or {}).items():
            times = []
            for it in items:
                t = it.get("time")
                if not t:
                    continue
                dt = datetime.datetime.fromisoformat(t.replace("Z", "+00:00")).astimezone(TZ)
                if dt.date().isoformat() == day or True:
                    key = dt.date().isoformat()
                    days.setdefault(key, [])
                    days[key].append(dt.strftime("%H:%M"))
        for k in days:
            days[k] = sorted(set(days[k]))
        out["slots"][slug] = days
        print(slug, len(days), "days")
    with open("assets/slots.json", "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print("written assets/slots.json")

if __name__ == "__main__":
    main()
