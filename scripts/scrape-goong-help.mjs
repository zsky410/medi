#!/usr/bin/env node
/**
 * Scrape Vietnamese Goong help docs from https://help.goong.io
 * Uses WordPress REST API for full article content.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "docs", "goong");
const BASE_URL = "https://help.goong.io";
const API = `${BASE_URL}/wp-json/wp/v2`;

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});
turndown.use(gfm);
turndown.remove(["script", "style", "nav", "footer"]);
turndown.addRule("removeEzToc", {
  filter: (node) =>
    node.nodeName === "DIV" &&
    (node.getAttribute?.("id") === "ez-toc-container" ||
      node.classList?.contains("ez-toc-container-direction")),
  replacement: () => "",
});

async function fetchAll(endpoint) {
  const items = [];
  let page = 1;
  while (true) {
    const res = await fetch(`${API}/${endpoint}?per_page=100&page=${page}`);
    if (!res.ok) break;
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    items.push(...batch);
    const totalPages = Number(res.headers.get("x-wp-totalpages") ?? 1);
    if (page >= totalPages) break;
    page++;
  }
  return items;
}

function urlToFilePath(url) {
  const path = new URL(url).pathname.replace(/\/$/, "") || "/";
  if (path === "/") return join(OUT_DIR, "index.md");
  const relative = path.startsWith("/kb/") ? path.slice(4) : path.slice(1);
  return join(OUT_DIR, relative + ".md");
}

function htmlToMarkdown(html) {
  const cleaned = html
    .replace(/<span class="ez-toc[^"]*"[^>]*>[\s\S]*?<\/span>/gi, "")
    .replace(/<div id="ez-toc-container"[\s\S]*?<\/div>\s*<\/div>/gi, "");
  return turndown.turndown(cleaned).replace(/\n{3,}/g, "\n\n").trim();
}

function decodeTitle(title) {
  return title
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

function buildCategoryTree(categories) {
  const byId = new Map(categories.map((c) => [c.id, { ...c, children: [] }]));
  const roots = [];
  for (const cat of byId.values()) {
    if (cat.parent && byId.has(cat.parent)) {
      byId.get(cat.parent).children.push(cat);
    } else {
      roots.push(cat);
    }
  }
  const sort = (nodes) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name, "vi"));
    nodes.forEach((n) => sort(n.children));
  };
  sort(roots);
  return roots;
}

function renderTree(nodes, depth = 0) {
  return nodes
    .map((n) => {
      const indent = "  ".repeat(depth);
      const link = n.link.replace(BASE_URL, "");
      let line = `${indent}- [${decodeTitle(n.name)}](${link})`;
      if (n.children.length) line += "\n" + renderTree(n.children, depth + 1);
      return line;
    })
    .join("\n");
}

function groupArticlesByCategory(articles, categories) {
  const catById = new Map(categories.map((c) => [c.id, c]));
  const grouped = new Map();
  for (const article of articles) {
    const catIds = article.knowledgebase_cat ?? [];
    const catId = catIds[0];
    const cat = catById.get(catId);
    const key = cat?.name ?? "Khác";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(article);
  }
  return grouped;
}

async function main() {
  console.log("Fetching Goong help docs from WordPress API...");

  const [articles, categories] = await Promise.all([
    fetchAll("knowledgebase"),
    fetchAll("knowledgebase_cat"),
  ]);

  console.log(`Found ${articles.length} articles, ${categories.length} categories`);

  await mkdir(OUT_DIR, { recursive: true });

  const manifest = {
    scrapedAt: new Date().toISOString(),
    source: BASE_URL,
    articleCount: articles.length,
    categoryCount: categories.length,
    articles: [],
  };

  for (const article of articles) {
    const title = decodeTitle(article.title.rendered);
    const url = article.link;
    const markdown = htmlToMarkdown(article.content.rendered);
    const catIds = article.knowledgebase_cat ?? [];
    const catNames = catIds
      .map((id) => categories.find((c) => c.id === id)?.name)
      .filter(Boolean)
      .map(decodeTitle);

    const frontmatter = [
      "---",
      `title: "${title.replace(/"/g, '\\"')}"`,
      `source: ${url}`,
      `updated: ${article.modified}`,
      `categories: [${catNames.map((n) => `"${n.replace(/"/g, '\\"')}"`).join(", ")}]`,
      "---",
      "",
    ].join("\n");

    const content = `${frontmatter}# ${title}\n\n> Nguồn: [${url}](${url})\n\n${markdown}\n`;
    const filePath = urlToFilePath(url);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, content, "utf8");

    manifest.articles.push({
      title,
      url,
      file: filePath.replace(OUT_DIR + "/", ""),
      categories: catNames,
      updated: article.modified,
    });
    console.log(`  ✓ ${title}`);
  }

  const tree = buildCategoryTree(categories);
  const grouped = groupArticlesByCategory(articles, categories);

  let articleIndex = "## Danh sách bài viết theo danh mục\n\n";
  for (const [catName, items] of [...grouped.entries()].sort((a, b) =>
    a[0].localeCompare(b[0], "vi"),
  )) {
    articleIndex += `### ${catName}\n\n`;
    for (const item of items.sort((a, b) =>
      a.title.rendered.localeCompare(b.title.rendered, "vi"),
    )) {
      const title = decodeTitle(item.title.rendered);
      const rel = item.link.replace(BASE_URL, "");
      articleIndex += `- [${title}](${rel})\n`;
    }
    articleIndex += "\n";
  }

  const readme = `# Goong Help Docs (Tiếng Việt)

Tài liệu hướng dẫn Goong được scrape tự động từ [help.goong.io](${BASE_URL}) để tham khảo khi coding.

- **Scrape lúc:** ${manifest.scrapedAt}
- **Số bài viết:** ${articles.length}
- **Số danh mục:** ${categories.length}

## Cấu trúc sidebar

${renderTree(tree)}

${articleIndex}

## Ghi chú

- Nội dung gốc tiếng Việt từ trang help chính thức của Goong.
- Chạy lại scraper: \`node scripts/scrape-goong-help.mjs\`
- API endpoint: \`${API}/knowledgebase\`
`;

  await writeFile(join(OUT_DIR, "README.md"), readme, "utf8");
  await writeFile(join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

  console.log(`\nDone! Saved to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
