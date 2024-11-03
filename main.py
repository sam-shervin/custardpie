"""
from server.rag.rag_model import query_rag_pipeline, create_rag_pipeline

create_rag_pipeline("Astro")

model_name = "Astro"
#create_rag_pipeline(model_name)
query = "What is the capital of France?"
results = query_rag_pipeline(model_name, query)
print(results)
"""
import subprocess
import time
import os
import platform

def run_command(command, wait=True):
    """Run a command in the shell."""
    process = subprocess.Popen(command, shell=True)
    if wait:
        process.wait()  # Wait for the command to complete
    return process

def main():
    # Step 1: Change directory to 'ui' and install packages
    print("Changing directory to 'ui' and installing packages...")
    os.chdir("ui")  # Change directory to 'ui'
    run_command("pnpm install")

    # Step 2: Start the server in a separate terminal
    print("Starting the server in a separate terminal...")
    if platform.system() == "Windows":
        subprocess.Popen("start cmd /k pnpm run server", shell=True)  # Open a new CMD window
    elif platform.system() == "Darwin":  # macOS
        subprocess.Popen(["open", "-a", "Terminal", "pnpm run server"])
    else:  # Linux
        subprocess.Popen(["gnome-terminal", "--", "bash", "-c", "pnpm run server; exec bash"])  # Modify this command based on your terminal

    time.sleep(10)

    # Step 3: Build and start the application in the main terminal
    print("Building the application...")
    run_command("pnpm run build")

    print("Starting the application...")
    run_command("pnpm run start")

if __name__ == "__main__":
    main()
