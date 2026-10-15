const app = document.querySelector("#app");
const number = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
const time = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Paris",
});
const date = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Paris",
});
const valueText = (value) => (value == null ? "—" : number.format(value));
const paths = {
  arrow: "M5 12h14m-6-6 6 6-6 6",
  grid: "M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
  cube: "m3 7 9-5 9 5v10l-9 5-9-5zm0 0 9 5 9-5M12 12v10",
  chart: "M4 3v17h17M7 15l4-5 4 3 6-8",
  sensor: "M8 9a5 5 0 0 1 8 0M4 6a10 10 0 0 1 16 0M10 12a2 2 0 0 1 4 0M12 15v6",
  spark: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z",
  chevron: "m9 5 7 7-7 7",
  download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
  refresh: "M20 7a9 9 0 1 0 1 8M20 2v6h-6",
  check: "m5 12 4 4L19 6",
  alert: "m12 3 10 18H2Zm0 6v5m0 3v1",
  search: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14m5 12 6 6",
  close: "m6 6 12 12M6 18 18 6",
  logout: "M9 4H4v16h5m5-13 5 5-5 5m-6-5h11",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
  lock: "M5 10h14v11H5zm3 0V6a4 4 0 0 1 8 0v4",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  fit: "M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5",
  building: "M4 21V7l8-4v18m0-11h8v11M2 21h20M7 8v2m0 3v2m0 3v1m9-5v2m0 2v1",
  help: "M9 8a3 3 0 0 1 6 1c0 2-3 2-3 5m0 3v1M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20",
};

/** Safe DOM construction: externally supplied strings always become text nodes. */
function h(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key.startsWith("on"))
      element.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === "class") element.className = value;
    else if (key === "value") element.value = value;
    else element.setAttribute(key, value === true ? "" : String(value));
  }
  for (const child of children.flat(Infinity)) {
    if (child != null && child !== false)
      element.append(
        child instanceof Node ? child : document.createTextNode(String(child)),
      );
  }
  return element;
}
function s(tag, attrs = {}, ...children) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [key, value] of Object.entries(attrs))
    element.setAttribute(key, value);
  children.forEach((child) =>
    element.append(
      child instanceof Node ? child : document.createTextNode(String(child)),
    ),
  );
  return element;
}
function icon(name, size = 20) {
  return s(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 1.65,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    },
    s("path", { d: paths[name] || paths.cube }),
  );
}
function brand(href = "/") {
  return h(
    "a",
    { class: "brand", href, "aria-label": "EcoTwin, accueil" },
    h("img", { src: "/assets/ecotwin.svg", width: 34, height: 34, alt: "" }),
    "eco",
    h("strong", {}, "twin"),
    h("span", { class: "brand-dot" }, "."),
  );
}
function link(label, href, style = "button primary", symbol = "arrow") {
  return h(
    "a",
    { class: style, href },
    label,
    symbol ? icon(symbol, 18) : null,
  );
}
function button(label, action, style = "button secondary", symbol) {
  return h(
    "button",
    { type: "button", class: style, onClick: action },
    symbol ? icon(symbol, 18) : null,
    label,
  );
}
function iconButton(label, symbol, action) {
  return h(
    "button",
    {
      type: "button",
      class: "icon-button",
      "aria-label": label,
      title: label,
      onClick: action,
    },
    icon(symbol),
  );
}
function pill(text, style = "") {
  return h(
    "span",
    { class: `pill ${style}` },
    h("span", { class: "dot" }),
    text,
  );
}
async function api(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-EcoTwin-Request": "1",
      ...options.headers,
    },
  });
  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }
  if (!response.ok) {
    const error = new Error(
      typeof payload.detail === "string"
        ? payload.detail
        : "Vérifiez les informations saisies et réessayez.",
    );
    error.status = response.status;
    throw error;
  }
  return payload;
}
function marketingNav() {
  return h(
    "header",
    { class: "marketing-nav" },
    brand(),
    h(
      "nav",
      { "aria-label": "Navigation principale" },
      h("a", { href: "/#platform" }, "La plateforme"),
      h("a", { href: "/#uses" }, "Les usages"),
    ),
    h(
      "div",
      { class: "nav-actions" },
      h("a", { href: "/login", class: "login-link" }, "Se connecter"),
      link("Explorer la démo", "/dashboard?mode=demo", "button primary small"),
    ),
  );
}

