import os
import subprocess
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


BASE_DIR = os.path.abspath("/home/san")
CURRENT_DIR = BASE_DIR
ALLOWED_COMMANDS = {"ls", "cat", "mkdir", "touch", "echo", "cd", "pwd"}
BLOCKED_KEYWORDS = {"rm", "sudo", "shutdown", "reboot", "mv", "cp", "kill"}
ORIGINS = ["*"]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/command/{command}")
def get_command(command: str):
    return {"msg": execute_command(command)}


def is_safe_command(parts):
    """
    Check if the command is safe to run
    """
    if parts[0] not in ALLOWED_COMMANDS:
        return False
    if any(word in BLOCKED_KEYWORDS for word in parts):
        return False
    return True


def change_directory(new_path):
    """
    Change current directory, if allowed
    """
    global CURRENT_DIR
    
    new_dir = os.path.abspath(os.path.join(CURRENT_DIR, new_path))
    
    # check if new path is in allowed base directory
    if new_dir.startswith(BASE_DIR) and os.path.isdir(new_dir):
        CURRENT_DIR = new_dir
        return CURRENT_DIR
    else:
        return "Access Denied: Not allowed to leave the root directory"


def execute_command(command):
    """
    Executes the command if it's in the allowed commands and directory
    """
    parts = command.split()
    
    if not parts:
        return "Invalid command"
    
    if parts[0] == "cd":
        if len(parts) > 1:
            return change_directory(parts[1])
        else:
            return "Correct usage: cd <directory>"
    
    if not is_safe_command(parts):
        return "Command not allowed"

    try:
        result = subprocess.run(parts, capture_output=True, text=True, shell=False, cwd=CURRENT_DIR)
        return result.stdout or "Command executed, but no output"
    except Exception as e:
        print(f"Error executing command: {e}")
        return "Error executing command"