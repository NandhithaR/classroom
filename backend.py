from flask import Flask
from flask import request
import datefinder
import datetime
import json

app = Flask(__name__)


@app.route('/getDates', methods=['GET'])
def getDates():
    spokenText = request.args.get('text').lower()

    today = datetime.datetime.now()
    if "tomorrow" in spokenText:
        date = today + datetime.timedelta(days=1)
        spokenText = spokenText.replace("tomorrow", date.strftime("%B %d"))
    if "today" in spokenText:
        date = today
        spokenText = spokenText.replace("today", date.strftime("%B %d"))
    if "yesterday" in spokenText:
        date = today + datetime.timedelta(days=-1)
        spokenText = spokenText.replace("yesterday", date.strftime("%B %d"))

    dates = datefinder.find_dates(spokenText)
    response = []
    for match in dates:
        response.append(match.isoformat())
    return json.dumps(response)

if __name__ == '__main__':
    app.run()
