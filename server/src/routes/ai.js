import express from "express";
import { z } from "zod";
import { getEnv } from "../env.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

async function enrichWithOpenAI({ title, author }) {
  const env = getEnv();
  const prompt = `You help enrich library book metadata.\n\nReturn JSON with keys: genre (string), description (string), tags (string array), publishedYear (number or null), isbn (string or null).\n\nBook:\nTitle: ${title}\nAuthor: ${author}\n`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL,
      input: prompt,
      text: { format: { type: "json_object" } }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const raw =
    (typeof data?.output_text === "string" && data.output_text) ||
    data?.output?.flatMap((o) => o.content || [])?.find((c) => c.type === "output_text")?.text ||
    data?.output?.flatMap((o) => o.content || [])?.find((c) => c.type === "text")?.text ||
    "{}";

  return JSON.parse(raw);
}

router.post("/enrich", requireAuth, requireRole("admin", "librarian"), async (req, res, next) => {
  try {
    const env = getEnv();
    const { title, author } = z.object({ title: z.string().min(1), author: z.string().min(1) }).parse(req.body);

    if (!env.OPENAI_API_KEY) {
      return res.json({
        metadata: {
          genre: "",
          description: "",
          tags: [],
          publishedYear: null,
          isbn: null,
          note: "OPENAI_API_KEY not set"
        }
      });
    }

    const metadata = await enrichWithOpenAI({ title, author });
    res.json({ metadata });
  } catch (err) {
    next(err);
  }
});

export default router;
