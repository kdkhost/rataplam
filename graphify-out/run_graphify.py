import sys, json, os
from pathlib import Path

# Step 1: Ensure graphify is installed
try:
    import graphify
    print("graphify already installed")
except ImportError:
    print("Installing graphify...")
    os.system(f"{sys.executable} -m pip install graphifyy -q")
    try:
        import graphify
        print("graphify installed successfully")
    except ImportError:
        print("Failed to install graphify")
        sys.exit(1)

# Save python path
Path("graphify-out").mkdir(exist_ok=True)
Path("graphify-out/.graphify_python").write_text(sys.executable)
print(f"Python path saved: {sys.executable}")

# Step 2: Detect files
from graphify.detect import detect
result = detect(Path("."))
print(json.dumps(result, indent=2))
Path("graphify-out/.graphify_detect.json").write_text(json.dumps(result, indent=2))
