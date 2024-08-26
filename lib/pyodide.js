let pyodideWorker;

export async function initializePyodide() {
  if (!pyodideWorker) {
    pyodideWorker = new Worker('/python-worker.js');
    await new Promise((resolve) => {
      pyodideWorker.onmessage = (event) => {
        if (event.data === 'ready') {
          resolve();
        }
      };
    });
  }
  return pyodideWorker;
}

export function runPython(python, context) {
  return new Promise((resolve, reject) => {
    if (!pyodideWorker) {
      reject(new Error('Pyodide is not initialized. Call initializePyodide() first.'));
      return;
    }

    const handler = (event) => {
      if (event.data.error) {
        reject(new Error(event.data.error));
      } else {
        resolve(event.data.results);
      }
      pyodideWorker.removeEventListener('message', handler);
    };
    pyodideWorker.addEventListener('message', handler);
    pyodideWorker.postMessage({
      python,
      ...context,
    });
  });
}