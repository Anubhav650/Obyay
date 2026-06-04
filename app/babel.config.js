module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          jsTransformer: "hermes-babel-transformer",
          disableImportExportTransform: false,
        },
      ],
    ],
    plugins: [
      "react-native-reanimated/plugin",
      ["@babel/plugin-transform-class-properties", { loose: true }],
      ["@babel/plugin-transform-private-methods", { loose: true }],
      ["@babel/plugin-transform-private-property-in-object", { loose: true }],
    ],
    env: {
      production: {
        presets: [
          [
            "babel-preset-expo",
            {
              jsTransformer: "hermes-babel-transformer",
              disableImportExportTransform: false,
            },
          ],
        ],
      },
    },
  };
};
