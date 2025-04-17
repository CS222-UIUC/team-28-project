import os
import signal
import psutil
import uvicorn

def kill_process_on_port(port):
    """Kill any process that is currently using the specified port."""
    try:
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                if 'python' in proc.info['name'] and any('app/main.py' in cmd for cmd in proc.info['cmdline'] if cmd):
                    if proc.pid != os.getpid():  # Don't kill ourselves
                        print(f"Killing previous instance of the application (PID: {proc.pid})")
                        os.kill(proc.pid, signal.SIGTERM)
                        # Wait a moment for the process to terminate
                        try:
                            proc.wait(timeout=2)
                        except psutil.TimeoutExpired:
                            # If it doesn't terminate gracefully, force kill
                            os.kill(proc.pid, signal.SIGKILL)
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                continue
    except Exception as e:
        print(f"Error while attempting to kill process on port {port}: {e}")

def start_server(app, port=8000):
    """Start the FastAPI server"""
    print(f"Starting server on http://127.0.0.1:{port}")
    
    kill_process_on_port(port)
    
    uvicorn.run(app, host="127.0.0.1", port=port) 