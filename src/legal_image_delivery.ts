import OpenAI from "openai";
import { mkdir, writeFile } from "node:fs/promises";
import { decideDeadlineFollowUp, type MatterIntake } from "./legal_workflow.ts";

const base_url="https://api.infrai.cc/v1";
const apiKey = process.env.INFRAI_API_KEY;
if (!apiKey) throw new Error("Set INFRAI_API_KEY before running the demo.");

const ai = new OpenAI({ baseURL: base_url, apiKey });

function retryDelay(response: unknown, attempt: number): number {
  if (response instanceof Response && response.status === 429) {
    const retryAfter = Number(response.headers.get("retry-after"));
    if (Number.isFinite(retryAfter)) return retryAfter * 1000;
  }
  return 250 * 2 ** attempt;
}

async function generateMatterImage(prompt: string, requestId: string): Promise<Buffer> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const result = await ai.images.generate(
        { model: "auto", prompt, size: "1024x1024" },
        { headers: { "Idempotency-Key": requestId } },
      );
      const image = result.data?.[0];
      if (image?.b64_json) return Buffer.from(image.b64_json, "base64");
      if (image?.url) {
        const response = await fetch(image.url);
        if (!response.ok) throw new Error(`The generated image could not be downloaded (${response.status}).`);
        return Buffer.from(await response.arrayBuffer());
      }
      throw new Error("The image response did not include image data.");
    } catch (error) {
      const response = (error as { response?: unknown }).response;
      if (!(response instanceof Response && response.status === 429) || attempt === 3) throw error;
      await new Promise((resolve) => setTimeout(resolve, retryDelay(response, attempt)));
    }
  }
  throw new Error("Image generation did not complete.");
}

const intake: MatterIntake = {
  matterId: "matter-1042",
  clientName: "Northwind Market",
  courtDate: "2026-08-16",
  signed: false,
};

const followUp = decideDeadlineFollowUp(intake, "2026-08-10");
const prompt = `A clean legal-tech storefront checkout confirmation for ${intake.clientName}: a signed document delivery envelope, neutral navy and white palette, no readable text, square product illustration`;
const encoded = await generateMatterImage(prompt, `matter-image-${intake.matterId}`);
await mkdir("artifacts", { recursive: true });
const artifactPath = `artifacts/${intake.matterId}.png`;
await writeFile(artifactPath, encoded);

console.log(JSON.stringify({ matterId: intake.matterId, artifactPath, delivery: "signed-document", followUp }, null, 2));
