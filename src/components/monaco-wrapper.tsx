import { handleVoidPromise } from "@/utils/handle-void-promises";
import { loadStaticDts } from "@/utils/load-dts";
import type { Monaco } from "@monaco-editor/react";
import Editor from "@monaco-editor/react";
import { constrainedEditor } from "constrained-editor-plugin";
import type { editor } from "monaco-editor";
import type { ReactNode } from "react";
import { forwardRef, useImperativeHandle, useRef } from "react";
import useElementSize from "./common/hooks/use-element-size";

export type RangeRestriction = {
  range: [number, number, number, number];
  allowMultiline?: boolean;
  label?: string;
  validate?: () => void;
};
export type MonacoWrapperProps = {
  value?: string;
  defaultValue?: string;
  restrictions?: RangeRestriction[];
  onValidate?: (errors: number) => void;
  onTextChanged?: (text: string) => void;
  children?: ReactNode;
};

const MonacoWrapper = forwardRef(
  (
    {
      defaultValue,
      value,
      restrictions,
      onValidate,
      onTextChanged,
      children,
    }: MonacoWrapperProps,
    ref,
  ) => {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<Monaco | null>(null);
    const [divRef, { width, height }] = useElementSize();
    useImperativeHandle(ref, () => {
      return {
        getWidth() {
          return width;
        },
        getHeight() {
          return height;
        },
        setText(text: string) {
          editorRef.current?.setValue(text);
        },
        getText() {
          return editorRef.current?.getValue();
        },
        updateConstraints(restrictions: RangeRestriction[]) {
          updateConstraints(restrictions);
        },
        setReadOnly(value: boolean) {
          editorRef.current?.updateOptions({ readOnly: value });
        },
      };
    });
    function handleEditorValidation(markers: editor.IMarker[]) {
      if (markers.length == 1 && markers[0] && markers[0].code === "6196") {
        return onValidate && onValidate(0);
      }
      onValidate && onValidate(markers.length);
    }
    async function handleEditorWillMount(monaco: Monaco) {
      SetTypescriptDefaults(monaco);
      await loadStaticDts(monaco, ["react", "react-dom", "utils"]);
    }
    function handleEditorDidMount(
      editor: editor.IStandaloneCodeEditor,
      monaco: Monaco,
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
      if (restrictions)
        SetConstraints(monacoRef.current, editorRef.current, restrictions);
    }

    const updateConstraints = (restrictions: RangeRestriction[]) => {
      if (!restrictions || !monacoRef.current || !editorRef.current) return;
      removeConstraints();
      SetConstraints(monacoRef.current, editorRef.current, restrictions);
    };
    const removeConstraints = () => {
      const model = editorRef.current?.getModel();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      if (model?.disposeRestrictions) model?.disposeRestrictions();
    };

    return (
      <div className="relative h-full w-full" ref={divRef}>
        <Editor
          onValidate={handleEditorValidation}
          theme="vs-dark"
          height={"65vh"}
          onChange={() =>
            onTextChanged &&
            editorRef.current &&
            onTextChanged(editorRef.current?.getValue())
          }
          defaultValue={defaultValue}
          value={value}
          defaultLanguage="typescript"
          onMount={handleEditorDidMount}
          beforeMount={handleVoidPromise(handleEditorWillMount)}
        />
        {children}
      </div>
    );
  },
);
MonacoWrapper.displayName = "MonacoWrapper";
export default MonacoWrapper;
function SetConstraints(
  monaco: Monaco,
  editor: editor.IStandaloneCodeEditor,
  restrictions: RangeRestriction[],
) {
  const model = editor.getModel();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
  const constrainedInstance = constrainedEditor(monaco);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  constrainedInstance.initializeIn(editor);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  constrainedInstance.addRestrictionsTo(
    model,
    restrictions?.map((restriction) => restriction),
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
    allowUnusedLabels: true,
    noUnusedLocals: false,
    noUnusedParameters: false,
  });
}
