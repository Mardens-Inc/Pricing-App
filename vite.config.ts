import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";

export default defineConfig({
    plugins: [react({
        babel: {
            plugins: [
                ["babel-plugin-react-compiler", {
                    "target": "19"
                }]
            ]
        }
    }), wasm()],
    esbuild: {
        legalComments: "none",
        supported: {
            "top-level-await": true // browsers can handle top-level-await features
        }
    },
    clearScreen: false,
    server: {
        host: true,
        port: 3000,
        strictPort: true,
        hmr: {
            protocol: "ws",
            host: "localhost",
            port: 3000,
            clientPort: 3000,
            overlay: true
        },
        watch: {
            ignored: ["**/src-*/**"]
        }
    },
    build: {
        outDir: "target/wwwroot"
    }
});