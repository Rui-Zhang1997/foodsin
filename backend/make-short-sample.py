import json

with open('sample.json') as f:
    data = json.load(f)

with open('short-sample.json', 'w') as f:
    json.dump(data[:10], f)
