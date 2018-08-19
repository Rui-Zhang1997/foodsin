from flask import Flask, jsonify
from models import Restaurant, Session, serialize

app = Flask(__name__)

@app.route('/restaurant', defaults={'borough': 0})
@app.route('/restaurant/<string:borough>')
def get_restaurants(borough):
    s = Session()
    q = s.query(Restaurant)
    if borough != 0:
        q = q.filter(Restaurant.borough==borough)
    ret = serialize(q.all())
    resp = jsonify(ret)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

if __name__ == '__main__':
    app.run(debug=True)
