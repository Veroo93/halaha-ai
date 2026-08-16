const input = document.querySelector("#input");
const send = document.querySelector("#send");
const result = document.querySelector("#result");
const answer = document.querySelector("#answer");
const status = document.querySelector("#status");
const counter = document.querySelector("#counter");
const copy = document.querySelector("#copy");

let mode = "general";

document.querySelectorAll(".mode").forEach((btn) => {
  btn.addEventListener("click", () => {

    document
      .querySelectorAll(".mode")
      .forEach((x) => x.classList.remove("active"));

    btn.classList.add("active");

    mode = btn.dataset.mode;
  });
});

input.addEventListener("input", () => {
  counter.textContent = input.value.length;
});

send.addEventListener("click", async () => {

  const text = input.value.trim();

  if (!text) {
    status.textContent = "اكتب سؤالك أولًا.";
    input.focus();
    return;
  }

  send.disabled = true;
  result.classList.add("hidden");

  status.textContent = "جاري التفكير...";

  try {

    const response = await fetch("/api/ai", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        text,
        mode
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "حدث خطأ أثناء معالجة طلبك."
      );
    }

    answer.textContent = data.answer;

    result.classList.remove("hidden");

    status.textContent = "تمت الإجابة بنجاح ✓";

    result.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  } catch (error) {

    console.error(error);

    status.textContent =
      error.message || "حدث خطأ في الاتصال بالخادم.";

  } finally {

    send.disabled = false;

  }

});

copy.addEventListener("click", async () => {

  if (!answer.textContent) {
    return;
  }

  try {

    await navigator.clipboard.writeText(
      answer.textContent
    );

    copy.textContent = "تم النسخ ✓";

    setTimeout(() => {
      copy.textContent = "نسخ الإجابة";
    }, 1800);

  } catch {

    copy.textContent = "تعذر النسخ";

    setTimeout(() => {
      copy.textContent = "نسخ الإجابة";
    }, 1800);

  }

});

input.addEventListener("keydown", (event) => {

  if (
    event.key === "Enter" &&
    (event.ctrlKey || event.metaKey)
  ) {
    send.click();
  }

});