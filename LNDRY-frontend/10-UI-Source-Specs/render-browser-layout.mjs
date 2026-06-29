import path from "node:path";
import sharp from "sharp";

const esc = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const number = (value, fallback = 0) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const visibleColor = (color) =>
  color &&
  color !== "transparent" &&
  color !== "rgba(0, 0, 0, 0)" &&
  color !== "rgba(0,0,0,0)";

const normalizeColor = (color, fallback = "none") =>
  visibleColor(color) ? color : fallback;

export async function collectBrowserLayout(tab) {
  return tab.playwright.evaluate(() => {
    const root = document.querySelector(".screen.active");
    if (!root) throw new Error("No active screen found");

    const styleFields = [
      "backgroundColor",
      "backgroundImage",
      "borderTopColor",
      "borderTopWidth",
      "borderTopStyle",
      "borderRadius",
      "boxShadow",
      "color",
      "fontFamily",
      "fontSize",
      "fontWeight",
      "fontStyle",
      "letterSpacing",
      "lineHeight",
      "opacity",
      "objectFit",
      "textAlign",
      "textTransform",
      "filter",
    ];

    const wordRuns = (node, element, style) => {
      const value = node.textContent || "";
      const matcher = /\S+/gu;
      const runs = [];
      let match;

      while ((match = matcher.exec(value))) {
        const range = document.createRange();
        range.setStart(node, match.index);
        range.setEnd(node, match.index + match[0].length);
        const rects = Array.from(range.getClientRects()).filter(
          (rect) => rect.width > 0 && rect.height > 0,
        );
        if (!rects.length) continue;

        let pieces = [match[0]];
        if (rects.length > 1) {
          const hyphen = match[0].indexOf("-");
          if (hyphen > 0 && rects.length === 2) {
            pieces = [
              match[0].slice(0, hyphen + 1),
              match[0].slice(hyphen + 1),
            ];
          } else {
            const totalWidth = rects.reduce((sum, rect) => sum + rect.width, 0);
            let cursor = 0;
            pieces = rects.map((rect, index) => {
              if (index === rects.length - 1) return match[0].slice(cursor);
              const remainingRects = rects.length - index - 1;
              const proportional = Math.max(
                1,
                Math.min(
                  match[0].length - cursor - remainingRects,
                  Math.round((match[0].length * rect.width) / totalWidth),
                ),
              );
              const piece = match[0].slice(cursor, cursor + proportional);
              cursor += proportional;
              return piece;
            });
          }
        }

        rects.forEach((rect, index) => {
          runs.push({
            text: pieces[index] || "",
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            color: style.color,
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            fontStyle: style.fontStyle,
            letterSpacing: style.letterSpacing,
            opacity: style.opacity,
          });
        });
      }
      return runs;
    };

    const elements = [root, ...Array.from(root.querySelectorAll("*"))]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        if (
          rect.width <= 0 ||
          rect.height <= 0 ||
          style.display === "none" ||
          style.visibility === "hidden"
        ) {
          return null;
        }

        const styles = {};
        styleFields.forEach((field) => {
          styles[field] = style[field];
        });

        const text = Array.from(element.childNodes)
          .filter((node) => node.nodeType === 3 && node.textContent.trim())
          .flatMap((node) => wordRuns(node, element, style));

        return {
          tag: element.tagName.toLowerCase(),
          className:
            typeof element.className === "string" ? element.className : "",
          rect: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          },
          styles,
          text,
          src: element.tagName === "IMG" ? element.currentSrc || element.src : "",
        };
      })
      .filter(Boolean);

    const rect = root.getBoundingClientRect();
    return {
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      elements,
    };
  });
}

function roundedRect(element, index) {
  const { rect, styles } = element;
  let fill = normalizeColor(styles.backgroundColor);
  if (
    fill === "none" &&
    styles.backgroundImage &&
    styles.backgroundImage !== "none"
  ) {
    const gradientColor = styles.backgroundImage.match(/rgba?\([^)]+\)/)?.[0];
    fill = gradientColor || "#655be4";
  }
  const strokeWidth = number(styles.borderTopWidth);
  const stroke =
    strokeWidth > 0 && styles.borderTopStyle !== "none"
      ? normalizeColor(styles.borderTopColor)
      : "none";
  const radius = Math.min(
    number(styles.borderRadius),
    rect.width / 2,
    rect.height / 2,
  );
  const opacity = number(styles.opacity, 1);
  const shadow =
    styles.boxShadow && styles.boxShadow !== "none" && rect.height > 6
      ? `<rect x="${rect.x + 1}" y="${rect.y + 4}" width="${rect.width}" height="${rect.height}" rx="${radius}" fill="#29245f" opacity=".045"/>`
      : "";

  if (fill === "none" && stroke === "none") return shadow;
  return `${shadow}<rect data-i="${index}" x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" rx="${radius}" fill="${esc(fill)}" stroke="${esc(stroke)}" stroke-width="${strokeWidth}" opacity="${opacity}"/>`;
}