/** Architectural axonometry: schematic, not an image of the repository's BIM model. */
function buildingDrawing() {
  const svg = s("svg", {
    viewBox: "0 0 620 460",
    role: "img",
    "aria-label":
      "Coupe axonométrique schématique : trois niveaux reliés à des mesures de température et de qualité de l’air",
  });
  const defs = s(
    "defs",
    {},
    s(
      "pattern",
      {
        id: "draft-grid",
        width: 28,
        height: 28,
        patternUnits: "userSpaceOnUse",
      },
      s("path", {
        d: "M28 0H0V28",
        fill: "none",
        stroke: "#dce5eb",
        "stroke-width": 0.6,
      }),
    ),
  );
  svg.append(
    defs,
    s("rect", { width: 620, height: 460, fill: "url(#draft-grid)" }),
  );
  const project = (x, y, z) => [320 + (x - y) * 0.82, 365 + (x + y) * 0.34 - z];
  const poly = (coords, fill, stroke = "#9bb1c0", width = 1) =>
    s("polygon", {
      points: coords.map((c) => project(...c).join(",")).join(" "),
      fill,
      stroke,
      "stroke-width": width,
      "stroke-linejoin": "round",
    });
  svg.append(
    poly(
      [
        [-160, -110, 0],
        [160, -110, 0],
        [160, 110, 0],
        [-160, 110, 0],
      ],
      "#e4edf2",
    ),
  );
  for (const z of [0, 76, 152]) {
    svg.append(
      poly(
        [
          [-160, -110, z],
          [160, -110, z],
          [160, 110, z],
          [-160, 110, z],
        ],
        z === 152 ? "#edf5f8" : "#f9fcfd",
      ),
    );
    svg.append(
      poly(
        [
          [-160, 110, z - 8],
          [160, 110, z - 8],
          [160, 110, z],
          [-160, 110, z],
        ],
        "#b5c9d5",
      ),
    );
    svg.append(
      poly(
        [
          [160, -110, z - 8],
          [160, 110, z - 8],
          [160, 110, z],
          [160, -110, z],
        ],
        "#d1e0e8",
      ),
    );
    svg.append(
      poly(
        [
          [-160, -110, z],
          [-160, -110, z + 56],
          [160, -110, z + 56],
          [160, -110, z],
        ],
        "#c1dbe5",
      ),
    );
    for (let x = -145; x < 150; x += 38)
      svg.append(
        poly(
          [
            [x, -109, z + 8],
            [x, -109, z + 48],
            [x + 27, -109, z + 48],
            [x + 27, -109, z + 8],
          ],
          "#e9f6fa",
          "#90b0c2",
        ),
      );
    svg.append(
      poly(
        [
          [-160, -110, z],
          [-160, 110, z],
          [-160, 110, z + 56],
          [-160, -110, z + 56],
        ],
        "#d2e6ed",
      ),
    );
    for (const x of [-65, 60]) {
      svg.append(
        poly(
          [
            [x, -90, z],
            [x, 70, z],
            [x, 70, z + 32],
            [x, -90, z + 32],
          ],
          "#dbe6ec",
        ),
      );
      svg.append(
        poly(
          [
            [x + 10, -55, z + 3],
            [x + 58, -55, z + 3],
            [x + 58, -15, z + 3],
            [x + 10, -15, z + 3],
          ],
          "#a2c9cb",
          "#74a6ab",
        ),
      );
    }
    svg.append(
      poly(
        [
          [-155, 106, z],
          [-155, 106, z + 54],
          [-150, 106, z + 54],
          [-150, 106, z],
        ],
        "#8cabbc",
      ),
    );
    svg.append(
      poly(
        [
          [155, 106, z],
          [155, 106, z + 54],
          [150, 106, z + 54],
          [150, 106, z],
        ],
        "#8cabbc",
      ),
    );
  }
  svg.append(
    poly(
      [
        [-160, -110, 208],
        [160, -110, 208],
        [160, 110, 208],
        [-160, 110, 208],
      ],
      "none",
      "#6f96ad",
      1.1,
    ),
  );
  for (const [x, y, z] of [
    [90, 50, 158],
    [-70, 15, 82],
  ]) {
    const [cx, cy] = project(x, y, z);
    svg.append(
      s("circle", { cx, cy, r: 12, fill: "#167d88", "fill-opacity": 0.12 }),
      s("circle", {
        cx,
        cy,
        r: 5,
        fill: "#167d88",
        stroke: "white",
        "stroke-width": 2,
      }),
    );
  }
  const label = (x, y, title, value, tone) => {
    svg.append(
      s("rect", {
        x,
        y,
        width: 138,
        height: 57,
        rx: 8,
        fill: "#fff",
        stroke: "#d6e1e8",
      }),
      s("circle", { cx: x + 14, cy: y + 17, r: 3, fill: tone }),
      s(
        "text",
        {
          x: x + 25,
          y: y + 21,
          fill: "#5b6e7d",
          "font-size": 10,
          "font-family": "system-ui",
        },
        title,
      ),
      s(
        "text",
        {
          x: x + 14,
          y: y + 44,
          fill: "#172c3d",
          "font-size": 19,
          "font-family": "system-ui",
          "font-weight": 600,
        },
        value,
      ),
    );
  };
  svg.append(
    s("path", {
      d: "M409 245h54v-63",
      fill: "none",
      stroke: "#167d88",
      "stroke-dasharray": "3 4",
    }),
  );
  label(449, 125, "TEMPÉRATURE", "24,2 °C", "#167d88");
  svg.append(
    s("path", {
      d: "M247 310H122v-35",
      fill: "none",
      stroke: "#b48138",
      "stroke-dasharray": "3 4",
    }),
  );
  label(25, 218, "PARTICULES PM2.5", "18,6 µg/m³", "#9a5b10");
  svg.append(
    s(
      "text",
      {
        x: 28,
        y: 434,
        fill: "#5b6e7d",
        "font-size": 9,
        "font-family": "monospace",
      },
      "VUE SCHÉMATIQUE  /  DONNÉES ILLUSTRATIVES",
    ),
    s("path", {
      d: "M559 400v-35m-5 10 5-10 5 10",
      fill: "none",
      stroke: "#7895a9",
    }),
    s("text", { x: 555, y: 356, fill: "#5b6e7d", "font-size": 11 }, "N"),
  );
  return svg;
}

function landing() {
  document.title = "EcoTwin — Le bâtiment, dans toutes ses dimensions";
  const hero = h(
    "section",
    { class: "hero" },
    h(
      "div",
      { class: "hero-copy" },
      h(
        "div",
        { class: "eyebrow" },
        h("span", { class: "line" }),
        "DU BIM AU BÂTIMENT VIVANT",
      ),
      h(
        "h1",
        {},
        "Votre bâtiment.",
        h("br"),
        "Une nouvelle",
        h("br"),
        h("span", { class: "accent-text" }, "dimension."),
      ),
      h(
        "p",
        { class: "hero-description" },
        "Réunissez vos maquettes BIM et vos données dans un même espace. Comprenez ce qui se passe. Agissez là où cela compte.",
      ),
      h(
        "div",
        { class: "hero-actions" },
        link("Explorer le jumeau numérique", "/dashboard?mode=demo"),
        link("Découvrir la plateforme", "#platform", "text-link", "chevron"),
      ),
      h(
        "p",
        { class: "quiet hero-note" },
        icon("check", 16),
        "Démo accessible sans compte",
        h("span", {}, "·"),
        "BIM + données + insights",
      ),
    ),
    h(
      "div",
      { class: "hero-visual" },
      h(
        "div",
        { class: "visual-title" },
        h("span", {}, icon("cube", 16), "LE BÂTIMENT, EN CONTEXTE"),
        pill("Aperçu illustratif"),
      ),
      buildingDrawing(),
      h(
        "div",
        { class: "visual-footer" },
        h("span", {}, "Du modèle à la décision"),
        h("span", { class: "mono" }, "IFC / XKT"),
      ),
    ),
  );
  const features = [
    [
      "cube",
      "Un contexte spatial",
      "Explorez le modèle BIM, sélectionnez un objet et retrouvez sa place dans le bâtiment.",
    ],
    [
      "sensor",
      "Des données lisibles",
      "Suivez température, humidité et qualité de l’air avec leurs unités, leur source et leur historique.",
    ],
    [
      "spark",
      "Des décisions éclairées",
      "Repérez les dépassements de seuil et préparez l’intégration de vos futurs outils d’IA.",
    ],
  ];
  app.replaceChildren(
    marketingNav(),
    h(
      "main",
      { id: "main" },
      hero,
      h(
        "section",
        { class: "product-strip" },
        h("span", { class: "eyebrow" }, "UN SOCLE POUR VOTRE EXPLOITATION"),
        h(
          "div",
          {},
          "Maquettes BIM",
          h("span", {}, "+"),
          "Données terrain",
          h("span", {}, "+"),
          "Contexte métier",
        ),
      ),
      h(
        "section",
        { id: "platform", class: "feature-section" },
        h(
          "div",
          { class: "section-heading" },
          h("p", { class: "eyebrow" }, "LA PLATEFORME"),
          h(
            "h2",
            {},
            "Reliez ce que vous voyez",
            h("br"),
            "à ce que vous mesurez.",
          ),
          h(
            "p",
            {},
            "Une lecture commune pour les équipes techniques, les gestionnaires et les décideurs.",
          ),
        ),
        h(
          "div",
          { class: "feature-grid" },
          features.map(([symbol, title, description]) =>
            h(
              "article",
              { class: "feature" },
              h("div", { class: "feature-icon" }, icon(symbol, 25)),
              h("h3", {}, title),
              h("p", {}, description),
            ),
          ),
        ),
      ),
      h(
        "section",
        { id: "uses", class: "use-section" },
        h(
          "div",
          {},
          h("p", { class: "eyebrow" }, "DE LA CONCEPTION À L’EXPLOITATION"),
          h(
            "h2",
            {},
            "Un bâtiment ne s’arrête pas",
            h("br"),
            "à sa livraison.",
          ),
          h(
            "p",
            {},
            "Conservez le contexte du BIM pour accompagner la vie de vos espaces, comprendre les signaux et prioriser les interventions.",
          ),
          link(
            "Ouvrir le site de démonstration",
            "/dashboard?mode=demo",
            "button secondary",
          ),
        ),
        h(
          "div",
          { class: "use-list" },
          [
            [
              "Surveiller",
              "Identifier les variations de confort et de qualité de l’air.",
            ],
            [
              "Explorer",
              "Replacer les observations dans le contexte du bâtiment.",
            ],
            [
              "Anticiper",
              "Préparer des analyses traçables avec vos futurs moteurs IA.",
            ],
          ].map(([title, body]) =>
            h(
              "article",
              {},
              icon("check"),
              h("div", {}, h("h3", {}, title), h("p", {}, body)),
            ),
          ),
        ),
      ),
      h(
        "section",
        { class: "closing" },
        h(
          "div",
          {},
          h("p", { class: "eyebrow" }, "CHANGEZ DE POINT DE VUE"),
          h("h2", {}, "Donnez du sens à votre bâtiment."),
        ),
        link("Explorer EcoTwin", "/dashboard?mode=demo"),
      ),
    ),
    h(
      "footer",
      { class: "marketing-footer" },
      brand(),
      h("span", {}, "BIM. Données. Décisions."),
      h(
        "span",
        { class: "quiet" },
        "EcoTwin · Prototype de plateforme de jumeaux numériques",
      ),
    ),
  );
}

