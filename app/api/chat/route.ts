import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get("projectId")
  
  const token = req.headers.get("Authorization")?.replace("Bearer ", "")
  const supabase = createServerClient(token)

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  try {
    const { projectId, content } = await req.json()
    const token = req.headers.get("Authorization")?.replace("Bearer ", "")
    const supabase = createServerClient(token)

    // Save user message
    const { error: insertError } = await supabase.from("messages").insert([
      {
        project_id: projectId,
        role: "user",
        content,
      },
    ])

    if (insertError) throw new Error("Failed to save user message")

    // Fetch conversation history
    const { data: history } = await supabase
      .from("messages")
      .select("role, content")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true })

    const messages = history || [{ role: "user", content }]

    // Call OpenRouter
    const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: messages
      })
    })

    if (!openRouterRes.ok) {
      throw new Error(`OpenRouter API error: ${openRouterRes.statusText}`)
    }

    const openRouterData = await openRouterRes.json()
    const replyText = openRouterData.choices?.[0]?.message?.content || "Sorry, I couldn't process that."

    // Save assistant message
    const { error: assistantInsertError } = await supabase.from("messages").insert([
      {
        project_id: projectId,
        role: "assistant",
        content: replyText,
      },
    ])

    if (assistantInsertError) throw new Error("Failed to save assistant message")

    return NextResponse.json({
      reply: { role: "assistant", content: replyText },
    })
  } catch (err: any) {
    console.error("Chat API Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}