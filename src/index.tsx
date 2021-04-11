import "bulmaswatch/superhero/bulmaswatch.min.css";
import * as esbuild from "esbuild-wasm";

import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

import Preview from './components/preview'
import CodeEditor from "./components/code-editor";
import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";
import { fetchPlugin } from "./plugins/fetch-plugin";


const App = () => {
  const ref = useRef<any>();
  const [input, setInput] = useState("");
  const [code, setCode] = useState("");

  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: "https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm",
    });
  };

  useEffect(() => {
    startService();
    return () => {
      console.log("cleanup");
    };
  }, []);

  const onClick = async () => {
    // if the service hasn't been run yet just exit
    if (!ref.current) {
      return;
    }



    const result = await ref.current.build({
      entryPoints: ["index.js"],
      bundle: true,
      write: false,
      plugins: [unpkgPathPlugin(), fetchPlugin(input)],
      define: {
        "process.env.NODE_ENV": '"production"',
        global: "window",
      },
    });
    setCode(result.outputFiles[0].text);

  };

  
  return (
    <div>
      <CodeEditor onChange={(value) => setInput(value)} initialValue="const a = 1;" />
      <div>
        <button onClick={onClick}>Submit</button>
      </div>
      <Preview code={code}/>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
