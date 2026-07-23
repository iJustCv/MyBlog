import type { CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;

const stripMarkdown = (source: string) => source
  .replace(/```[\s\S]*?```/g, " ")
  .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
  .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
  .replace(/^#{1,6}\s+/gm, "")
  .replace(/[*_`>~-]/g, "")
  .replace(/\s+/g, " ")
  .trim();

export const sortPosts = (posts: BlogPost[]) =>
  [...posts].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

export const formatDate = (date: Date) => new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Shanghai",
}).format(date);

export const getSummary = (post: BlogPost, length = 92) => {
  const text = stripMarkdown(post.body ?? "");
  if (text.length <= length) return text;
  return `${text.slice(0, length).trimEnd()}…`;
};

export const getReadingTime = (post: BlogPost) => {
  const text = stripMarkdown(post.body ?? "");
  const hanCount = (text.match(/[\u3400-\u9fff]/g) ?? []).length;
  const latinWords = text.replace(/[\u3400-\u9fff]/g, " ").match(/[\p{L}\p{N}]+/gu)?.length ?? 0;
  return Math.max(1, Math.ceil(hanCount / 400 + latinWords / 200));
};

export const basePath = (path = "/") => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
};

export const postPath = (post: BlogPost) => basePath(`/posts/${post.id}/`);
