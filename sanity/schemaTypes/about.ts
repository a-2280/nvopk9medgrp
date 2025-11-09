import { defineField, defineType } from "sanity";

export const about = defineType({
  name: "about",
  title: "About Section",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Short Description",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
  },
  // @ts-expect-error
  __experimental_singleton: true,
});