async function authPage(register = false) {
  document.title = `${register ? "Créer un compte" : "Connexion"} — EcoTwin`;
  let showing = false;
  const error = h("p", {
    id: "form-error",
    class: "form-error",
    role: "alert",
  });
  const errors = {};
  const fields = {};
  function field(name, label, type, autocomplete, hint) {
    errors[name] = h("span", { id: `${name}-error`, class: "field-error" });
    fields[name] = h("input", {
      id: name,
      name,
      type,
      autocomplete,
      required: true,
      maxlength: name === "password" ? 128 : name === "name" ? 80 : 254,
      "aria-describedby": `${name}-error${hint ? ` ${name}-hint` : ""}`,
    });
    const input =
      name === "password"
        ? h(
            "div",
            { class: "password-field" },
            fields[name],
            iconButton("Afficher le mot de passe", "eye", (event) => {
              showing = !showing;
              fields[name].type = showing ? "text" : "password";
              event.currentTarget.setAttribute(
                "aria-label",
                showing
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe",
              );
              event.currentTarget.setAttribute("aria-pressed", String(showing));
            }),
          )
        : fields[name];
    return h(
      "div",
      { class: "field" },
      h("label", { for: name }, label),
      input,
      hint
        ? h("span", { id: `${name}-hint`, class: "field-hint" }, hint)
        : null,
      errors[name],
    );
  }
  const submit = h(
    "button",
    { type: "submit", class: "button primary auth-submit" },
    register ? "Créer mon compte" : "Se connecter",
    icon("arrow", 18),
  );
  const form = h(
    "form",
    {
      novalidate: true,
      onSubmit: async (event) => {
        event.preventDefault();
        if (submit.disabled) return;
        error.textContent = "";
        let first;
        const values = {};
        for (const [name, input] of Object.entries(fields)) {
          values[name] = name === "password" ? input.value : input.value.trim();
          let message = "";
          if (!values[name]) message = "Renseignez ce champ.";
          else if (
            name === "email" &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[name])
          )
            message = "Saisissez une adresse e-mail valide.";
          else if (name === "password" && register && values[name].length < 12)
            message = "Choisissez au moins 12 caractères.";
          else if (name === "name" && values[name].length < 2)
            message = "Renseignez au moins 2 caractères.";
          errors[name].textContent = message;
          input.setAttribute("aria-invalid", String(Boolean(message)));
          if (message && !first) first = input;
        }
        if (first) {
          first.focus();
          return;
        }
        submit.disabled = true;
        submit.setAttribute("aria-busy", "true");
        submit.textContent = register ? "Création du compte…" : "Connexion…";
        try {
          await api(`/api/auth/${register ? "register" : "login"}`, {
            method: "POST",
            body: JSON.stringify(values),
          });
          location.assign("/dashboard");
        } catch (e) {
          error.textContent = e.status
            ? e.message
            : "Connexion impossible. Vérifiez votre réseau et réessayez.";
          fields.email.focus();
        } finally {
          submit.disabled = false;
          submit.removeAttribute("aria-busy");
          submit.replaceChildren(
            register ? "Créer mon compte" : "Se connecter",
            icon("arrow", 18),
          );
        }
      },
    },
    register ? field("name", "Votre nom", "text", "name") : null,
    field("email", "Adresse e-mail", "email", "username"),
    field(
      "password",
      "Mot de passe",
      "password",
      register ? "new-password" : "current-password",
      register
        ? "12 caractères minimum. Utilisez un mot de passe unique."
        : null,
    ),
    error,
    submit,
  );
  const registerLink = h(
    "p",
    { class: "auth-switch" },
    register ? "Vous avez déjà un compte ? " : "Vous découvrez EcoTwin ? ",
    h(
      "a",
      { href: register ? "/login" : "/register" },
      register ? "Se connecter" : "Créer un compte pilote",
    ),
  );
  app.replaceChildren(
    h(
      "div",
      { class: "auth-layout" },
      h(
        "aside",
        { class: "auth-story" },
        brand(),
        h(
          "div",
          {},
          h("p", { class: "eyebrow" }, "UN NOUVEAU REGARD SUR VOS ESPACES"),
          h("h2", {}, "Le contexte fait", h("br"), "toute la différence."),
          buildingDrawing(),
        ),
        h(
          "p",
          { class: "quiet" },
          "Une lecture partagée du bâtiment et de ses données.",
        ),
      ),
      h(
        "main",
        { id: "main", class: "auth-main" },
        h("a", { class: "back-link", href: "/" }, "← Retour à la présentation"),
        h(
          "div",
          { class: "auth-card" },
          h("div", { class: "feature-icon" }, icon("lock", 24)),
          h("p", { class: "eyebrow" }, "VOTRE ESPACE ECOTWIN"),
          h(
            "h1",
            {},
            register ? "Créez votre compte." : "Heureux de vous revoir.",
          ),
          h(
            "p",
            { class: "auth-description" },
            register
              ? "Un compte personnel pour explorer le site pilote."
              : "Connectez-vous pour retrouver votre bâtiment et ses données.",
          ),
          form,
          registerLink,
          h(
            "div",
            { class: "auth-divider" },
            h("span", {}, "ou découvrez la plateforme"),
          ),
          link(
            "Explorer sans compte",
            "/dashboard?mode=demo",
            "button secondary full",
            "cube",
          ),
          h(
            "p",
            { class: "quiet auth-footnote" },
            "La démo utilise des données illustratives.",
          ),
        ),
        h(
          "span",
          { class: "auth-bottom quiet" },
          "Un espace pour comprendre. Des données pour agir.",
        ),
      ),
    ),
  );
  try {
    const config = await api("/api/auth/config");
    if (!config.registration_enabled) {
      if (register) {
        submit.disabled = true;
        error.textContent =
          "La création de compte est désactivée. Contactez votre administrateur.";
      } else
        registerLink.textContent =
          "Pour obtenir un compte, contactez votre administrateur.";
    }
  } catch {
    /* The form still reports the actual network failure on submit. */
  }
}

