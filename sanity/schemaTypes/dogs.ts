import { defineField, defineType } from "sanity";

export const dogs = defineType({
  name: "dogs",
  title: "OpK9 Photos",
  type: "document",
  fields: [
    defineField({
      name: "k9",
      title: "K9",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "officer",
      title: "Officer",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
          },
        },
      ],
      options: {
        layout: "grid",
      },
      validation: (Rule) => Rule.min(1).error("At least one image is required"),
    }),
  ],
  preview: {
    select: {
      title: "k9",
      media: "images.0",
    },
  },
});
