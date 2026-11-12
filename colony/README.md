# Frank Colony — VERUS Operating Partners station

Delivery branch only. Nothing here is part of the website on `main`.

- `index.html` — the colony page. On load (and every 60s) it calls `GET /api/colony` on the same host.
- `art/` — generated art (kie.ai) the page draws from.

## /api/colony response shape

```json
{
  "hq":   { "agent": AGENT },
  "bays": [ { "id": "B01".."B09", "status": "open|live|sealed", "name": "...", "kind": "...", "agents": [AGENT] } ],
  "intake": { "offers": 0, "ideas": 0, "signups": 0, "spend": 0 }
}
```

AGENT = `{ code, name, tag, role, state, now, next, last, output, nextrun, week, note, mrr, day }`
- `state` is one of `work | learn | sleep | stall | dead`, computed by the SERVER from real output — never self-reported.
- `day` is 24 characters, one per hour: `w` work, `l` learn, `s` sleep, `x` sealed.
- `mrr` is a number (dollars per month), 0 when there is no revenue.

On a verusoperatingpartners.com host, if the API fails the page shows "Can't reach Frank" and nothing else — never sample data.
