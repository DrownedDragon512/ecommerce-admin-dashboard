import { NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const summary = body?.summary ?? {};

    // Fallback if no key configured
    if (!OPENAI_API_KEY) {
      const fallback = buildFallback(summary);
      return NextResponse.json({ advice: fallback, provider: "fallback" }, { status: 200 });
    }

    const prompt = buildPrompt(summary);

    const isOpenRouter = OPENAI_API_KEY.startsWith("sk-or-");
    const endpoint = isOpenRouter
      ? "https://openrouter.ai/api/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: "You are a sharp ecommerce strategist with deep knowledge of market trends, consumer behavior, and e-commerce best practices. Provide data-driven, creative, and specific insights that vary in topic and approach. Include real market trends and competitive benchmarks. Be conversational but professional." 
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 200,
        temperature: 0.6,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const fallback = buildFallback(summary);
      return NextResponse.json({ advice: fallback, provider: "fallback", error: text || "LLM request failed" }, { status: 200 });
    }

    const data = await res.json();
    const advice = data?.choices?.[0]?.message?.content?.trim() || buildFallback(summary);

    return NextResponse.json({ advice, provider: "openai" }, { status: 200 });
  } catch (error) {
    const fallback = buildFallback({});
    return NextResponse.json(
      { advice: fallback, provider: "fallback", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 200 }
    );
  }
}

function buildPrompt(summary: any) {
  const totalProducts = summary?.totalProducts ?? "?";
  const totalInventory = summary?.totalInventory ?? "?";
  const totalSold = summary?.totalSold ?? "?";
  const sellThrough = summary?.sellThrough ?? "?";
  const categories = (summary?.categoryStats || [])
    .slice(0, 5)
    .map((c: any) => `${c.category}: stock ${c.stock}, sold ${c.sold}, revenue ₹${c.value}`)
    .join("; ") || "None";
  const topSelling = (summary?.topSelling || [])
    .slice(0, 3)
    .map((p: any) => `${p.name}: sold ${p.sold}, stock ${p.stock}, revenue ₹${p.value}`)
    .join("; ") || "None";
  const lowStock = (summary?.lowStockList || [])
    .slice(0, 3)
    .map((p: any) => `${p.name}: stock ${p.stock}`)
    .join("; ") || "None";

  const missingCategories = ["Fashion", "Electronics", "Home & Garden", "Books", "Sports", "Beauty", "Food & Beverages", "Toys"];
  const existingCats = new Set((summary?.categoryStats || []).map((c: any) => c.category?.toLowerCase()));
  const missing = missingCategories.filter((cat) => !existingCats.has(cat.toLowerCase())).slice(0, 3);

  return `You are an ecommerce advisor for a modern online store. Give 3 short, punchy, actionable insights.
  
Business snapshot:
- Total products: ${totalProducts}
- Current inventory: ${totalInventory} units
- Total sold: ${totalSold} units
- Sell-through rate: ${sellThrough}%
- Top categories: ${categories}
- Best sellers: ${topSelling}
- Low stock items: ${lowStock}

Give exactly 3 insights (1-2 sentences each):
1. **Quick win** on current performance (specific, actionable).
2. **Market trend** relevant to their categories with a fact (e.g., "Bundling boosts AOV by 40%").
3. **Next action** - one creative revenue booster (beyond discounts).

Be concise, use bold for key ideas, and vary insights each time.`;
}

function buildFallback(summary: any) {
  const lowStock = (summary?.lowStockList || []).map((p: any) => p.name).slice(0, 3);
  const slowMovers = (summary?.topSelling || [])
    .filter((p: any) => (p.stock || 0) >= 20 && (p.sold || 0) <= 5)
    .map((p: any) => p.name)
    .slice(0, 3);
  const lines: string[] = [];
  if (lowStock.length) {
    lines.push(`Reorder soon: ${lowStock.join(", ")}`);
  }
  if (slowMovers.length) {
    lines.push(`Discount/bundle: ${slowMovers.join(", ")}`);
  }
  if (!lines.length) {
    lines.push("Monitor trends; highlight best sellers and set low-stock alerts.");
  }
  return lines.join(" | ");
}
