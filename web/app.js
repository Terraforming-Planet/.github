const form = document.getElementById("prompt-form");
const output = document.getElementById("prompt-output");
const generateButton = document.getElementById("generate");
const copyButton = document.getElementById("copy");

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

updateOutput();
