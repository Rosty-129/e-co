export async function verifyTurnstile(token) {
  if (!token || typeof token !== "string") {
    return false;
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: token,
        }),
      }
    );

    if (!response.ok) return false;

    const result = await response.json();

    return result.success === true;
  } catch {
    return false;
  }
}