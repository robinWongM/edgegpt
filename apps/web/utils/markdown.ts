import MarkdownIt from "markdown-it";
import MarkdownItFootnote from "markdown-it-footnote";
import { setCDN, getHighlighter, BUNDLED_LANGUAGES, Lang } from "shiki";

setCDN("https://cdn.jsdelivr.net/npm/shiki/");

const highlighter = await getHighlighter({
  theme: "github-light",
  langs: [],
});
const languagePromises: Record<string, Promise<void> | undefined> = {};

const highlight = (code: string, language: string) => {
  if (highlighter.getLoadedLanguages().includes(language as Lang)) {
    return highlighter.codeToHtml(code, { lang: language });
  }

  // Check if already loading language
  if (languagePromises[language]) {
    return highlighter.codeToHtml(code, { lang: "text" });
  }

  // load language
  // Check if the language is supported by Shiki
  const bundles = BUNDLED_LANGUAGES.filter((bundle) => {
    // Languages are specified by their id, they can also have aliases (i. e. "js" and "javascript")
    return bundle.id === language || bundle.aliases?.includes(language);
  });

  if (bundles.length > 0) {
    // Start loading the language
    languagePromises[language] = highlighter.loadLanguage(language as Lang);
  }

  return highlighter.codeToHtml(code, { lang: "text" });
};

export const markdownIt = MarkdownIt({
  typographer: true,
  highlight,
  breaks: true,
});
markdownIt.use(MarkdownItFootnote);
