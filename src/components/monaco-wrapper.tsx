import type { Monaco } from "@monaco-editor/react";
import Editor from "@monaco-editor/react";
import clsx from "clsx";
import { constrainedEditor } from "constrained-editor-plugin";
import type { editor } from "monaco-editor";
import type { ReactNode } from "react";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { RangeRestriction } from "../pages";
import { handleVoidPromise } from "../utils/handle-void-promises";
import { loadStaticDts } from "../utils/load-dts";
import useElementSize from "./common/hooks/use-element-size";

export type MonacoWrapperProps = {
  value?: string;
  defaultValue?: string;
  restrictions?: RangeRestriction[];
  onPageChanged?: (page: number) => void;
  onValidate?: (errors: number) => void;
  onConfettiComplete?: () => void;
  onTextChanged?: (text: string) => void;
  children?: ReactNode;
};

const MonacoWrapper = forwardRef(
  (
    {
      defaultValue,
      value,
      restrictions,
      onPageChanged,
      onValidate,
      onConfettiComplete,
      onTextChanged,
      children,
    }: MonacoWrapperProps,
    ref
  ) => {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<Monaco | null>(null);
    const [divRef, { width, height }] = useElementSize();
    useImperativeHandle(
      ref,
      () => {
        return {
          getWidth() {
            return width;
          },
          getHeight() {
            return height;
          },
        };
      },
      [height, width]
    );
    function handleEditorValidation(markers: editor.IMarker[]) {
      onValidate && onValidate(markers.length);
    }
    async function handleEditorWillMount(monaco: Monaco) {
      SetTypescriptDefaults(monaco);
      await loadStaticDts(monaco, ["react", "react-dom", "utils"]);
    }
    function handleEditorDidMount(
      editor: editor.IStandaloneCodeEditor,
      monaco: Monaco
    ) {
      editor.updateOptions({
        minimap: {
          enabled: false,
        },
        lineNumbers: "on",
        glyphMargin: true,
        folding: true,
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 0,
      });
      monacoRef.current = monaco;
      editorRef.current = editor;
    }
    useEffect(() => {
      if (!restrictions || !monacoRef.current || !editorRef.current) return;
      SetConstraints(monacoRef.current, editorRef.current, restrictions);
    }, [restrictions]);

    return (
      <>
        <div className="h-full w-full bg-slate-300 p-24 ">
          <div className="mx-auto max-w-screen-xl">
            <div
              className={clsx(
                `hover:animate-rainbow relative rounded-xl bg-red-400 p-7 transition-all duration-300`
                // {
                //   "animate-border bg-gradient-to-tr from-slate-900  to-green-700 bg-[length:600%_600%]":
                //     isIndexInArray(subject.challenges, currentChallenge)
                //       ?.status === "GREEN",
                //   "bg-green-800":
                //     isIndexInArray(subject.challenges, currentChallenge)
                //       ?.status === "SOLVED",
                //   "bg-slate-900":
                //     isIndexInArray(subject.challenges, currentChallenge)
                //       ?.status !== "SOLVED",
                // }
              )}
              ref={divRef}
            >
              <div className="relative overflow-hidden">
                <Editor
                  onValidate={handleEditorValidation}
                  theme="vs-dark"
                  height={"20rem"}
                  onChange={() =>
                    onTextChanged && editorRef.current?.getValue() && onTextChanged(editorRef.current?.getValue())
                  }
                  defaultValue={defaultValue}
                  value={value}
                  defaultLanguage="typescript"
                  onMount={handleEditorDidMount}
                  beforeMount={handleVoidPromise(handleEditorWillMount)}
                />
                {children}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
);
MonacoWrapper.displayName = "MonacoWrapper";
export default MonacoWrapper;
function SetConstraints(
  monaco: Monaco,
  editor: editor.IStandaloneCodeEditor,
  restrictions: RangeRestriction[]
) {
  const model = editor.getModel();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
  const constrainedInstance = constrainedEditor(monaco);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  constrainedInstance.initializeIn(editor);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  constrainedInstance.addRestrictionsTo(
    model,
    restrictions?.map((restriction) => restriction)
  );
}

function SetTypescriptDefaults(monaco: Monaco) {
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    jsx: monaco.languages.typescript.JsxEmit.React,
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowSyntheticDefaultImports: true,
    allowNonTsExtensions: true,
    strictNullChecks: true,
    noEmit: true,
    esModuleInterop: true,
    noUnusedLocals: false,
    noUnusedParameters: false,
  });
}
