import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PythonBridge {
  constructor() {
    this.process = null;
    this.requests = new Map();
    this.requestId = 0;
    this.buffer = '';
  }
  
  start() {
    const scriptPath = path.join(__dirname, 'python_bridge.py');
    this.process = spawn('python', [scriptPath], { stdio: ['pipe', 'pipe', 'pipe'] });
    
    this.process.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const response = JSON.parse(line);
          const resolve = this.requests.get(response.id);
          if (resolve) {
            this.requests.delete(response.id);
            if (response.status === 'success') {
              resolve.resolve(response.result);
            } else {
              resolve.reject(new Error(response.error));
            }
          }
        } catch (e) {
          console.error('JSON parse error from Python:', line, e);
        }
      }
    });
    
    this.process.stderr.on('data', (data) => {
      // console.error('Python log:', data.toString());
    });
    
    // Process exit handling
    this.process.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        console.error(`Python process exited with code ${code}`);
      }
    });
  }
  
  stop() {
    if (this.process) {
      this.process.kill();
    }
  }
  
  send(command) {
    return new Promise((resolve, reject) => {
      if (!this.process) {
        this.start();
      }
      
      const id = ++this.requestId;
      this.requests.set(id, { resolve, reject });
      
      const payload = { ...command, id };
      this.process.stdin.write(JSON.stringify(payload) + '\n');
    });
  }
  
  async importModule(moduleName) {
    return this.send({ command: 'import', module: moduleName });
  }
  
  async call(moduleName, functionName, args) {
    return this.send({ command: 'call', module: moduleName, function: functionName, args });
  }
}
