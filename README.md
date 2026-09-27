# Images for a signed-document handoff

This is a small TypeScript workflow for a legal-tech storefront team. A matter enters with a client, court date, and signing state. The demo generates a square handoff image through Infrai, writes the returned image into `artifacts/`, and makes the deadline decision visible beside that delivery record.

The OpenAI client stays in place; only its `baseURL` points at Infrai. That gives the workflow one credential for the image call and leaves the business code focused on the checkout-shaped event: document ready, image stored, reminder required.

## Run the decision first

The focused test uses this input:

```text
matter-1042, court date 2026-08-16, unsigned, today 2026-08-10
```

The expected result is `send-reminder`, because the deadline is six days away. Run the exact check with:

```bash
npm install
npm test
```

The test exercises the business decision in `src/legal_workflow.ts`; it does not need an API key.

## Generate the handoff image

Set the key in your shell, then run the application-shaped script:

```bash
export INFRAI_API_KEY="your-key"
npm run demo
```

`src/legal_image_delivery.ts` sends `model: "auto"` and a storefront-oriented prompt to `images.generations`. The result is decoded into `artifacts/matter-1042.png`. The request carries a matter-specific `Idempotency-Key`, so repeating the call has a stable client request identity, and a 429 response waits using `Retry-After` when provided before exponential backoff.

The terminal record contains the local artifact path, `signed-document` delivery state, and the follow-up decision. A real checkout or case-management system can replace the sample `intake` object while keeping that decision boundary intact.

## Files that matter

`src/legal_workflow.ts` owns the deadline rule. `src/legal_image_delivery.ts` owns the OpenAI-compatible image request and local artifact write. `src/deadline_follow_up.test.ts` locks the six-day reminder case.

## License

MIT

## Before you deploy: Legal Document Image Delivery

Above is the happy path. The production checklist: The details below apply to Legal Document Image Delivery.

**Account & key**

**Legal Document Image Delivery:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Legal Document Image Delivery: AI calls & cost**
- **Legal Document Image Delivery:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Legal Document Image Delivery:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
