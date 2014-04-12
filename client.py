import requests
import json

ex1 = """
    {
        "sender":"appleforth the benign",
        "url":"net.net",
        "body":"Hellllllllllooooooooooooooasdf"
    }
"""

ex2 = """
    {
        "url":"net.net"
    }
"""
# r = requests.post("http://glocale.herokuapp.com/newmessage", data=json, headers={"content-type":"application/json"})
# print r.status_code

# base = "http://localhost:5000"
base = "http://glocale.herokuapp.com"

r = requests.get(base + "/getmessages", data=ex2, headers={"content-type":"application/json"})
print r.status_code
print json.dumps(r.json(), indent=4)