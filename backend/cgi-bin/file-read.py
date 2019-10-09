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
    abs_path = "/" + "/".join(filtered_pieces)
    if abs_path[:len(ROOT)] != ROOT:
        raise Error(2, f"{abs_path} is outside of {ROOT}")
    return abs_path


def exec(input):
    """Read a file content of a given path.

    IN: {path: string}
    Path of the file to read.
    If relative (not starting with "/"), it will be relative to ROOT.

    OUT: string
    File content as text.

    OUT: {code: number, text: string}
    Exception. Here are the code list:
    - 1: Bad input.
    - 2: Bad `relPath`. Usually too many `../` as an attempt to go outside the ROOT.
    - 3: File does not exist or is a directory.
    - 666: Unexpected error.
    """

    try:
        if "path" not in input:
            raise Error(1, "Missing 'path' attribute!") from None
        rel_path = input["path"]
        path = make_absolute_path(rel_path)
        if not os.path.isfile(path):
            raise Error(3, "Not a file: " + path)
        fd = open(path, "r")
        return fd.read()
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
