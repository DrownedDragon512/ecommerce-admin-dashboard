import { NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const nonce = Math.random().toString(36).slice(2, 8); // nudge variety per call
  let quickWinTarget = "your hero item";
  try {
    const body = await req.json().catch(() => ({}));
    const summary = body?.summary ?? {};
    quickWinTarget = pickQuickWinTarget(summary);

    // Fallback if no key configured
    if (!OPENAI_API_KEY) {
      const fallback = buildFallback(summary, nonce, quickWinTarget);
      return NextResponse.json({ advice: fallback, provider: "fallback" }, { status: 200 });
    }

    const prompt = buildPrompt(summary, nonce, quickWinTarget);

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
        max_tokens: 220,
        temperature: 1.05,
        presence_penalty: 0.8,
        frequency_penalty: 0.6,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const fallback = buildFallback(summary, nonce, quickWinTarget);
      return NextResponse.json({ advice: fallback, provider: "fallback", error: text || "LLM request failed" }, { status: 200 });
    }

    const data = await res.json();
    const advice = data?.choices?.[0]?.message?.content?.trim() || buildFallback(summary, nonce, quickWinTarget);

    return NextResponse.json({ advice, provider: "openai" }, { status: 200 });
  } catch (error) {
    const fallback = buildFallback({}, nonce, quickWinTarget);
    return NextResponse.json(
      { advice: fallback, provider: "fallback", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 200 }
    );
  }
}

function pickQuickWinTarget(summary: any): string {
  const top = summary?.topSelling || [];
  const low = summary?.lowStockList || [];
  if (top[1]?.name) return top[1].name;
  if (low[0]?.name) return low[0].name;
  if (top[0]?.name) return top[0].name;
  return "your hero item";
}

function buildPrompt(summary: any, nonce: string, quickWinTarget: string) {
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
Context nonce: ${nonce} (ensure advice differs across calls).

Quick win must highlight: ${quickWinTarget}. If that product was mentioned in a previous response, change the angle (different channel/offer) and avoid the phrases "restock", "bundle & save", "subscription", or "buy one gift one".
  
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

Be concise, use bold for key ideas, and vary insights each time. Do not repeat wording or topics from prior responses; prioritize novelty and diversity. Vary the offer mechanics and channels.`;
}

function buildFallback(summary: any, nonce: string, quickWinTarget: string) {
  const templates = [
    (s: any) => `Quick win: Feature ${quickWinTarget} with a 48-hour SMS push and a social proof carousel.`,
    (s: any) => `Trend: Highlight mobile-first checkout—optimize for <3 taps to buy to match m-commerce growth.`,
    (s: any) => `Next action: Run a limited drop with a waitlist to create scarcity and capture leads.`,
    (s: any) => `Quick win: Cross-sell ${quickWinTarget} with your top 2 accessories in cart/checkout.`,
    (s: any) => `Trend: Shoppers respond to delivery transparency; add ETA badges per product.`,
    (s: any) => `Next action: Launch a post-purchase referral for ${quickWinTarget} with store credit, not discounts.`,
  ];
  const pick = (arr: any[], n: number) => arr[(n + templates.length) % arr.length];
  const seed = nonce.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const out = [pick(templates, seed), pick(templates, seed + 2), pick(templates, seed + 4)]
    .map((fn) => fn(summary));
  return out.join(" \n");
}
