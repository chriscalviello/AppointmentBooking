const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  devtool: "source-map",
  entry: "./src/index.js",
  output: {
    path: path.join(__dirname, "/dist"),
    filename: "index_bundle.js",
    publicPath: "/",
  },
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.(j|t)sx?$/i,
        use: [
          {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
              presets: ["@babel/typescript", "@babel/react"],
              plugins: [
                ["@babel/proposal-class-properties", { loose: true }],
                "@babel/proposal-object-rest-spread",
                "@babel/plugin-syntax-dynamic-import",
                "@babel/plugin-proposal-optional-chaining",
                "react-hot-loader/babel",
                "emotion",
                "lodash",
              ],
            },
          },
        ],
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto",
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
    ],
  },
  devServer: {
    historyApiFallback: true,
  },
  plugins: [
    new HtmlWebPackPlugin({
      hash: true,
      filename: "index.html", //target html
      template: "./src/index.html", //source html
    }),
    new MiniCssExtractPlugin(),
  ],
};
