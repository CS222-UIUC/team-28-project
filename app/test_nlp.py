#!/usr/bin/env python3
import sys
import os

# Add the parent directory to the path so we can import nlp
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

# Now we can import from the routers
from routers.nlp_events import direct_process

def main():
    direct_process()
    

if __name__ == "__main__":
    main() 