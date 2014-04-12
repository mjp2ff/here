import requests
import json

ex2 = """
    {
        "url":"net.net"
    }
"""
# base = "http://localhost:5000"
base = "http://glocale.herokuapp.com"

r = requests.get(base + "/getmessages", data=ex2, headers={"content-type":"application/json"})

print r.status_code
try:
	print json.dumps(r.json(), indent=4)
except ValueError:
	print "No json!"