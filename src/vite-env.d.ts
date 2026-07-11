/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string
    readonly VITE_OPENROUTER_API_KEY?: string
    readonly VITE_OPENAI_API_KEY?: string
    readonly VITE_ANTHROPIC_API_KEY?: string
    // add more env variables here
}

interface ImportMeta {
    readonly env: ImportMetaEnv
    readonly glob: (pattern: string) => Record<string, () => Promise<any>>
}

// Vite Worker imports
declare module '*?worker' {
    const workerConstructor: {
        new(): Worker;
    };
    export default workerConstructor;
}
