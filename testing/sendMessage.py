import requests
import json

ex1 = """
    {
        "sender":"Another person!",
        "url":"net.net",
        "body":"Hi sir"
    }
"""

# base = "http://localhost:5000"
base = "http://glocale.herokuapp.com"

r = requests.post(base + "/newmessage", data=ex1, headers={"content-type":"application/json"})

print r.status_code
try:
	print json.dumps(r.json(), indent=4)
except ValueError:
	print "No json!"