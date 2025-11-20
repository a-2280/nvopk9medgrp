import { defineField, defineType } from "sanity";

export const banner = defineType({
  name: "banner",
  title: "Donation Banner",
  type: "document",
  fields: [
    defineField({
      name: "isEnabled",
      title: "Enable Banner",
      type: "boolean",
      description: "Toggle to show or hide the banner on the website",
      initialValue: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "goalAmount",
      title: "Donation Goal ($)",
      type: "number",
      description:
        "The target amount you want to raise (e.g., 100000 for $100,000)",
      validation: (Rule) =>
        Rule.required()
          .positive()
          .integer()
          .min(1)
          .error("Goal must be a positive number"),
    }),
    defineField({
      name: "currentAmount",
      title: "Current Amount Raised ($)",
      type: "number",
      description: "The current amount raised so far (e.g., 47500 for $47,500)",
      validation: (Rule) =>
        Rule.required()
          .min(0)
          .integer()
          .error("Current amount must be zero or greater"),
    }),
  ],
  preview: {
    select: {
      goalAmount: "goalAmount",
      currentAmount: "currentAmount",
      isEnabled: "isEnabled",
    },
    prepare(selection) {
      const { goalAmount, currentAmount, isEnabled } = selection;
      const percentage = goalAmount
        ? Math.round((currentAmount / goalAmount) * 100)
        : 0;
      return {
        title: `Donation Banner`,
        subtitle: `$${currentAmount?.toLocaleString() || 0} of $${goalAmount?.toLocaleString() || 0} (${percentage}%)`,
      };
    },
  },
  // @ts-expect-error - Singleton configuration
  __experimental_singleton: true,
});
