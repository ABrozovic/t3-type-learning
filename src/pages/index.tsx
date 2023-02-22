import type { Monaco } from "@monaco-editor/react";
import Editor from "@monaco-editor/react";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { constrainedEditor } from "constrained-editor-plugin";
import type { editor } from "monaco-editor";
import type { GetServerSidePropsContext } from "next";
import { type NextPage } from "next";
import { useRef, useState } from "react";
import Confetti from "react-confetti";
import superjson from "superjson";
import useElementSize from "../components/common/hooks/use-element-size";
import { appRouter } from "../server/api/root";
import { createTRPCContext } from "../server/api/trpc";
import { api } from "../utils/api";
import { loadStaticDts } from "../utils/load-dts";
import Pagination from "./example";
type RangeRestriction = {
  range: [number, number, number, number];
  allowMultiline?: boolean;
  label?: string;
  validate?: () => void;
};
const restrictions: RangeRestriction[] = [
  {
    range: [3, 1, 3, 25],
    label: "utilName",
    allowMultiline: false,
  },
];
const Home: NextPage = () => {
  const monacoRef = useRef<Monaco | null>(null);
  const [divRef, { width, height }] = useElementSize();
  const [cheer, setCheer] = useState(false);
  const [solved, setSolved] = useState(false);

  function handleEditorValidation(markers: editor.IMarker[]) {
    !solved && markers.length === 0 && setCheer(true);
  }

  const { data } = api.subject.get.useQuery({ slug: "basic-types" });

  async function handleEditorWillMount(monaco: Monaco) {
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

    await loadStaticDts(monaco, ["react", "react-dom"]);
  }

  function handleEditorDidMount(
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) {
    monacoRef.current = monaco;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const constrainedInstance = constrainedEditor(monaco);
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

    const model = editor.getModel();
    model?.setEOL(monaco.editor.EndOfLineSequence.LF);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    constrainedInstance.initializeIn(editor);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    constrainedInstance.addRestrictionsTo(
      model,
      data?.challenges[0]?.restrictions.map(
        ({
          initialRow,
          initialColumn,
          finalRow,
          finalColumn,
          allowMultiline,
          label,
        }) => ({
          range: [initialRow, initialColumn, finalRow, finalColumn],
          label,
          allowMultiline,
        })
      )
    );
  }
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
              // defaultValue={defaultModelValue}
              value={data?.challenges[0]?.problem}
              defaultLanguage="typescript"
              onMount={handleEditorDidMount}
              beforeMount={() => handleEditorWillMount}
            />
            <Pagination />
            <Confetti
              confettiSource={{ x: -15, y: height, w: 5, h: -20 }}
              run={cheer}
              initialVelocityY={30}
              height={height}
              width={width}
              recycle={false}
              wind={0.3}
              onConfettiComplete={(confetti) => {
                setSolved(true);
                setCheer(false);
                confetti?.reset();
              }}
              drawShape={(ctx) => {
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
              }}
              colors={[
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
              ]}
            />
          </div>
        </div>
      </div>
      <p>{data && data.name}</p>
    </>
  );
};

export default Home;
export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const slug = "basic-types";

  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createTRPCContext(ctx),
    transformer: superjson,
  });
  await ssg.subject.get.prefetch({ slug });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      slug,
    },
  };
};
