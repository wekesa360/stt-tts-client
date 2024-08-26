importScripts('https://cdn.jsdelivr.net/pyodide/v0.22.1/full/pyodide.js');

async function loadPyodideAndPackages() {
  self.pyodide = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.22.1/full/'
  });
  await self.pyodide.loadPackage(['numpy']);
  self.postMessage('ready');
}

loadPyodideAndPackages();

self.onmessage = async (event) => {
  const { python, ...context } = event.data;
  for (const key of Object.keys(context)) {
    self.pyodide.globals.set(key, context[key]);
  }
  try {
    const results = await self.pyodide.runPythonAsync(python);
    self.postMessage({ results });
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};