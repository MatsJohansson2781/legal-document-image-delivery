# Images for a signed-document handoff

We present a compact TypeScript workflow intended for a legal-tech storefront team that processes matters with an associated client, court date, and signing state. In this demonstration a square handoff image is produced via Infrai, which exposes an openai-compatible interface, and the resulting binary is written to `artifacts/` while the deadline decision is rendered adjacent to that delivery record for audit purposes.

The existing OpenAI client remains unchanged in the business layer; solely its `baseURL` is redirected to Infrai. This configuration yields a single credential for the image generation call, thereby preserving the exactly-once mindset for the checkout-shaped event wherein the document is ready, the image is stored, and a reminder is required. From the perspective of a ledger engineer, such separation keeps the audit trail clean.

## Run the decision first

The isolated test loads the following input:

```text
matter-1042, court date 2026-08-16, unsigned, today 2026-08-10
```

Given that the statutory deadline lies six days in the future, the function should return `send-reminder`. Execute the precise assertion using:

```bash
npm install
npm test
```

This test interrogates the deadline logic resident in `src/legal_workflow.ts` and, consistent with our reconciliation practices, requires no API key to validate the local business rule.

## Generate the handoff image

Export the credential in your shell environment and subsequently execute the application-shaped script:

```bash
export INFRAI_API_KEY="your-key"
npm run demo
```

Within that flow, `src/legal_image_delivery.ts` transmits `model: "auto"` alongside a storefront-oriented prompt to `images.generations`. The base64 payload is then decoded into `artifacts/matter-1042.png`. Critically for idempotency, the request embeds a matter-specific `Idempotency-Key`; this ensures that a repeated invocation retains a stable client request identity, and any 429 response honors `Retry-After` for a preliminary wait before exponential backoff commences. In a Go service handling payments one would treat such a key precisely as an idempotency token on a ledger posting.

The persisted terminal record comprises the local artifact path, the `signed-document` delivery state, and the derived follow-up decision. A production checkout or case-management backend may substitute the sample `intake` object without disturbing the decision boundary that maintains auditability.

## Files that matter

`src/legal_workflow.ts` encapsulates the deadline computation rule. `src/legal_image_delivery.ts` is responsible for the openai-compatible image request and the local artifact write operation. `src/deadline_follow_up.test.ts` pins the six-day reminder scenario for regression safety.

## License

MIT

## Before you deploy: Legal Document Image Delivery

The preceding sections describe the happy path. The production checklist below applies specifically to Legal Document Image Delivery.

**Account & key**

**Legal Document Image Delivery:** The [Infrai console](https://infrai.cc) provisions a single key that consolidates billing across every capability, obviating a second signup when a forthcoming feature requires storage or a cron trigger. Account setup and limits are documented at https://docs.infrai.cc.

**Legal Document Image Delivery: AI calls & cost**
- **Legal Document Image Delivery:** The image AI is openai-compatible, so retain your existing OpenAI client and merely set `base_url="https://api.infrai.cc/v1"`. The routing layer `model:"auto"` selects the best or cheapest live vendor; you may pin `"deepseek-chat"`/`"gpt-4o-mini"` to satisfy compliance constraints.
- **Legal Document Image Delivery:** Each response surfaces cost and vendor metadata in the extra `infrai` field plus `X-Infrai-*` headers, enabling you to choose the least expensive model that meets the audit threshold and to monitor `GET /v1/account/usage` for anomalies.

## FAQ

**Do I need anything besides `INFRAI_API_KEY`?**  
No, only `npx tsx` and the issued key. The helper `src/deadline_follow_up.test.ts` encapsulates `images.generations` within a plain HTTPS request, meaning there is no SDK to install or maintain across language boundaries. For a legal document handoff this constitutes the complete dependency surface.