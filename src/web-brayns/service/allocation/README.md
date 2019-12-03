# Keycloak workflow

## Step 1
### Query
Method **GET**.

```
https://bbpteam.epfl.ch/auth/realms/BBP/protocol/openid-connect/auth?
nonce=null
&response_type=id_token%20token
&state=e00550b3-0559-4e1d-992d-4887ff7c33e7
&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2F%3Fhost%3Dauto
&client_id=webbrayns&scope=profile
```

`state` is NOT the client secret key. It is added by the JSO library.

### Response
401 Unauthorized

## Step 2
### Query
Method **POST**.

```
https://bbpteam.epfl.ch/auth/realms/BBP/login-actions/authenticate?
session_code=HxziUE-hFeIrcyepLZqr7TRwbjAcKMTDSLdM642byO4
&execution=82f53215-9200-4e9d-b150-d67184287893
&client_id=webbrayns
&tab_id=1DTtJjjtDP0
```

Here also, `session_code` and `execution` are created by JSO library.

### Response
302 Found

A cookie is set with KeyCloak information:
```
{
    "Response Cookies": {
        "KC_RESTART": {
            "expires": "1970-01-01T00:00:10.000Z",
            "httpOnly": true,
            "path": "/auth/realms/BBP/",
            "secure": true,
            "value": ""
        },
        "KEYCLOAK_IDENTITY": {
            "httpOnly": true,
            "path": "/auth/realms/BBP/",
            "secure": true,
            "value": "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI1YzljODlkNi00NmI0LTQ4YzMtYTIwYS1hOGViYzhjZTU2MWUifQ.eyJqdGkiOiIyMjQxNmFkNS1hOGRlLTQzZDEtYmM3MS01NmVkZDYwZjA4YzkiLCJleHAiOjE1NzU0MDE5MDksIm5iZiI6MCwiaWF0IjoxNTc1MzY1OTA5LCJpc3MiOiJodHRwczovL2JicHRlYW0uZXBmbC5jaC9hdXRoL3JlYWxtcy9CQlAiLCJzdWIiOiJmOjlkNDZkZGQ2LTEzNGUtNDRkNi1hYTc0LWJkZjAwZjQ4ZGZjZTpwZXRpdGplYSIsImF1dGhfdGltZSI6MCwic2Vzc2lvbl9zdGF0ZSI6ImI0ZmU5MDBmLTIyZWItNDY3ZS04ODA0LTc0MmQ4NzBlMzg5MSIsInN0YXRlX2NoZWNrZXIiOiJ6a2tQZE9ub1A3YWY1cmhQd3NDSXFfMmdocmt6NjJMWFZNbUxpVmw5blRBIn0.yVTXMWczQmcr4-bNQ0OvAMsQHT0K5xXVZOOtUoLf4xk"
        },
        "KEYCLOAK_REMEMBER_ME": {
            "expires": "1970-01-01T00:00:10.000Z",
            "httpOnly": true,
            "path": "/auth/realms/BBP/",
            "secure": true,
            "value": ""
        },
        "KEYCLOAK_SESSION": {
            "expires": "2019-12-03T19:38:29.000Z",
            "path": "/auth/realms/BBP/",
            "secure": true,
            "value": "BBP/f:9d46ddd6-134e-44d6-aa74-bdf00f48dfce:petitjea/b4fe900f-22eb-467e-8804-742d870e3891"
        }
    },
    "Request Cookies": {
        "__utma": "181957364.76491591.1571822696.1571822696.1571822696.1",
        "__utmc": "181957364",
        "__utmz": "181957364.1571822696.1.1.utmcsr=localhost:3000|utmccn=(referral)|utmcmd=referral|utmcct=/",
        "2eeb01777fcab39c1e55eba195a014cf": "e32cd3fa96f39583d9a1f7344ffb3cf7",
        "939da23a75f93614986debb1bbd9d7da": "5e4174b62ddda339730db9fce38c9d6d",
        "AUTH_SESSION_ID": "b4fe900f-22eb-467e-8804-742d870e3891.bbpus10",
        "KC_RESTART": "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI1YzljODlkNi00NmI0LTQ4YzMtYTIwYS1hOGViYzhjZTU2MWUifQ.eyJjaWQiOiJ3ZWJicmF5bnMiLCJwdHkiOiJvcGVuaWQtY29ubmVjdCIsInJ1cmkiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvP2hvc3Q9YXV0byIsImFjdCI6IkFVVEhFTlRJQ0FURSIsIm5vdGVzIjp7InNjb3BlIjoicHJvZmlsZSIsImlzcyI6Imh0dHBzOi8vYmJwdGVhbS5lcGZsLmNoL2F1dGgvcmVhbG1zL0JCUCIsInJlc3BvbnNlX3R5cGUiOiJpZF90b2tlbiB0b2tlbiIsImNvZGVfY2hhbGxlbmdlX21ldGhvZCI6InBsYWluIiwicmVkaXJlY3RfdXJpIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwLz9ob3N0PWF1dG8iLCJzdGF0ZSI6IjBmMGFjODAzLWM2ZGUtNDZjYi1iMDQyLTRhZjIxMTA3YjkxNCIsIm5vbmNlIjoibnVsbCJ9fQ.8Jwe0cxXcUeosVcJ3toGdDE_wt61bJXGIw1lsA_h76M"
    }
}
```

The **session_state** can be extracted from `"Request Cookies": { "AUTH_SESSION_ID": ... }`.

