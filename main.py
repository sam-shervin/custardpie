
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
    

    # Step 2: Start the server in a separate terminal
    print("Starting the server in a separate terminal...")
    if platform.system() == "Windows":
        subprocess.Popen("start cmd /k pnpm run server", shell=True)  # Open a new CMD window
    elif platform.system() == "Darwin":  # macOS
        
        cwd = os.getcwd()
        start_index = cwd.find("This PC")
        if start_index != -1:
            cwd = cwd[start_index:]
        cwd = cwd.replace(" ", "\\ ")
        osascript_command = f"""osascript -e 'tell app "Terminal" 
        do script "cd {cwd}/server && python3 api.py" end'"""
        # Execute the osascript command
        run_command(osascript_command)
        #run_command()
    else:  # Linux
        subprocess.Popen(["gnome-terminal", "--", "bash", "-c", "pnpm run server; exec bash"])  # Modify this command based on your terminal

    time.sleep(10)
    print("Changing directory to 'ui' and installing packages...")
    os.chdir("ui")  # Change directory to 'ui'
    run_command("pnpm install")
    # Step 3: Build and start the application in the main terminal
    print("Building the application...")
    run_command("pnpm run build")

    print("Starting the application...")
    run_command("pnpm run start")

if __name__ == "__main__":
    main()
