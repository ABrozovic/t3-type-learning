import type { Monaco } from "@monaco-editor/react";
import Editor from "@monaco-editor/react";
import clsx from "clsx";
import { constrainedEditor } from "constrained-editor-plugin";
import type { editor } from "monaco-editor";
import { useState } from "react";
import Confetti from "react-confetti";
import type { RangeRestriction } from "../pages";
import Pagination from "../pages/example";
import type { SubjectWithIndexedChallenges } from "../server/api/routers/subjects/get-subject";
import { handleVoidPromise } from "../utils/handle-void-promises";
import { loadStaticDts } from "../utils/load-dts";
import useElementSize from "./common/hooks/use-element-size";

export type MonacoWrapperProps = {
  subject: SubjectWithIndexedChallenges;
  currentChallenge: number;
  onPageChanged: (page: number) => void;
  onValidate: (errors: number) => void;
  onConfettiComplete: () => void;
};


const MonacoWrapper = ({
  subject,
  currentChallenge,
  onPageChanged,
  onValidate,
  onConfettiComplete
}: MonacoWrapperProps) => {
  const [divRef, { width, height }] = useElementSize();

  const isIndexInArray = <T extends { index: number }>(
    array: T[],
    index: number
  ) => {
    return array.find((item) => item.index === index);
  };

  function handleEditorValidation(markers: editor.IMarker[]) {
    onValidate(markers.length);
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
      glyphMargin: true,
      folding: true,
      lineDecorationsWidth: 0,
      lineNumbersMinChars: 0,
    });

    if (
      subject.challenges.find(
        (challenge) => challenge.index === currentChallenge
      )?.restrictions?.length ||
      0 > 0
    ) {
      SetConstraints(
        monaco,
        editor,
        subject?.challenges.find(
          (challenge) => challenge.index === currentChallenge
        )?.restrictions
      );
    }
  }
  const handlePageChange = (page: number) => {

    onPageChanged(page);
  };
  if (!subject) return null;
  return (
    <>
      <div className="h-full  w-full bg-slate-300 p-24 ">
        <div className="mx-auto max-w-screen-xl">
          <div
            className={clsx(
              `hover:animate-rainbow relative rounded-xl p-7 transition-all duration-300 `,
              {
                "animate-border bg-gradient-to-tr from-slate-900  to-green-700 bg-[length:600%_600%]":
                isIndexInArray(subject.challenges, currentChallenge)
                ?.challengeStorage.status === "GREEN",
                "bg-green-800":
                isIndexInArray(subject.challenges, currentChallenge)
                ?.challengeStorage.status === "SOLVED",
                "bg-slate-900":
                isIndexInArray(subject.challenges, currentChallenge)
                ?.challengeStorage.status !== "SOLVED",
              }
            )}
            ref={divRef}
          >
            <Editor
              key={currentChallenge}
              onValidate={handleEditorValidation}
              theme="vs-dark"
              height={"20rem"}
              value={
                subject.challenges.find(
                  (challenge) => challenge.index === currentChallenge
                )?.problem
              }
              defaultLanguage="typescript"
              onMount={handleEditorDidMount}
              beforeMount={handleVoidPromise(handleEditorWillMount)}
            />
            <Pagination
              defaultPage={currentChallenge === 0 ? 1 : currentChallenge}
              numberOfPages={subject._count.challenges}
              onPageChange={handlePageChange}
            />
            {isIndexInArray(subject.challenges, currentChallenge)
              ?.challengeStorage.status === "CHEERING" && (
              <Confetti
                confettiSource={{ x: -15, y: height, w: 5, h: -20 }}
                initialVelocityY={30}
                height={height}
                width={width}
                recycle={false}
                wind={0.3}
                onConfettiComplete={(confetti) => {
                  onConfettiComplete();
                  confetti?.reset();
                }}
                drawShape={drawStars}
                colors={GOLD_COLORS}
              />
            )}
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
  constrainedInstance.addRestrictionsTo(
    model,
    restrictions?.map(
      ({
        initialRow,
        initialColumn,
        finalRow,
        finalColumn,
        allowMultiline,
        label,
      }) =>
        ({
          range: [initialRow, initialColumn, finalRow, finalColumn],
          label,
          allowMultiline,
        } as RangeRestriction)
    )
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
