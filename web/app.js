const form = document.getElementById("prompt-form");
const output = document.getElementById("prompt-output");
const generateButton = document.getElementById("generate");
const copyButton = document.getElementById("copy");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");

const templates = {
  terrain: ({ climate, geology, scale, style, notes }) => {
    return `Stwórz dwuczęściową kompozycję "before/after" obok siebie (before po lewej, after po prawej).\n` +
      `Temat: terraformowanie terenu.\n` +
      `Parametry: klimat ${climate}, geologia ${geology}, skala ${scale}, styl ${style}.\n` +
      `Before: surowy teren bez infrastruktury, z atmosferą odpowiadającą podanym parametrom.\n` +
      `After: ten sam kadr po terraformowaniu, z poprawioną atmosferą, roślinnością i śladami infrastruktury.\n` +
      `Spójne oświetlenie i perspektywa, czytelny podział na dwie połowy.\n` +
      `${notes ? `Dodatkowe wskazówki: ${notes}` : ""}`.trim();
  },
  rover: ({ climate, geology, scale, style, notes }) => {
    return `Stwórz scenę z PV Roverem (pojazd badawczy z dużymi panelami fotowoltaicznymi) na obcym terenie.\n` +
      `Parametry: klimat ${climate}, geologia ${geology}, skala ${scale}, styl ${style}.\n` +
      `Pojazd dopasowany do warunków: pył, niskie światło, ślady eksploatacji.\n` +
      `Ujęcie dynamiczne, ale realistyczne, z naciskiem na panele PV i funkcjonalność pojazdu.\n` +
      `${notes ? `Dodatkowe wskazówki: ${notes}` : ""}`.trim();
  }
};

const chatReplies = [
  "Super! Dodaję to do opisu: delikatna mgła i chłodne światło bazy.",
  "Rozumiem. Zasugerujmy pył w powietrzu i miękkie cienie od paneli PV.",
  "Zapisałem! Utrzymamy realizm i dodamy subtelne ślady przejazdu.",
  "Świetny pomysł. Zwiększymy kontrast terenu i podkreślimy refleksy na panelach."
];

const buildPrompt = () => {
  const mode = document.getElementById("mode").value;
  const payload = {
    climate: document.getElementById("climate").value,
    geology: document.getElementById("geology").value,
    scale: document.getElementById("scale").value,
    style: document.getElementById("style").value,
    notes: document.getElementById("notes").value.trim()
  };

  if (!templates[mode]) {
    return "Brak szablonu dla wybranego trybu.";
  }

  return templates[mode](payload);
};

const updateOutput = () => {
  output.value = buildPrompt();
};

const addMessage = (text, role) => {
  const message = document.createElement("div");
  message.className = `message ${role}`;
  message.textContent = text;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

const getFakeReply = () => {
  const reply = chatReplies[Math.floor(Math.random() * chatReplies.length)];
  return `✅ ${reply} (symulacja generowania obrazu)`;
};

generateButton.addEventListener("click", updateOutput);

copyButton.addEventListener("click", async () => {
  if (!output.value) {
    updateOutput();
  }
  await navigator.clipboard.writeText(output.value);
  copyButton.textContent = "Skopiowano!";
  setTimeout(() => {
    copyButton.textContent = "Kopiuj do schowka";
  }, 2000);
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = chatInput.value.trim();
  if (!text) {
    return;
  }
  addMessage(text, "user");
  chatInput.value = "";

  const typingIndicator = document.createElement("div");
  typingIndicator.className = "message ai";
  typingIndicator.textContent = "Generuję podgląd...";
  chatMessages.appendChild(typingIndicator);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  setTimeout(() => {
    typingIndicator.remove();
    addMessage(getFakeReply(), "ai");
  }, 700);
});

updateOutput();
