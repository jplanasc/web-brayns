#!/usr/bin/env python3

from bluepy.v2 import Circuit

def ensureString(arr, name):
    return arr[name]


def ensureStringArray(arr, name):
    return arr[name]


def exec(input, hostname):
    path = ensureString(input, "circuitPath")
    targets = ensureStringArray(input, "targets")
    circuit = Circuit(path)
    ids = []
    for target in targets:
        for id in circuit.cells.ids(target):
            ids.append(str(id))
    return ids



import json
import cgi
import cgitb
cgitb.enable()

print("Content-type: application/json")
print("")

fields = cgi.FieldStorage(encoding="utf8")
if "i" not in fields:
    print("Missing mandatory url param 'i'!")
elif "h" not in fields:
    print("Missing mandatory url param 'h'!")
else:
    hostname = fields["h"].value
    input = fields["i"].value
    params = None
    try:
        params = json.loads(input)
    except Exception as e:
        print("Invalid JSON param!")
        print(e)
    try:
        output = exec(params, hostname)
        print(json.dumps(output, separators=(',', ':')))
    except Exception as e:
        print("Unexpected Exception!")
        print(e)
