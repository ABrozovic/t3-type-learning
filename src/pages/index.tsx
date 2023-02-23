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
import { handleVoidPromise } from "../utils/handle-void-promises";
import { loadStaticDts } from "../utils/load-dts";
import Pagination from "./example";
export type RangeRestriction = {
  range: [number, number, number, number];
  allowMultiline?: boolean;
  label?: string;
  validate?: () => void;
};
const BASE_TAKE = 5;
const BASE_SKIP = 0;
const Home: NextPage = () => {
  const monacoRef = useRef<Monaco | null>(null);
  const [divRef, { width, height }] = useElementSize();
  const [cheer, setCheer] = useState(false);
  const [solved, setSolved] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const takeRef = useRef(BASE_TAKE);
  const skipRef = useRef(0);
  const utils = api.useContext();

  function handleEditorValidation(markers: editor.IMarker[]) {
    !solved && markers.length === 0 && setCheer(true);
  }

  const { data } = api.subject.get.useQuery(
    {
      slug: "basic-types",
      take: BASE_TAKE,
      skip: BASE_SKIP,
    },
    {
      keepPreviousData: true,
      select: (data) => ({
        ...data,
        challenges: data?.challenges.map((challenge, index) => ({
          index: index + BASE_SKIP,
          challenge: challenge,
        })),
      }),
    }
  );    
  const updateData = async (page: number) => {
    setCurrentChallenge(page - 1);
    if (page % BASE_TAKE > BASE_TAKE - 2) {
      skipRef.current = takeRef.current;
      const newData = await utils.subject.get.fetch({
        slug: "basic-types",
        skip: skipRef.current,
        take: takeRef.current,
      });
      if (!newData || !data) return;
      // utils.subject.get.setData(
      //   {
      //     slug: "basic-types",
      //     take: BASE_TAKE,
      //   },
      //   {
      //     _count: newData._count,
      //     challenges: [...data.challenges, ...newData.challenges],
      //     createdAt: data.createdAt,
      //     id: data.id,
      //     name: data.name,
      //     slug: data.slug,
      //     updatedAt: data.updatedAt,
      //   }
      // );
    }
  };

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
    if (!data?.challenges || data?.challenges[currentChallenge]?.challenge.restrictions?.length || 0 > 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const constrainedInstance = constrainedEditor(monaco);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      constrainedInstance.initializeIn(editor);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      constrainedInstance.addRestrictionsTo(
        model,
        !data?.challenges ||  data?.challenges[currentChallenge]?.challenge.restrictions.map(
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
  }
  if(!data || !data.challenges) return null;
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
              key={currentChallenge}
              onValidate={handleEditorValidation}
              theme="vs-dark"
              height={"20rem"}
              value={data.challenges[currentChallenge]?.challenge.problem}
              defaultLanguage="typescript"
              onMount={handleEditorDidMount}
              beforeMount={handleVoidPromise(handleEditorWillMount)}
            />
            <Pagination
              numberOfPages={data?._count?.challenges}
              onPageChange={(page) => updateData(page)}
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
  await ssg.subject.get.prefetch({ slug, take: BASE_TAKE, skip: BASE_SKIP, });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      slug,
    },
  };
};
