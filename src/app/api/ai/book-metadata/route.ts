import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

function normalizeTags(tags: string[]) {
  const cleaned = tags
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 12);
  return Array.from(new Set(cleaned));
}

function fallbackFor(title: string, author: string) {
  const base = `${title} ${author}`.toLowerCase();
  const tags: string[] = [];
  if (/(code|program|software|developer|engineer)/.test(base)) tags.push("programming", "software");
  if (/(history|historical)/.test(base)) tags.push("history");
  if (/(cook|recipe|kitchen)/.test(base)) tags.push("cooking");
  if (/(finance|invest|money)/.test(base)) tags.push("finance");
  if (/(novel|fiction)/.test(base)) tags.push("fiction");
  if (/(science|physics|biology|chemistry)/.test(base)) tags.push("science");

  return {
    summary:
      "Suggested summary based on the title/author. Configure `OPENAI_API_KEY` for richer results.",
    suggestedTags: normalizeTags(tags.length ? tags : ["library", "book"]),
    usedFallback: true as const
  };
}

async function openAiSuggest({
  title,
  author,
  description
}: {
  title: string;
  author: string;
  description: string;
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const prompt = {
    role: "user",
    content: [
      "You are a helpful librarian assistant.",
      "Given a book, produce:",
      "1) A 2-3 sentence summary.",
      "2) 5-10 short tags (single words or short phrases).",
      "",
      `Title: ${title}`,
      `Author: ${author}`,
      `Description: ${description || "(none)"}`
    ].join("\n")
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [prompt],
      temperature: 0.4,
      response_format: { type: "json_object" }
    })
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as any;
  const content = data?.choices?.[0]?.message?.content;
  if (!content) return null;

  try {
    const parsed = JSON.parse(content);
    const summary = String(parsed.summary ?? "");
    const suggestedTags = Array.isArray(parsed.tags) ? parsed.tags.map(String) : [];
    return {
      summary: summary || "No summary returned.",
      suggestedTags: normalizeTags(suggestedTags),
      model,
      usedFallback: false as const
    };
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const session = await requireSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const bookId = searchParams.get("bookId");
  if (!bookId) return new NextResponse("Missing bookId", { status: 400 });

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) return new NextResponse("Book not found", { status: 404 });

  const ai = await openAiSuggest({
    title: book.title,
    author: book.author,
    description: book.description
  });
  const result = ai ?? fallbackFor(book.title, book.author);

  return NextResponse.json(result);
}