function chart(points, sensor, period) {
  if (!points.length)
    return h(
      "div",
      { class: "empty chart-empty" },
      icon("chart", 28),
      h("h3", {}, "Pas encore de mesures"),
      h("p", {}, "Les observations apparaîtront ici dès leur réception."),
    );
  const width = window.matchMedia("(max-width: 500px)").matches ? 340 : 700,
    height = 215,
    left = 52,
    right = 18,
    top = 18,
    bottom = 32;
  const values = points.map((p) => p.value);
  const min = Math.min(...values, sensor.threshold) * 0.85;
  const max = Math.max(...values, sensor.threshold) * 1.12 || 1;
  const first = Date.parse(points[0].time),
    last = Date.parse(points.at(-1).time);
  const x = (point) =>
    left +
    ((Date.parse(point.time) - first) / (last - first || 1)) *
      (width - left - right);
  const y = (value) =>
    top + ((max - value) / (max - min || 1)) * (height - top - bottom);
  const svg = s("svg", {
    viewBox: `0 0 ${width} ${height}`,
    role: "img",
    "aria-label": `${sensor.name}, ${points.length} observations sur ${period === "24h" ? "24 heures" : "7 jours"}, en ${sensor.unit}. Dernière valeur ${valueText(points.at(-1).value)}.`,
    class: "trend-chart",
  });
  for (let i = 0; i < 4; i++) {
    const value = min + ((max - min) * i) / 3;
    svg.append(
      s("line", {
        x1: left,
        y1: y(value),
        x2: width - right,
        y2: y(value),
        stroke: "#e4ebef",
      }),
      s(
        "text",
        {
          x: left - 10,
          y: y(value) + 4,
          "text-anchor": "end",
          fill: "#5b6e7d",
          "font-size": 11,
        },
        valueText(value),
      ),
    );
  }
  const thresholdY = y(sensor.threshold);
  svg.append(
    s("line", {
      x1: left,
      y1: thresholdY,
      x2: width - right,
      y2: thresholdY,
      stroke: "#9a5b10",
      "stroke-dasharray": "5 5",
    }),
    s(
      "text",
      {
        x: width - right,
        y: thresholdY - 6,
        "text-anchor": "end",
        fill: "#9a5b10",
        "font-size": 10,
      },
      `Seuil illustratif ${valueText(sensor.threshold)}`,
    ),
  );
  // Break the trace across absent hours rather than implying continuity.
  let d = "";
  points.forEach((point, index) => {
    const gap =
      index &&
      Date.parse(point.time) - Date.parse(points[index - 1].time) > 5400000;
    d += `${index === 0 || gap ? "M" : "L"}${x(point).toFixed(1)},${y(point.value).toFixed(1)} `;
  });
  svg.append(
    s("path", {
      d,
      fill: "none",
      stroke: "#167d88",
      "stroke-width": 2.5,
      "stroke-linejoin": "round",
    }),
  );
  const latest = points.at(-1);
  svg.append(
    s("circle", {
      cx: x(latest),
      cy: y(latest.value),
      r: 4,
      fill: "#167d88",
      stroke: "white",
      "stroke-width": 2,
    }),
  );
  [
    ...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1]),
  ].forEach((index, i) =>
    svg.append(
      s(
        "text",
        {
          x: x(points[index]),
          y: height - 8,
          "text-anchor": i === 0 ? "start" : i === 2 ? "end" : "middle",
          fill: "#5b6e7d",
          "font-size": 11,
        },
        period === "24h"
          ? time.format(new Date(points[index].time))
          : new Intl.DateTimeFormat("fr-FR", {
              day: "2-digit",
              month: "short",
              timeZone: "Europe/Paris",
            }).format(new Date(points[index].time)),
      ),
    ),
  );
  return svg;
}

