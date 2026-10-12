// source.config.ts
import { defineCollections, defineConfig, defineDocs } from "fumadocs-mdx/config";
var docs = defineDocs({
  dir: "content"
});
var blogPosts = defineCollections({
  type: "doc",
  dir: "content/blog"
  // No schema to avoid zod version mismatch; frontmatter is optional
});
var source_config_default = defineConfig({
  mdxOptions: {
    // MDX options
  }
});
export {
  blogPosts,
  source_config_default as default,
  docs
};
