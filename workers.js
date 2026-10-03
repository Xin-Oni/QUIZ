export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORSヘッダー（フロントエンドからの通信を許可）
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // プリフライトリクエスト (OPTIONS) への応答
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 1. ユーザー登録 API (/api/register)
      if (url.pathname === "/api/register" && request.method === "POST") {
        const { email, password } = await request.json();

        if (!email || !password) {
          return new Response(JSON.stringify({ error: "メールアドレスとパスワードを入力してください" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // パスワードのハッシュ化（SHA-256）
        const passwordHash = await hashPassword(password);
        const userId = crypto.randomUUID();

        // D1 へ保存 (INSERT)
        await env.DB.prepare(
          "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)"
        ).bind(userId, email, passwordHash).run();

        return new Response(JSON.stringify({ success: true, message: "登録が完了しました！" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 2. ログイン API (/api/login)
      if (url.pathname === "/api/login" && request.method === "POST") {
        const { email, password } = await request.json();

        const passwordHash = await hashPassword(password);

        // D1 からユーザー検索 (SELECT)
        const user = await env.DB.prepare(
          "SELECT * FROM users WHERE email = ? AND password_hash = ?"
        ).bind(email, passwordHash).first();

        if (!user) {
          return new Response(JSON.stringify({ error: "メールアドレスまたはパスワードが正しくありません" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true, message: "ログインに成功しました", user: { id: user.id, email: user.email } }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 一致するルートがない場合
      return new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }
};

// パスワード暗号化の共通関数
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}