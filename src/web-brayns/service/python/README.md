# How to create a new Python service?

Assume you want to create a service called __foobar__.
Then you need to create a Python file called `/backend/cgi-bin/foobar.py`
with this skeleton:

```python
#!/usr/bin/env python3

def exec(input, hostname):
    # Put all you code right here.
    return input



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
        params = json.loads(input, hostname)
    except Exception as e:
        print("Invalid JSON param!")
        print(e)
    try:
        output = exec(params)
        print(json.dumps(output, separators=(',', ':')))
    except Exception as e:
        print("Unexpected Exception!")
        print(e)
```
