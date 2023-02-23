import type { Monaco } from "@monaco-editor/react";
import Editor from "@monaco-editor/react";
import { constrainedEditor } from "constrained-editor-plugin";
import type { editor } from "monaco-editor";
import { useState } from "react";
import Confetti from "react-confetti";
import Pagination from "../pages/example";
import type { SubjectWithIndexedChallenges } from "../server/api/routers/subjects/get-subject";
import { handleVoidPromise } from "../utils/handle-void-promises";
import { loadStaticDts } from "../utils/load-dts";
import useElementSize from "./common/hooks/use-element-size";

export type MonacoWrapperProps = {
  subject: SubjectWithIndexedChallenges;
  currentChallenge: number;
  onPageChanged: (page: number) => void;
};

const MonacoWrapper = ({
  subject,
  currentChallenge,
  onPageChanged,
}: MonacoWrapperProps) => {
  const [divRef, { width, height }] = useElementSize();
  const [cheer, setCheer] = useState(false);
  const [solved, setSolved] = useState<boolean[]>(
    Array.from(Array(subject._count.challenges)).fill(false)
  );

  function handleEditorValidation(markers: editor.IMarker[]) {
    !solved && markers.length === 0 && setCheer(true);
  }
  async function handleEditorWillMount(monaco: Monaco) {
    SetTypescriptDefaults(monaco);
    await loadStaticDts(monaco, ["react", "react-dom"]);
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
      glyphMargin: false,
      folding: false,
      lineDecorationsWidth: 0,
      lineNumbersMinChars: 0,
    });

    if (subject.challenges[currentChallenge]?.restrictions?.length || 0 > 0) {
      SetConstraints(
        monaco,
        editor,
        subject?.challenges[currentChallenge]?.restrictions
      );
    }
  }
  if (!subject) return;
  return (
    <>
      <div className="h-full  w-full bg-slate-300 p-24 ">
        <div className="mx-auto max-w-screen-xl">
          <div
            className={`hover:animate-rainbow relative rounded-xl p-7  ${
              solved ? "bg-green-800" : "bg-slate-900"
            } transition-all duration-300`}
            ref={divRef}
          >
            <Editor
              onValidate={handleEditorValidation}
              theme="vs-dark"
              height={"20rem"}
              value={subject.challenges[currentChallenge]?.problem}
              defaultLanguage="typescript"
              onMount={handleEditorDidMount}
              beforeMount={handleVoidPromise(handleEditorWillMount)}
            />
            <Pagination
              numberOfPages={subject._count.challenges}
              onPageChange={onPageChanged}
            />
            <Confetti
              confettiSource={{ x: -15, y: height, w: 5, h: -20 }}
              run={cheer}
              initialVelocityY={30}
              height={height}
              width={width}
              recycle={false}
              wind={0.3}
              onConfettiComplete={(confetti) => {
                setSolved((solved) => [
                  ...solved,
                  (solved[currentChallenge] = true),
                ]);
                setCheer(false);
                confetti?.reset();
              }}
              drawShape={drawStars}
              colors={GOLD_COLORS}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default MonacoWrapper;
function SetConstraints(
  monaco: Monaco,
  editor: editor.IStandaloneCodeEditor,
  restrictions:
    | SubjectWithIndexedChallenges["challenges"][number]["restrictions"]
    | undefined
) {
  const model = editor.getModel();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
  const constrainedInstance = constrainedEditor(monaco);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  constrainedInstance.initializeIn(editor);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  constrainedInstance.addRestrictionsTo(model, restrictions);
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

function drawStars(ctx: CanvasRenderingContext2D) {
  const numPoints = Math.floor(Math.random() * 4) + 2;

  const outerRadius = 12;
  const innerRadius = outerRadius / 2;
  ctx.beginPath();
  ctx.moveTo(0, 0 - outerRadius);

  for (let n = 1; n < numPoints * 2; n++) {
    const radius = n % 2 === 0 ? outerRadius : innerRadius;
    const x = radius * Math.sin((n * Math.PI) / numPoints);
    const y = -1 * radius * Math.cos((n * Math.PI) / numPoints);
    ctx.lineTo(x, y);
  }
  ctx.fill();
  ctx.closePath();
}
const GOLD_COLORS = [
  "#FFD700", // Gold
  "#D4AF37", // Goldenrod
  "#FADA5E", // Lemon Curry
  "#F9A602", // Orange Yellow
  "#E1A95F", // Harvest Gold
  "#E6BE8A", // Satin Sheen Gold
  "#FCC200", // Golden Poppy
  "#FFC200", // Cyber Yellow
  "#FFDF00", // Yellow (Web)
  "#ECD540", // Dandelion
  "#F6E3CE", // Bisque
  "#FFDB58", // Mustard
  "#FFCC33", // Saffron
  "#FFC87C", // Tuscany
  "#C9AE5D", // Antique Brass
  "#8C7853", // Mule Fawn
];
