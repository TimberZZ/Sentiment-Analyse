from flask import Flask, send_file
from flask import render_template
from utils.Analyzer import NarrativeAnalyzer
from flask import json
import os

app = Flask(__name__)

analyzer = NarrativeAnalyzer()


@app.route('/')
@app.route('/index')
@app.route('/conn')
def get_connection_page():
    return render_template("conn.html")


@app.route('/sentiment')
def get_sentiment_page():
    return render_template("sentiment.html")


@app.route('/cohesive')
def get_cohesive_page():
    return render_template("cohesive.html")

@app.route('/location')
def get_location_page():
    return render_template("location.html")


@app.route('/sentiments')
def get_sentiments():
    if os.path.exists('./Data/res/sents.json'):
        return send_file('./Data/res/sents.json')
    else:
        sents = analyzer.analyze_sents("./Data/Burrow.txt")
        with open('./Data/res/sents.json', 'w') as file:
            file.write(json.dumps(sents))
        return json.jsonify(sents)


@app.route('/conns')
def get_connections():
    if os.path.exists('./Data/res/conns.json'):
        return send_file('./Data/res/conns.json')
    else:
        conns = analyzer.analyze_conns("./Data/Burrow.txt", "./Data/characters.txt")
        with open('./Data/res/conns.json', 'w') as file:
            file.write(json.dumps(conns))
        return json.jsonify(conns)

@app.route('/location_conns')
def get_local_connections():
    if os.path.exists('./Data/res/loc_conns.json'):
        return send_file('./Data/res/loc_conns.json')
    else:
        conns = analyzer.analyze_location_conns("./Data/Burrow.txt", "./Data/locations.txt")
        with open('./Data/res/loc_conns.json', 'w') as file:
            file.write(json.dumps(conns))
        return json.jsonify(conns)


@app.route('/cohe')
def get_cohesive():
    if os.path.exists('./Data/res/cohesiveness.json'):
        return send_file('./Data/res/cohesiveness.json')
    else:
        cohesiveness = analyzer.analyze_cohesive("./Data/Burrow.txt")
        with open('./Data/res/cohesiveness.json', 'w') as file:
            file.write(json.dumps(cohesiveness.tolist()))
        return json.jsonify(cohesiveness.tolist())


if __name__ == '__main__':
    app.run()
