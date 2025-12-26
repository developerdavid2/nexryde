import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    const { name, email, clerkId } = await request.json();

    console.log("Received data:", { name, email, clerkId }); // Debug log

    if (!name || !email || !clerkId) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const response = await sql`
      INSERT INTO users (
        name,
        email,
        clerk_id
      ) VALUES (
        ${name},
        ${email},
        ${clerkId}
      )
      RETURNING *
    `;

    console.log("Database response:", response); // Debug log

    return new Response(JSON.stringify({ data: response }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Database error",
      },
      { status: 500 },
    );
  }
}
