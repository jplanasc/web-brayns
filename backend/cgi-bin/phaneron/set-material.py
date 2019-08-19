#!/usr/bin/env python3
from brayns import Client
from phaneron import CircuitExplorer

def exec(input):
    """
    Set a material for a model.

    IN: {
      host: string,
      modelId: number,
      materialId: number,
      diffuseColor: [number,number,number],
      shadingMode: "none"|  "diffuse" | "cartoon" | "electron",
      glossiness?: number,
      opacity?: number
    }
    """
    for att_name in ("host", "modelId", "materialId", "diffuseColor", "shadingMode"):
        if att_name not in input:
            raise MissingInput(att_name)

    brayns = Client(input["host"])
    circuit_explorer = CircuitExplorer(brayns)

    circuit_explorer.set_material_extra_attributes(model_id=input["modelId"])

    shading_mode = input["shadingMode"]
    if shading_mode == "diffuse":
        shading_mode = CircuitExplorer.SHADING_MODE_DIFFUSE
    elif shading_mode == "cartoon":
        shading_mode = CircuitExplorer.SHADING_MODE_CARTOON
    elif shading_mode == "electron":
        shading_mode = CircuitExplorer.SHADING_MODE_ELECTRON
    else:
        shading_mode = CircuitExplorer.SHADING_MODE_NONE

    if "glossiness" not in input:
        input["glossiness"] = 0
    if "opacity" not in input:
        input["opacity"] = 1

    circuit_explorer.set_material(
        glossiness=input["glossiness"],
        opacity=input["opacity"],
        model_id=input["modelId"],
        material_id=input["materialId"],
        diffuse_color=input["diffuseColor"],
        shading_mode=shading_mode)

    return True


class Error(Exception):
    def __init__(self, code, text):
        self.code = code
        self.text = text


class MissingInput(Error):
    def __init__(self, att_name):
        self.code = 1
        self.text = f"Missing mandatory input attribute: \"{att_name}\"!"


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