## Step 3
Redirection to `http://localhost:8080/?host=auto` with a hash that looks like this:
```
#state=0f0ac803-c6de-46cb-b042-4af21107b914
&session_state=b4fe900f-22eb-467e-8804-742d870e3891
&id_token=eyJ...t6A
&access_token=eyJ...eEQ
&token_type=bearer
&expires_in=28800
```

* `state` = 0f0ac803-c6de-46cb-b042-4af21107b914
* `session_state` = b4fe900f-22eb-467e-8804-742d870e3891
* `id_token` = eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJONS1CU0ZxZG5NS3Y4SWtKUkg1R3E0LVA2c1RWQUxwU0EydGNQeEpWM1NBIn0.eyJqdGkiOiIwZmU4NzYwZi1hYzVjLTQ4N2YtYTNhZS1iMGFhZjE3YWZhMzIiLCJleHAiOjE1NzUzOTQ3MDksIm5iZiI6MCwiaWF0IjoxNTc1MzY1OTA5LCJpc3MiOiJodHRwczovL2JicHRlYW0uZXBmbC5jaC9hdXRoL3JlYWxtcy9CQlAiLCJhdWQiOiJ3ZWJicmF5bnMiLCJzdWIiOiJmOjlkNDZkZGQ2LTEzNGUtNDRkNi1hYTc0LWJkZjAwZjQ4ZGZjZTpwZXRpdGplYSIsInR5cCI6IklEIiwiYXpwIjoid2ViYnJheW5zIiwibm9uY2UiOiJudWxsIiwiYXV0aF90aW1lIjoxNTc1MzY1OTA5LCJzZXNzaW9uX3N0YXRlIjoiYjRmZTkwMGYtMjJlYi00NjdlLTg4MDQtNzQyZDg3MGUzODkxIiwiYXRfaGFzaCI6InZ4cjFPZDJzMUZvSW9QN0FnR2dwaUEiLCJhY3IiOiIxIiwic19oYXNoIjoiRTAzbVhKT1l5cDdFdVBoajlGUGZ5USIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IkZhYmllbiBQZXRpdGplYW4iLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJwZXRpdGplYSIsImdpdmVuX25hbWUiOiJGYWJpZW4iLCJmYW1pbHlfbmFtZSI6IlBldGl0amVhbiIsImVtYWlsIjoiZmFiaWVuLnBldGl0amVhbkBlcGZsLmNoIn0.quUHpxjXxJ3p9DTtTukcrnpT1488hX1fej6t9QN2j5escKVGJ47MKwmv34CVklQ322E1DDLXgFqEEIpJEB3mVtQ9cjmQmYT0y7nNhLfwvUSXRW7g9_tIe4HqZv_tji83thdyXIMXosk-pptb5DFothUHzMnL0ZTblpzq97vpv0L0RYJ8d2CcDXoqxAlQ3geWxW15MF_kmVYPCwkcfH9W6Ov_KwFmyZczkFjcXR9ZJtCbNvV-GZbDHlcGOGuByfvnfHcHshD1BRQZ3TJwMKE3lnJ1A_Bx0kxZMmQH0e7B4L6NvVb3HfETC48iy3IvFtpxsVnrbKd9_B1RkbQnGNZt6A
* `access_token` = eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJONS1CU0ZxZG5NS3Y4SWtKUkg1R3E0LVA2c1RWQUxwU0EydGNQeEpWM1NBIn0.eyJqdGkiOiI2NmYyMjE1Mi0xZDZkLTQ5NjAtOWY5Yi05ODRlYmM3ODdjZTAiLCJleHAiOjE1NzUzOTQ3MDksIm5iZiI6MCwiaWF0IjoxNTc1MzY1OTA5LCJpc3MiOiJodHRwczovL2JicHRlYW0uZXBmbC5jaC9hdXRoL3JlYWxtcy9CQlAiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiZjo5ZDQ2ZGRkNi0xMzRlLTQ0ZDYtYWE3NC1iZGYwMGY0OGRmY2U6cGV0aXRqZWEiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJ3ZWJicmF5bnMiLCJub25jZSI6Im51bGwiLCJhdXRoX3RpbWUiOjE1NzUzNjU5MDksInNlc3Npb25fc3RhdGUiOiJiNGZlOTAwZi0yMmViLTQ2N2UtODgwNC03NDJkODcwZTM4OTEiLCJhY3IiOiIxIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6InByb2ZpbGUgZW1haWwiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5hbWUiOiJGYWJpZW4gUGV0aXRqZWFuIiwicHJlZmVycmVkX3VzZXJuYW1lIjoicGV0aXRqZWEiLCJnaXZlbl9uYW1lIjoiRmFiaWVuIiwiZmFtaWx5X25hbWUiOiJQZXRpdGplYW4iLCJlbWFpbCI6ImZhYmllbi5wZXRpdGplYW5AZXBmbC5jaCJ9.ApMEBdSssXsmbp-RWoNOhdBa1e-FD5tmEIF2GSE7KdYsTg18w4KK-DNC_m_RMwF2tUT90l0iAaZZNcGycZJFJeDl-2ybbONSggyywaZ7lKFOskNsio8Joo2Ax3QVgCdpNW9-QzQ47UJSiBTqhtCT2V_s1dsxTRRdoqKLYjmajAs_CRDgpYDC5OFN5kkctF1T_jk2uoX4_HYUnjsjZPacUAiol74t5S8UeSv5SHsqikv2qEgIEIA2jOGXlLC2yJ7pQIEDO_XJRTY4-RmKUyyYFEXqOIud3UMlIu7-J92YqAaxWDoQyGxVE1Nb1xV4yqBXFKnXHOq3zWhss0ZepwleEQ
* `token_type` = bearer
* `expires_in` = 28800

> The Keycloak token you need is **access_token**.
