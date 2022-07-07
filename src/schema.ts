import * as yup from "yup";

export default yup.object({
  urls: yup
    .array(yup.string().required())
    .default([])
    .test({
      test: (x) => x.length < 15,
    }),
  configuration: yup.object({
    landscape: yup.boolean().default(false),
    images: yup.boolean().default(true),
    contents: yup.boolean().default(true),
    related: yup.boolean().default(false),
    footnotes: yup.boolean().default(false),
    references: yup.boolean().default(false),
    format: yup
      .string()
      .oneOf([
        "letter",
        "legal",
        "tabloid",
        "ledger",
        "a0",
        "a1",
        "a2",
        "a3",
        "a4",
        "a5",
        "a6",
      ])
      .default("letter"),
    scale: yup.number().min(0.1).max(2).default(1),
    margin: yup.string().default(".125in"),
  }),
});
