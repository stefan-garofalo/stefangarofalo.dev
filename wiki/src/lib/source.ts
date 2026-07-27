import { docs } from "collections/server";
import type { Folder, Item, Node, Root } from "fumadocs-core/page-tree";
import { loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";

import { docsContentRoute, docsImageRoute, docsRoute } from "./shared";

export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

export function getDocsPageTree(): Root {
  const tree = source.getPageTree();
  const project = findTopLevelFolder(tree, "Project");
  const projectIndex = findPageByUrl(tree.children, "/docs/project");

  return {
    ...tree,
    children: [
      {
        type: "folder",
        name: "Internals",
        description: "Internal project operations, specs, runbooks, and decisions",
        root: true,
        index: projectIndex,
        children: project?.children ?? [],
      },
    ],
  };
}

function findTopLevelFolder(tree: Root, name: string): Folder | undefined {
  return tree.children.find((node): node is Folder => node.type === "folder" && node.name === name);
}

function findPageByUrl(nodes: Node[], url: string): Item | undefined {
  for (const node of nodes) {
    if (node.type === "page" && node.url === url) return node;
    if (node.type === "folder") {
      if (node.index?.url === url) return node.index;

      const child = findPageByUrl(node.children, url);
      if (child) return child;
    }
  }
}

export function getPageImage(page: (typeof source)["$inferPage"]) {
  const segments = [...page.slugs, "image.png"];

  return {
    segments,
    url: `${docsImageRoute}/${segments.join("/")}`,
  };
}

export function getPageMarkdownUrl(page: (typeof source)["$inferPage"]) {
  const segments = [...page.slugs, "content.md"];

  return {
    segments,
    url: `${docsContentRoute}/${segments.join("/")}`,
  };
}
