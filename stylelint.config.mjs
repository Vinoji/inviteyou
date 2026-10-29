
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
  },
};
