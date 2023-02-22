import type { Monaco } from "@monaco-editor/react";

interface DtsLib {
  dts: string;
  libName: string;
}

export const loadStaticDts = async (
  monaco: Monaco,
  libs: string[]
): Promise<void> => {
  const fetchPromises = libs.map(async (libName): Promise<DtsLib> => {
    const response = await fetch(`/types/${libName}/index.d.ts`);
    const dts = await response.text();
    return { dts, libName };
  });
  const results = await Promise.allSettled(fetchPromises);
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      const { dts, libName } = result.value;
      const modelUri = monaco.Uri.parse(
        `inmemory://model/types/${libName}/index.d.ts`
      );
      monaco.editor.createModel(
        `declare module "${libName}" { ${dts} }`,
        "typescript",
        modelUri
      );
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        `declare module "${libName}" { ${dts} }`,
        `inmemory://model//${libName}.d.ts`
      );
    } else {
      try {
        const reason = result.reason as string;
        console.error(`Failed to load .d.ts file: ${reason}`);
      } catch (error) {
        console.error(error);
      }
    }
  });
};
