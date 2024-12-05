const path = require("path")
const webpack = require("webpack")

module.exports = {
    mode: "production",
    devtool: 'inline-source-map',
    entry: {
        application: "./app/javascript/application.ts"
    },
    output: {
        filename: "[name].js",
        sourceMapFilename: "[file].map",
        chunkFormat: "module",
        path: path.resolve(__dirname, "app/assets/builds"),
    },
    plugins: [
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1
        })
    ],
    module: {
        rules: [
            {
                test: /.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ],
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
        alias: {
            '@glidejs/glide': path.resolve(__dirname, 'node_modules/@glidejs/glide'),
            'swapy': path.resolve(__dirname, 'node_modules/swapy')
        }
    },
}
