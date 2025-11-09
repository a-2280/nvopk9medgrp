import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      // Singleton for hero
      S.listItem()
        .title("First Section on Site")
        .id("hero")
        .child(S.document().schemaType("hero").documentId("hero")),
      // Singleton for about
      S.listItem()
        .title("About Section")
        .id("about")
        .child(S.document().schemaType("about").documentId("about")),
      // Divider
      S.divider(),
      // All other document types
      ...S.documentTypeListItems().filter(
        (item) => item.getId() !== "hero" && item.getId() !== "about"
      ),
    ]);
