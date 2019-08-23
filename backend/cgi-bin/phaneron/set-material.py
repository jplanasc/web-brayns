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
      specularColor: [number,number,number],
      specularEnponent: number,
      shadingMode: "none" | "diffuse" | "diffuse-alpha" | "cartoon" | "electron" | "electron-alpha",
      glossiness?: number,
      opacity?: number,
      reflectionIndex: number,
      refreactionIndex: number,
      intensity: number,
      emission: number
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
    elif shading_mode == "diffuse-alpha":
        shading_mode = CircuitExplorer.SHADING_MODE_DIFFUSE_TRANSPARENCY
    elif shading_mode == "cartoon":
        shading_mode = CircuitExplorer.SHADING_MODE_CARTOON
    elif shading_mode == "electron":
        shading_mode = CircuitExplorer.SHADING_MODE_ELECTRON
    elif shading_mode == "electron-alpha":
        shading_mode = CircuitExplorer.SHADING_MODE_ELECTRON_TRANSPARENCY
    else:
        shading_mode = CircuitExplorer.SHADING_MODE_NONE


    circuit_explorer.set_material(
        glossiness=get(input, "glossiness", 1.0),
        opacity=get(input, "opacity", 1.0),
        model_id=input["modelId"],
        material_id=input["materialId"],
        diffuse_color=get(input, "diffuseColor", [1.0, 1.0, 1.0]),
        specular_color=get(input, "specularColor", [1.0, 1.0, 1.0]),
        specular_exponent=get(input, "specularEnponent", 20),
        reflection_index=get(input, "reflectionIndex", 0.0),
        refraction_index=get(input, "refractionIndex", 1.0),
        intensity=get(input, "intensity", 1.0),
        emission=get(input, "emission", 0.0),
        shading_mode=shading_mode),

    return True


def get(input, name, default):
    if name not in input:
        return default
    return input[name]


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
