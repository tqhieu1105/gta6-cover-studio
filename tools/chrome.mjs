import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
export const KIT = "/workspace/makefun/bounties/gta6-cover-art-01/kit";
export const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export async function withChrome(task) {
  const port = 9437;
  const child = spawn(
    "/usr/bin/google-chrome",
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${KIT}/chrome-after-hours`,
      "--no-first-run",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  let socket;
  let nextId = 0;
  const pending = new Map();
  const listeners = new Map();
  try {
    let tabs;
    for (let i = 0; i < 100; i++) {
      try {
        tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
        break;
      } catch {
        await pause(100);
      }
    }
    if (!tabs) throw Error("Chrome did not start");
    socket = new WebSocket(
      tabs.find((tab) => tab.type === "page").webSocketDebuggerUrl,
    );
    await new Promise((resolve, reject) => {
      socket.onopen = resolve;
      socket.onerror = reject;
    });
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const promise = pending.get(message.id);
        pending.delete(message.id);
        if (message.error)
          promise?.reject(Error(JSON.stringify(message.error)));
        else promise?.resolve(message.result);
      } else
        for (const listener of listeners.get(message.method) || [])
          listener(message.params);
    };
    const call = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = ++nextId;
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    const on = (method, listener) =>
      listeners.set(method, [...(listeners.get(method) || []), listener]);
    const evaluate = async (expression) => {
      const result = await call("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      if (result.exceptionDetails)
        throw Error(JSON.stringify(result.exceptionDetails));
      return result.result.value;
    };
    const navigate = async (query = "") => {
      await call("Page.navigate", { url: `http://127.0.0.1:8317/${query}` });
      for (let i = 0; i < 100; i++) {
        await pause(100);
        if (await evaluate("window.__shotReady===true")) return;
      }
      throw Error("App was not ready: " + query);
    };
    await call("Page.enable");
    await call("Runtime.enable");
    await task({ call, on, evaluate, navigate });
  } finally {
    socket?.close();
    child.kill("SIGTERM");
  }
}
