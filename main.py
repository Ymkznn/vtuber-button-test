from flask import Flask, jsonify, request
import json
from generate import generate

app = Flask(__name__)

@app.route('/')
def index():
    return generate()

@app.route('/data_request', methods=['POST'])
def get_json_data():
    json_request = request.json
    with open('./static/language/{}.json'.format(json_request['lang']), encoding="utf_8") as f:
        json_data = json.load(f)
    return jsonify(json_data)

if __name__ == '__main__':
    app.run(debug=True)