async function dashboard() {
  const url = new URL(location.href);
  const mode = url.searchParams.get("mode") === "demo" ? "demo" : "live";
  let view = ["overview", "bim", "sensors", "insights"].includes(
    url.searchParams.get("view"),
  )
    ? url.searchParams.get("view")
    : "overview";
  let metric = url.searchParams.get("metric") || "CAP_TEMP";
  let period = url.searchParams.get("period") === "7d" ? "7d" : "24h";
  let query = url.searchParams.get("q") || "";
  let data,
    requestController,
    timer,
    bimHandle,
    loading = false;
  let user;
  if (mode === "live") {
    try {
      user = await api("/api/auth/me");
    } catch (e) {
      if (e.status === 401) {
        location.replace("/login");
        return;
      }
      showBootError();
      return;
    }
  }
  document.title = "Tableau de bord — EcoTwin";
  const linkFor = (nextView) => {
    const target = new URL(location.href);
    target.searchParams.set("view", nextView);
    return target.pathname + target.search;
  };
  const source = pill(
    mode === "demo" ? "Démonstration" : "Source réelle",
    mode === "demo" ? "demo" : "",
  );
  const status = h(
    "p",
    { class: "connection-status", role: "status" },
    "Chargement des observations…",
  );
  const feedback = h("div", { class: "data-feedback", "aria-live": "polite" });
  const mainContent = h("div", {
    class: "dashboard-content",
    "data-view": view,
    "aria-busy": "true",
  });
  const refreshButton = iconButton("Actualiser les données", "refresh", () =>
    refresh(),
  );
  const lastUpdate = h(
    "span",
    { class: "quiet last-update" },
    "En attente de données",
  );
  const mobileAccount =
    mode === "demo"
      ? link("Connexion", "/login", "button ghost mobile-account", null)
      : button(
          "Déconnexion",
          async () => {
            try {
              await api("/api/auth/logout", { method: "POST" });
              location.assign("/login");
            } catch {
              feedback.replaceChildren(
                h(
                  "p",
                  { role: "alert", class: "error-banner" },
                  "Déconnexion impossible. Réessayez.",
                ),
              );
            }
          },
          "button ghost mobile-account",
          "logout",
        );
  const navItems = [
    ["overview", "grid", "Vue d’ensemble"],
    ["bim", "cube", "Jumeau BIM"],
    ["sensors", "sensor", "Capteurs & données"],
    ["insights", "spark", "Insights"],
  ];
  const navigation = h(
    "nav",
    { "aria-label": "Espace de travail" },
    navItems.map(([key, symbol, label]) =>
      h(
        "a",
        {
          href: linkFor(key),
          class: `side-link ${view === key ? "active" : ""}`,
          "aria-current": view === key ? "page" : null,
        },
        icon(symbol),
        label,
      ),
    ),
  );
  const sidebar = h(
    "aside",
    { class: "sidebar" },
    brand(),
    h(
      "div",
      { class: "workspace" },
      h("span", { class: "workspace-icon" }, icon("building", 21)),
      h(
        "div",
        {},
        h("strong", {}, "Atelier EcoTwin"),
        h(
          "span",
          {},
          mode === "demo" ? "Site de démonstration" : "Site pilote partagé",
        ),
      ),
    ),
    h("span", { class: "nav-label" }, "ESPACE DE TRAVAIL"),
    navigation,
    h(
      "div",
      { class: "sidebar-bottom" },
      h(
        "div",
        { class: "ai-status" },
        icon("spark", 18),
        h(
          "div",
          {},
          h("strong", {}, "Prêt pour vos analyses"),
          h("span", {}, "IA non connectée"),
        ),
      ),
      h(
        "a",
        { class: "side-link", href: "/" },
        icon("help"),
        "À propos d’EcoTwin",
      ),
      mode === "demo"
        ? link("Se connecter", "/login", "button secondary full", null)
        : button(
            "Se déconnecter",
            async () => {
              try {
                await api("/api/auth/logout", { method: "POST" });
                location.assign("/login");
              } catch {
                feedback.replaceChildren(
                  h(
                    "p",
                    { role: "alert", class: "error-banner" },
                    "Déconnexion impossible. Vérifiez votre connexion et réessayez.",
                  ),
                );
              }
            },
            "button ghost full",
            "logout",
          ),
      h(
        "div",
        { class: "profile" },
        h(
          "span",
          { class: "avatar" },
          mode === "demo" ? "D" : user.name.slice(0, 1).toUpperCase(),
        ),
        h(
          "div",
          {},
          h("strong", {}, mode === "demo" ? "Espace découverte" : user.name),
          h(
            "span",
            {},
            mode === "demo" ? "Accès en lecture seule" : "Compte pilote",
          ),
        ),
      ),
    ),
  );
  const titles = {
    overview: ["Vue d’ensemble", "Votre bâtiment, en un regard."],
    bim: ["Jumeau BIM", "Explorez le contexte de vos espaces."],
    sensors: [
      "Capteurs & données",
      "Chaque mesure raconte une partie du bâtiment.",
    ],
    insights: [
      "Insights",
      "Des signaux à comprendre, des actions à prioriser.",
    ],
  };
  const page = h(
    "div",
    { class: "dashboard-layout" },
    sidebar,
    h(
      "div",
      { class: "dashboard-shell" },
      h(
        "header",
        { class: "app-header" },
        h(
          "div",
          { class: "breadcrumb" },
          icon("building", 17),
          h("span", {}, "Mon site"),
          icon("chevron", 13),
          h("strong", {}, "Atelier EcoTwin"),
        ),
        h(
          "div",
          { class: "header-right" },
          source,
          refreshButton,
          mobileAccount,
        ),
      ),
      h(
        "main",
        { id: "main", class: "dashboard-main" },
        h(
          "div",
          { class: "page-heading" },
          h(
            "div",
            {},
            h("p", { class: "eyebrow" }, "EXPLOITATION DU BÂTIMENT"),
            h("h1", {}, titles[view][0]),
            h("p", {}, titles[view][1]),
          ),
          h("div", { class: "update-block" }, lastUpdate, status),
        ),
        feedback,
        mode === "demo"
          ? h(
              "div",
              { class: "demo-banner" },
              icon("cube", 18),
              h(
                "p",
                {},
                h("strong", {}, "Vous explorez un site de démonstration."),
                " Les mesures sont illustratives ; le modèle BIM est consultable.",
              ),
              h("a", { href: "/login" }, "Mon espace", icon("arrow", 16)),
            )
          : null,
        mainContent,
      ),
      h(
        "footer",
        { class: "app-footer" },
        h("span", {}, "EcoTwin · BIM + données"),
        h("span", {}, "Affichage des dates : Europe/Paris"),
      ),
    ),
  );
  app.replaceChildren(page);

  function saveState(replace = false) {
    const target = new URL(location.href);
    target.searchParams.set("metric", metric);
    target.searchParams.set("period", period);
    if (query) target.searchParams.set("q", query);
    else target.searchParams.delete("q");
    history[replace ? "replaceState" : "pushState"]({}, "", target);
    navigation.querySelectorAll("a").forEach((a, index) => {
      const next = new URL(target);
      next.searchParams.set("view", navItems[index][0]);
      a.href = next.pathname + next.search;
    });
  }
  function sensorSelect() {
    const select = h(
      "select",
      {
        "aria-label": "Métrique",
        onChange: (event) => {
          metric = event.target.value;
          saveState();
          refreshTrend();
        },
      },
      data.sensors.map((sensor) =>
        h("option", { value: sensor.id }, sensor.name),
      ),
    );
    select.value = metric;
    return select;
  }
  function periodSelect() {
    const select = h(
      "select",
      {
        "aria-label": "Période",
        onChange: (event) => {
          period = event.target.value;
          saveState();
          refresh();
        },
      },
      h("option", { value: "24h" }, "Dernières 24 heures"),
      h("option", { value: "7d" }, "7 derniers jours"),
    );
    select.value = period;
    return select;
  }
  function summary() {
    const configured = data.sensors.filter(
      (sensor) => sensor.value != null,
    ).length;
    const alerts = data.insights.length;
    return h(
      "section",
      { class: "summary-grid", "aria-label": "Indicateurs du site" },
      h(
        "article",
        { class: "summary-card" },
        h(
          "div",
          { class: "summary-title" },
          icon("cube"),
          h("span", {}, "Modèle BIM"),
        ),
        h("div", { class: "summary-value" }, "1", h("span", {}, "modèle XKT")),
        h("p", {}, "Contexte spatial consultable"),
      ),
      h(
        "article",
        { class: "summary-card" },
        h(
          "div",
          { class: "summary-title" },
          icon("sensor"),
          h("span", {}, "Mesures disponibles"),
        ),
        h(
          "div",
          { class: "summary-value" },
          configured,
          h("span", {}, "/ 8 métriques"),
        ),
        h(
          "p",
          {},
          mode === "demo"
            ? "Jeu de données illustratif"
            : "Observations reçues sur la période",
        ),
      ),
      h(
        "article",
        { class: `summary-card ${alerts ? "attention" : ""}` },
        h(
          "div",
          { class: "summary-title" },
          icon("alert"),
          h("span", {}, "Points de vigilance"),
        ),
        h(
          "div",
          { class: "summary-value" },
          alerts,
          h("span", {}, alerts > 1 ? "seuils dépassés" : "seuil dépassé"),
        ),
        h(
          "a",
          { href: linkFor("insights") },
          "Consulter les insights",
          icon("arrow", 15),
        ),
      ),
      h(
        "article",
        { class: "summary-card" },
        h(
          "div",
          { class: "summary-title" },
          icon("spark"),
          h("span", {}, "Analyse du site"),
        ),
        h("div", { class: "summary-text" }, "Règles explicables"),
        h("p", {}, "Intégration IA à configurer"),
      ),
    );
  }
  function twinPanel() {
    const canvas = h("canvas", {
      id: "twin-canvas",
      "aria-label":
        "Vue 3D du modèle BIM. Utilisez les boutons de rotation et de zoom pour naviguer.",
      tabindex: "0",
    });
    const twinStatus = h(
      "span",
      { class: "twin-status", role: "status" },
      "Vue 3D disponible à la demande",
    );
    const selected = h(
      "p",
      { class: "bim-selection" },
      "Sélectionnez un élément pour consulter son identifiant BIM.",
    );
    let xray = false;
    const viewport = h(
      "div",
      { class: "twin-viewport" },
      canvas,
      h("span", { class: "model-tag" }, icon("cube", 14), "MODÈLE XKT"),
      h("div", { class: "twin-grid" }),
    );
    const controls = h(
      "div",
      { class: "viewer-controls" },
      iconButton("Ajuster la vue", "fit", () => bimHandle?.fit()),
      iconButton("Tourner à gauche", "chevron", () => bimHandle?.turn(-1)),
      iconButton("Tourner à droite", "chevron", () => bimHandle?.turn(1)),
      iconButton("Zoomer", "plus", () => bimHandle?.zoom(-1)),
      iconButton("Dézoomer", "minus", () => bimHandle?.zoom(1)),
      iconButton("Afficher en transparence", "eye", (event) => {
        xray = !xray;
        bimHandle?.xray(xray);
        event.currentTarget.setAttribute("aria-pressed", String(xray));
      }),
    );
    controls
      .querySelectorAll("button")
      .forEach((control) => (control.disabled = true));
    const load = button(
      "Charger le modèle 3D",
      async () => {
        load.disabled = true;
        twinStatus.textContent = "Chargement du modèle BIM…";
        const { mountBim } = await import("/js/bim-viewer.js");
        bimHandle = await mountBim({
          canvas,
          status: twinStatus,
          selection: selected,
          onReady: () => {
            load.remove();
            controls
              .querySelectorAll("button")
              .forEach((control) => (control.disabled = false));
          },
        });
        await bimHandle.ready;
      },
      "button primary",
      "cube",
    );
    viewport.append(
      h("div", { class: "bim-launch" }, buildingDrawing(), load),
      controls,
    );
    const panel = h(
      "section",
      { class: "panel twin-panel" },
      h(
        "div",
        { class: "panel-heading" },
        h(
          "div",
          {},
          h("p", { class: "eyebrow" }, "CONTEXTE SPATIAL"),
          h("h2", {}, "Le jumeau du bâtiment"),
        ),
        h(
          "a",
          {
            href: "/assets/model.xkt",
            download: "model.xkt",
            class: "icon-button",
            "aria-label": "Télécharger le modèle XKT",
            title: "Télécharger le modèle XKT",
          },
          icon("download"),
        ),
      ),
      viewport,
      h(
        "div",
        { class: "twin-footer" },
        twinStatus,
        pill("Liaison capteurs à configurer", "neutral"),
      ),
      selected,
    );
    return panel;
  }
  function trendPanel() {
    const sensor = data.sensors.find((s) => s.id === metric) || data.sensors[0];
    const points = data.history[sensor.id];
    return h(
      "section",
      { class: "panel trend-panel" },
      h(
        "div",
        { class: "panel-heading" },
        h(
          "div",
          {},
          h("p", { class: "eyebrow" }, "ÉVOLUTION DES MESURES"),
          h("h2", {}, "Un signal, dans le temps"),
        ),
        icon("chart"),
      ),
      h("div", { class: "chart-controls" }, sensorSelect(), periodSelect()),
      h(
        "div",
        { class: "chart-value" },
        h("strong", {}, valueText(sensor.value)),
        h("span", {}, sensor.unit),
        h(
          "span",
          { class: "quiet" },
          sensor.time
            ? `Dernière acquisition : ${time.format(new Date(sensor.time))}`
            : "Aucune acquisition",
        ),
      ),
      chart(points, sensor, period),
      h(
        "div",
        { class: "chart-caption" },
        h("span", {}, "Pas horaire · dernière valeur reçue"),
        h(
          "span",
          {},
          mode === "demo" ? "Source : démonstration" : "Source : InfluxDB",
        ),
      ),
      h(
        "details",
        { class: "chart-table" },
        h("summary", {}, "Consulter les valeurs du graphique"),
        h(
          "div",
          { class: "table-scroll" },
          h(
            "table",
            {},
            h(
              "caption",
              { class: "sr-only" },
              `${sensor.name}, valeurs en ${sensor.unit}`,
            ),
            h(
              "thead",
              {},
              h(
                "tr",
                {},
                h("th", { scope: "col" }, "Acquisition"),
                h("th", { scope: "col" }, `Valeur (${sensor.unit})`),
              ),
            ),
            h(
              "tbody",
              {},
              points.map((point) =>
                h(
                  "tr",
                  {},
                  h("td", {}, date.format(new Date(point.time))),
                  h("td", {}, valueText(point.value)),
                ),
              ),
            ),
          ),
        ),
        button(
          "Exporter les observations",
          () => exportCsv(sensor, points),
          "text-button",
          "download",
        ),
      ),
    );
  }
  function insightsPanel(full = false) {
    const insights = data.insights;
    return h(
      "section",
      { class: `panel insights-panel ${full ? "expanded" : ""}` },
      h(
        "div",
        { class: "panel-heading" },
        h(
          "div",
          {},
          h("p", { class: "eyebrow" }, "À SURVEILLER"),
          h("h2", {}, "Les signaux qui comptent"),
        ),
        pill(
          `${insights.length} ${insights.length > 1 ? "points" : "point"}`,
          insights.length ? "warning" : "neutral",
        ),
      ),
      insights.length
        ? insights.map((insight) =>
            h(
              "article",
              { class: "insight" },
              h("span", { class: "insight-icon" }, icon("alert", 18)),
              h(
                "div",
                {},
                h("h3", {}, insight.title),
                h(
                  "p",
                  {},
                  `${valueText(insight.value)} ${insight.unit} · seuil illustratif ${valueText(insight.threshold)} ${insight.unit}`,
                ),
                h("p", { class: "quiet" }, insight.explanation),
                insight.stale ? pill("Observation ancienne", "warning") : null,
              ),
              h(
                "a",
                {
                  class: "icon-button",
                  href: (() => {
                    const target = new URL(location.href);
                    target.searchParams.set("view", "sensors");
                    target.searchParams.set("metric", insight.sensor);
                    return target.pathname + target.search;
                  })(),
                  "aria-label": `Examiner ${insight.title}`,
                },
                icon("arrow", 18),
              ),
            ),
          )
        : h(
            "div",
            { class: "empty" },
            icon("check", 25),
            h("h3", {}, "Aucun dépassement observé"),
            h(
              "p",
              {},
              "Cela ne remplace pas la vérification des données manquantes.",
            ),
          ),
      h(
        "p",
        { class: "panel-note" },
        icon("help", 15),
        "Analyse par seuils · IA non connectée. ",
        data.threshold_note,
      ),
    );
  }
  function sensorTable() {
    const input = h("input", {
      type: "search",
      id: "sensor-query",
      value: query,
      placeholder: "Rechercher une métrique…",
      "aria-label": "Rechercher une métrique",
    });
    const clear = iconButton("Effacer la recherche", "close", () => {
      query = "";
      input.value = "";
      saveState();
      updateRows();
      input.focus();
    });
    const tbody = h("tbody");
    const count = h("p", { class: "quiet table-count", "aria-live": "polite" });
    const states = {
      normal: "Sous le seuil",
      warning: "À surveiller",
      stale: "Donnée ancienne",
      missing: "Sans mesure",
    };
    function updateRows() {
      clear.hidden = !query;
      const rows = data.sensors.filter((sensor) =>
        `${sensor.name} ${sensor.id}`
          .toLocaleLowerCase("fr")
          .includes(query.toLocaleLowerCase("fr")),
      );
      count.textContent = `${rows.length} métrique${rows.length > 1 ? "s" : ""} sur 8`;
      tbody.replaceChildren(
        ...rows.map((sensor) =>
          h(
            "tr",
            {},
            h(
              "td",
              {},
              h("strong", {}, sensor.name),
              h("span", { class: "cell-meta mono" }, sensor.id),
            ),
            h(
              "td",
              { class: "numeric" },
              h("strong", {}, valueText(sensor.value)),
              h("span", { class: "unit" }, sensor.unit),
            ),
            h(
              "td",
              {},
              pill(
                states[sensor.status],
                sensor.status === "warning"
                  ? "warning"
                  : sensor.status === "normal"
                    ? "normal"
                    : "neutral",
              ),
            ),
            h("td", {}, sensor.time ? date.format(new Date(sensor.time)) : "—"),
            h(
              "td",
              {},
              button(
                "Voir la courbe",
                () => {
                  metric = sensor.id;
                  saveState();
                  refreshTrend();
                  document
                    .querySelector(".trend-panel")
                    ?.scrollIntoView({ behavior: "auto", block: "start" });
                },
                "text-button",
                "chart",
              ),
            ),
          ),
        ),
      );
      if (!rows.length)
        tbody.append(
          h(
            "tr",
            {},
            h(
              "td",
              { colspan: 5, class: "empty" },
              "Aucune métrique ne correspond. Effacez la recherche pour afficher le catalogue.",
            ),
          ),
        );
    }
    input.addEventListener("input", (event) => {
      if (!event.isComposing) {
        query = input.value;
        saveState(true);
        updateRows();
      }
    });
    input.addEventListener("compositionend", () => {
      query = input.value;
      saveState(true);
      updateRows();
    });
    const table = h(
      "section",
      { class: "panel sensors-panel" },
      h(
        "div",
        { class: "panel-heading" },
        h(
          "div",
          {},
          h("p", { class: "eyebrow" }, "CATALOGUE DU SITE"),
          h("h2", {}, "Les données environnementales"),
        ),
        button(
          "Exporter le catalogue",
          () => exportCatalog(),
          "button secondary small",
          "download",
        ),
      ),
      h(
        "div",
        { class: "table-toolbar" },
        h("div", { class: "search-field" }, icon("search", 17), input, clear),
        count,
      ),
      h(
        "div",
        { class: "table-scroll" },
        h(
          "table",
          {},
          h(
            "caption",
            { class: "sr-only" },
            "Huit métriques environnementales du site avec unité, état et dernière acquisition",
          ),
          h(
            "thead",
            {},
            h(
              "tr",
              {},
              [
                "Métrique",
                "Dernière valeur",
                "État",
                "Acquisition",
                "Explorer",
              ].map((label) => h("th", { scope: "col" }, label)),
            ),
          ),
          tbody,
        ),
      ),
    );
    updateRows();
    table.refreshRows = updateRows;
    return table;
  }
  function retainFocus() {
    const active = document.activeElement;
    if (!mainContent.contains(active)) return () => {};
    const selector = active.id
      ? `#${CSS.escape(active.id)}`
      : active.getAttribute("aria-label")
        ? `[aria-label="${CSS.escape(active.getAttribute("aria-label"))}"]`
        : null;
    return () => {
      if (selector)
        mainContent.querySelector(selector)?.focus({ preventScroll: true });
    };
  }
  function refreshTrend() {
    const restoreFocus = retainFocus();
    const current = mainContent.querySelector(".trend-panel");
    if (current) {
      const open = current.querySelector("details")?.open;
      const scroll = current.querySelector(".table-scroll")?.scrollTop ?? 0;
      const next = trendPanel();
      current.replaceWith(next);
      if (open) {
        const details = next.querySelector("details");
        if (details) details.open = true;
        const values = next.querySelector(".table-scroll");
        if (values) values.scrollTop = scroll;
      }
    } else renderData();
    restoreFocus();
  }
  function renderData() {
    if (!data) return;
    const restoreFocus = retainFocus();
    bimHandle?.dispose();
    bimHandle = null;
    if (!data.sensors.some((sensor) => sensor.id === metric)) {
      metric = "CAP_TEMP";
      saveState(true);
    }
    if (view === "overview")
      mainContent.replaceChildren(
        summary(),
        h("div", { class: "primary-grid" }, twinPanel(), trendPanel()),
        insightsPanel(),
      );
    else if (view === "bim")
      mainContent.replaceChildren(
        h(
          "div",
          { class: "bim-notice" },
          icon("help", 17),
          "Le modèle est disponible. Les liaisons entre objets BIM et capteurs restent à configurer.",
        ),
        twinPanel(),
        link(
          "Ouvrir les outils de mesure avancés",
          "/public/index.html",
          "text-link",
          "arrow",
        ),
      );
    else if (view === "sensors")
      mainContent.replaceChildren(sensorTable(), trendPanel());
    else
      mainContent.replaceChildren(
        insightsPanel(true),
        h(
          "section",
          { class: "panel integration-panel" },
          h("div", { class: "feature-icon" }, icon("spark", 26)),
          h(
            "div",
            {},
            h("h2", {}, "Une base prête pour vos futurs moteurs IA"),
            h(
              "p",
              {},
              "Les observations et les objets BIM formeront le contexte des analyses. Aucun modèle de prédiction ni fournisseur IA n’est connecté à ce stade.",
            ),
            h(
              "p",
              { class: "quiet" },
              "Prochaines étapes : sources vérifiées, moteur configurable, preuves associées et validation humaine.",
            ),
          ),
        ),
      );
    mainContent.removeAttribute("aria-busy");
    restoreFocus();
  }
  function download(name, rows) {
    const csv =
      "\uFEFF" +
      rows
        .map((row) =>
          row
            .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
            .join(";"),
        )
        .join("\r\n");
    const address = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const anchor = h("a", { href: address, download: name });
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(address), 1000);
  }
  function exportCsv(sensor, points) {
    download(`ecotwin-${sensor.id}-${period}.csv`, [
      ["source", "capteur", "horodatage_utc", "valeur", "unite"],
      ...points.map((p) => [mode, sensor.id, p.time, p.value, sensor.unit]),
    ]);
  }
  function exportCatalog() {
    download("ecotwin-capteurs.csv", [
      ["source", "capteur", "metrique", "valeur", "unite", "acquisition"],
      ...data.sensors.map((sensor) => [
        mode,
        sensor.id,
        sensor.name,
        sensor.value,
        sensor.unit,
        sensor.time,
      ]),
    ]);
  }
  async function refresh() {
    requestController?.abort();
    const current = new AbortController();
    requestController = current;
    loading = true;
    refreshButton.disabled = true;
    status.textContent = "Actualisation des observations…";
    if (!data) {
      mainContent.replaceChildren(
        h(
          "div",
          { class: "loading-state", role: "status" },
          h("span", { class: "spinner" }),
          "Chargement du tableau de bord…",
        ),
      );
      mainContent.setAttribute("aria-busy", "true");
    }
    try {
      const result = await api(`/api/dashboard?mode=${mode}&period=${period}`, {
        signal: current.signal,
      });
      if (current !== requestController) return;
      const initial = !data;
      data = result;
      feedback.replaceChildren();
      lastUpdate.textContent = `Consulté à ${time.format(new Date(data.generated_at))}`;
      status.textContent =
        mode === "demo"
          ? "Données illustratives · pas horaire"
          : "Actualisation toutes les 30 s";
      if (initial) renderData();
      else {
        if (mainContent.querySelector(".trend-panel")) refreshTrend();
        mainContent.querySelector(".sensors-panel")?.refreshRows?.();
        const oldSummary = mainContent.querySelector(".summary-grid");
        if (oldSummary) oldSummary.replaceWith(summary());
        const oldInsights = mainContent.querySelector(".insights-panel");
        if (oldInsights)
          oldInsights.replaceWith(insightsPanel(view === "insights"));
      }
    } catch (error) {
      if (error.name === "AbortError" || current !== requestController) return;
      if (error.status === 401) {
        location.replace("/login");
        return;
      }
      if (data && period !== data.period) {
        period = data.period;
        saveState(true);
        refreshTrend();
      }
      status.textContent = data
        ? "Dernières données conservées · état périmé"
        : "Source indisponible";
      feedback.replaceChildren(
        h(
          "div",
          { class: "error-banner", role: "alert" },
          icon("alert", 20),
          h(
            "div",
            {},
            h(
              "strong",
              {},
              data
                ? "Les observations ne sont plus à jour."
                : "La source ne répond pas.",
            ),
            h(
              "p",
              {},
              error.status
                ? error.message
                : "Vérifiez votre connexion puis réessayez.",
            ),
          ),
          button(
            "Réessayer",
            () => refresh(),
            "button secondary small",
            "refresh",
          ),
        ),
      );
      if (!data)
        mainContent.replaceChildren(
          h(
            "div",
            { class: "empty no-source" },
            icon("sensor", 32),
            h("h2", {}, "En attente de vos données"),
            h(
              "p",
              {},
              "La connexion à InfluxDB doit être configurée pour consulter les observations du site.",
            ),
            link(
              "Explorer le dashboard de démonstration",
              "/dashboard?mode=demo",
              "button secondary",
            ),
          ),
        );
      mainContent.removeAttribute("aria-busy");
    } finally {
      if (current === requestController) {
        loading = false;
        refreshButton.disabled = false;
      }
    }
  }
  window.addEventListener("popstate", () => {
    const next = new URL(location.href);
    metric = next.searchParams.get("metric") || "CAP_TEMP";
    period = next.searchParams.get("period") === "7d" ? "7d" : "24h";
    query = next.searchParams.get("q") || "";
    refresh();
  });
  window.addEventListener("beforeunload", () => {
    requestController?.abort();
    clearInterval(timer);
    bimHandle?.dispose();
  });
  timer = setInterval(() => {
    if (!document.hidden && !loading) refresh();
  }, 30000);
  await refresh();
}
function showBootError() {
  app.replaceChildren(
    marketingNav(),
    h(
      "main",
      { id: "main", class: "boot" },
      h("h1", {}, "Connexion au service impossible"),
      h("p", {}, "Vérifiez votre connexion et rechargez la page."),
      button("Réessayer", () => location.reload(), "button primary", "refresh"),
    ),
  );
}

try {
  if (location.pathname === "/login") await authPage();
  else if (location.pathname === "/register") await authPage(true);
  else if (location.pathname === "/dashboard") await dashboard();
  else landing();
} catch {
  showBootError();
}
