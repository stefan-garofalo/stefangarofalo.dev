import { metaSchema, pageSchema } from "fumadocs-core/source/schema";
import { remarkMdxMermaid } from "fumadocs-core/mdx-plugins";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { z } from "zod";

const wikiPageSchema = pageSchema.extend({
  surface: z.enum(["wiki", "project", "index"]).optional(),
  permission: z.enum(["internal", "project"]).optional(),
});

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: wikiPageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkMdxMermaid],
  },
});
