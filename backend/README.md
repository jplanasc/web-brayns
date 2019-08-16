# Python services

Here is the template for Python3 services:
```python
#!/usr/bin/env python3

def exec(input):
    return input


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
```

All the logic of your service takes place in the `exec(input)` function.
