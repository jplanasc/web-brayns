# Cancel of an async query
```
>>> {"method":"add-model","jsonrpc":"2.0","id":"hRV1wGPL","params":{"path":"...""}}
<<< {
        "jsonrpc": "2.0",
        "method": "progress",
        "params": {
            "amount": 0.0,
            "id": "hRV1wGPL",
            "operation": "Loading morphologies..."
        }
    }
>>> {"method":"cancel","jsonrpc":"2.0","params":{"id":"hRV1wGPL"}}
<<< {
    "error": {
        "code": -31002,
        "message": "Request aborted"
    },
    "id": "hRV1wGPL",
    "jsonrpc": "2.0"
}
```
