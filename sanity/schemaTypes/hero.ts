import { defineField, defineType } from "sanity";

export const hero = defineType({
  name: "hero",
  title: "First Section on Site",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "button",
      title: "Donation Button Text",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "descriptionTitle",
      title: "Description Title",
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
