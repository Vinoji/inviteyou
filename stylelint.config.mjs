
export default {
  extends: ["stylelint-config-standard"],

  ignoreFiles: [
    ".next/**",
    "node_modules/**",
    "out/**",
    "build/**",
  ],

  rules: {
    // Tailwind CSS 4 at-rules
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "theme",
          "utility",
          "variant",
          "custom-variant",
          "apply",
          "source",
          "plugin",
          "config",
        ],
      },
    ],

    // Allow CSS Module camelCase class names
    "selector-class-pattern": null,

    // Allow browser compatibility prefixes
    "property-no-vendor-prefix": null,

    // Avoid enforcing formatting conventions on existing CSS
    "import-notation": null,
    "at-rule-empty-line-before": null,
    "rule-empty-line-before": null,
    "comment-empty-line-before": null,
    "custom-property-empty-line-before": null,
    "color-hex-length": null,
    "color-function-alias-notation": null,
    "color-function-notation": null,
    "alpha-value-notation": null,
    "media-feature-range-notation": null,
    "keyframes-name-pattern": null,

    // Avoid false positives around nested Tailwind directives
    "nesting-selector-no-missing-scoping-root": null,

    // CSS Modules: :global(...) / :local(...) are how a module reaches
    // outside its own scope (html[data-motion], the invite root).
    "selector-pseudo-class-no-unknown": [true, { ignorePseudoClasses: ["global", "local"] }],

    // Formatting and ordering preferences, not errors — in line with the
    // note above about existing CSS.
    "no-descending-specificity": null,
    "declaration-empty-line-before": null,
    "declaration-block-single-line-max-declarations": null,

    // A later rule for the same selector is usually a deliberate override;
    // reported, but not a failure.
    "no-duplicate-selectors": [true, { severity: "warning" }],
    // A value followed by a newer one is a fallback (100vh, then 100svh).
    "declaration-block-no-duplicate-properties": [
      true,
      { ignore: ["consecutive-duplicates-with-different-values"], severity: "warning" },
    ],
  },
};
