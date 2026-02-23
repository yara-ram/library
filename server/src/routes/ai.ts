import type { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import { env } from "../env.js";
import { getOpenAiClient } from "../ai/openaiClient.js";

const metadataSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  isbn: z.string().optional()
});

const assistantSchema = z.object({
  message: z.string().min(1)
});

function fallbackMetadata(title: string, author: string) {
  const tags: string[] = [];
  const normalized = `${title} ${author}`.toLowerCase();
  if (normalized.includes("clean") || normalized.includes("code")) tags.push("software", "engineering");
  if (normalized.includes("hobbit") || normalized.includes("ring")) tags.push("fantasy");
  if (normalized.includes("history")) tags.push("history");
  if (tags.length === 0) tags.push("general");

  return {
    description: `A book titled "${title}" by ${author}.`,
    tags: Array.from(new Set(tags)).join(","),
    language: "English"
  };
}

export function registerAiRoutes(router: Router) {
  router.post("/ai/book-metadata", requireAuth, requireRole(["ADMIN", "STAFF"]), async (req, res) => {
    const parsed = metadataSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

    const client = getOpenAiClient();
    if (!client) {
      const fallback = fallbackMetadata(parsed.data.title, parsed.data.author);
      return res.json({ source: "fallback", ...fallback });
    }

    const prompt = {
      title: parsed.data.title,
      author: parsed.data.author,
      isbn: parsed.data.isbn
    };

    const response = await client.chat.completions.create({
      model: env.OPENAI_MODEL,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You help librarians catalog books. Return JSON with: description (string), tags (comma-separated string), language (string), publisher (string optional), publishedYear (number optional)."
        },
        { role: "user", content: JSON.stringify(prompt) }
      ]
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    let parsedJson: any = {};
    try {
      parsedJson = JSON.parse(content);
    } catch {
      parsedJson = {};
    }

    res.json({
      source: "openai",
      description: typeof parsedJson.description === "string" ? parsedJson.description : undefined,
      tags: typeof parsedJson.tags === "string" ? parsedJson.tags : undefined,
      language: typeof parsedJson.language === "string" ? parsedJson.language : undefined,
      publisher: typeof parsedJson.publisher === "string" ? parsedJson.publisher : undefined,
      publishedYear: typeof parsedJson.publishedYear === "number" ? parsedJson.publishedYear : undefined
    });
  });

  router.post("/ai/assistant", requireAuth, async (req: AuthedRequest, res) => {
    const parsed = assistantSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

    const query = parsed.data.message.trim();
    const books = await prisma.book.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" as const } },
          { author: { contains: query, mode: "insensitive" as const } },
          { tags: { contains: query, mode: "insensitive" as const } }
        ]
      },
      take: 5,
      orderBy: { updatedAt: "desc" }
    });

    const client = getOpenAiClient();
    if (!client) {
      return res.json({
        source: "fallback",
        reply:
          books.length > 0
            ? `I found ${books.length} matching book(s): ${books.map((b) => `"${b.title}"`).join(", ")}.`
            : "AI is not configured (no OPENAI_API_KEY). Try searching by title/author/tags."
      });
    }

    const response = await client.chat.completions.create({
      model: env.OPENAI_MODEL,
      temperature: 0.6,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful library assistant. Use the provided catalog snippets to answer. If you are unsure, ask a clarifying question."
        },
        { role: "user", content: `User: ${query}\n\nCatalog snippets:\n${books.map((b) => `- ${b.title} by ${b.author} (${b.status})`).join("\n")}` }
      ]
    });

    res.json({ source: "openai", reply: response.choices[0]?.message?.content ?? "" });
  });
}
