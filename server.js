import "dotenv/config";
import express from "express";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

app.post("/api/ai", async (req, res) => {
  try {
    const { text, mode = "general" } = req.body;

    if (!text || text.trim().length < 2) {
      return res.status(400).json({
        error: "اكتب طلبًا أولًا."
      });
    }

    const instructions = {
      general: "أجب بالعربية بطريقة واضحة ومفيدة.",
      improve: "حسّن النص مع الحفاظ على المعنى، وأعطني النسخة النهائية.",
      idea: "حوّل المشكلة أو الفكرة إلى حل عملي بسيط مع خطوات قابلة للتنفيذ."
    };

    const prompt =
      (instructions[mode] || instructions.general) +
      "\n\nطلب المستخدم:\n" +
      text;

    console.log("REQUEST RECEIVED");
    console.log("MODEL: gemini-3.5-flash-lite");

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("GEMINI ERROR:", data);

      return res.status(response.status).json({
        error: data.error?.message || "حدث خطأ من Gemini."
      });
    }

    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!answer) {
      return res.status(500).json({
        error: "لم يتم الحصول على إجابة من Gemini."
      });
    }

    res.json({
      answer
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);

    res.status(500).json({
      error: "حدث خطأ في الاتصال بالذكاء الاصطناعي."
    });
  }
});

const server = app.listen(port, () => {
  console.log("===== NEW SERVER VERSION =====");
  console.log(`AI site running at http://localhost:${port}`);
});

server.on("error", (error) => {
  console.error("SERVER ERROR:", error);
});