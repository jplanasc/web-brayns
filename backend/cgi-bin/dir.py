#!/usr/bin/env python3
import os

ROOT = "/gpfs/bbp.cscs.ch/project/"

class Error(Exception):
    def __init__(self, code, text):
        self.code = code
        self.text = text

def make_absolute_path(rel_path):
    path = rel_path
    if len(path) == 0:
        path = ROOT
    elif path[0] != "/":
        path = ROOT + path
    raw_pieces = path.split("/")
    filtered_pieces = list()
    for piece in raw_pieces:
        if piece == "." or piece == "":
            continue
        if piece == "..":
            if len(filtered_pieces) == 0:
                raise Error(2, "Attempt to go outside of the ROOT!")
            del filtered_pieces[-1]
        else:
            filtered_pieces.append(piece)
    abs_path = "/" + "/".join(filtered_pieces) + "/"
    if abs_path[:len(ROOT)] != ROOT:
        raise Error(2, f"{abs_path} is outside of {ROOT}")
    return abs_path


def exec(input):
    """Read a directory content of a given path.

    IN: {path: string}
    Path of the folder you want to inspect.
    If relative (not starting with "/"), it will be relative to ROOT.

    OUT: {path: string, children: [{name: string, size?: number}]}
    When `size` is undefined, it is a subfolder.

    OUT: {code: number, text: string}
    Exception. Here are the code list:
    - 1: Bad input.
    - 2: Bad `relPath`. Usually too many `../` as an attempt to go outside the ROOT.
    - 666: Unexpected error.
    """

    try:
        if "path" not in input:
            raise Error(1, "Missing 'path' attribute!") from None
        rel_path = input["path"]
        path = make_absolute_path(rel_path)
        files = os.listdir(path)
        children = list()
        for file in files:
            info = os.stat(path + file)
            fullpathFile = path + file
            if os.path.isdir(fullpathFile):
                children.append({"name": file})
            else:
                children.append({"name": file, "size": info.st_size})
        return {"path": path, "children": children}
    except Error as e:
        return { "code": e.code, "text": e.text }
    except Exception as e:
        return { "code": 666, "text": str(e) }



import json
import cgi
import cgitb
cgitb.enable()

print("Content-type: application/json")
print("")

fields = cgi.FieldStorage(encoding="utf8")
if "i" not in fields:
    print("Missing mandatory url param!")
else:
    input = fields["i"].value
    params = None
    try:
        params = json.loads(input)
    except Exception as e:
        print("Invalid JSON param!")
        print(e)
    try:
        output = exec(params)
        print(json.dumps(output, separators=(',', ':')))
    except Exception as e:
        print(e)