function classDetails(element) {
  const { rect, className } = element;
  const classes = new Set(className.split(/\s+/).filter(Boolean));
  const details = [];

  if (classes.has("back")) {
    details.push(
      `<path d="M ${rect.x + 25} ${rect.y + 13} L ${rect.x + 16} ${rect.y + 22} L ${rect.x + 25} ${rect.y + 31}" fill="none" stroke="#080f14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    );
  }

  if (classes.has("toggle")) {
    details.push(
      `<circle cx="${rect.x + rect.width - 12}" cy="${rect.y + rect.height / 2}" r="9" fill="#fff"/>`,
    );
  }

  if (classes.has("node")) {
    details.push(
      `<line x1="${rect.x + rect.width / 2}" y1="${rect.y + rect.height}" x2="${rect.x + rect.width / 2}" y2="${rect.y + rect.height + 37}" stroke="#e2e2eb" stroke-width="2"/>`,
    );
  }

  if (classes.has("map")) {
    details.push(
      `<rect x="${rect.x - 35}" y="${rect.y + 58}" width="${rect.width * 0.85}" height="28" rx="14" fill="#fff" transform="rotate(-18 ${rect.x + rect.width / 2} ${rect.y + rect.height / 2})"/>`,
      `<rect x="${rect.x + rect.width * 0.25}" y="${rect.y + rect.height * 0.62}" width="${rect.width * 0.8}" height="23" rx="12" fill="#fff" transform="rotate(-18 ${rect.x + rect.width / 2} ${rect.y + rect.height / 2})"/>`,
    );
  }

  return details.join("");
}

function textSvg(layout) {
  const runs = layout.elements.flatMap((element) => element.text);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}">
    ${runs
      .map((run) => {
        const size = number(run.fontSize, 14);
        const weight = number(run.fontWeight, 400);
        const opacity = number(run.opacity, 1);
        const baseline = run.y + Math.min(run.height * 0.81, size * 1.02);
        return `<text x="${run.x}" y="${baseline}" fill="${esc(run.color || "#080f14")}" opacity="${opacity}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" font-style="${esc(run.fontStyle || "normal")}" letter-spacing="${number(run.letterSpacing)}">${esc(run.text)}</text>`;
      })
      .join("")}
  </svg>`;
}

function backgroundSvg(layout) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}">
    <defs>
      <radialGradient id="wash" cx="82%" cy="5%" r="46%">
        <stop offset="0%" stop-color="#887cf6" stop-opacity=".14"/>
        <stop offset="72%" stop-color="#f8f8fd" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="#f8f8fd"/>
    <rect width="100%" height="100%" fill="url(#wash)"/>
    ${layout.elements
      .map((element, index) => roundedRect(element, index))
      .join("")}
    ${layout.elements.map(classDetails).join("")}
  </svg>`;
}

async function imageComposite(element, workspaceRoot) {
  if (!element.src) return null;
  const url = new URL(element.src);
  const localPath = path.join(workspaceRoot, decodeURIComponent(url.pathname).replace(/^[/\\]+/, ""));
  const width = Math.max(1, Math.round(element.rect.width));
  const height = Math.max(1, Math.round(element.rect.height));
  let pipeline = sharp(localPath).resize(width, height, {
    fit: element.styles.objectFit === "cover" ? "cover" : "contain",
  });

  if (element.styles.filter?.includes("invert(1)")) {
    const alpha = await pipeline
      .clone()
      .ensureAlpha()
      .extractChannel("alpha")
      .raw()
      .toBuffer();
    pipeline = sharp({
      create: {
        width,
        height,
        channels: 3,
        background: "#ffffff",
      },
    }).joinChannel(alpha, { raw: { width, height, channels: 1 } });
  }

  return {
    input: await pipeline.png().toBuffer(),
    left: Math.round(element.rect.x),
    top: Math.round(element.rect.y),
  };
}

export async function renderBrowserLayout(layout, outputPath, workspaceRoot) {
  const imageLayers = (
    await Promise.all(
      layout.elements
        .filter((element) => element.tag === "img" && element.src)
        .map((element) => imageComposite(element, workspaceRoot)),
    )
  ).filter(Boolean);

  const base = await sharp(Buffer.from(backgroundSvg(layout))).png().toBuffer();
  const withImages = await sharp(base).composite(imageLayers).png().toBuffer();
  await sharp(withImages)
    .composite([{ input: Buffer.from(textSvg(layout)), left: 0, top: 0 }])
    .png()
    .toFile(outputPath);
}
