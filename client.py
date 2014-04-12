import requests

json = """
    {
        "sender":"appleforth the benign",
        "url":"net.net",
        "body":"Hellllllllllooooooooooooooasdf"
    }
"""

json2 = """
    {
        "url":"net.net"
    }
"""
# r = requests.post("http://glocale.herokuapp.com/newmessage", data=json, headers={"content-type":"application/json"})
# print r.status_code
#base = "http://localhost:5000"
base = "http://glocale.herokuapp.com"
r = requests.get(base + "/getmessages", data=json2, headers={"content-type":"application/json"})
print r.status_code
print r.json()
