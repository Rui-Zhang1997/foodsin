# Gathers sample data to be used during dev.
# Should not be imported. Run only once.

import json, yaml
import requests

with open('config.yaml') as f:
    config = yaml.load(f)
    keys = config['keys']

req = requests.Session()
req.headers.update({'X-App-TOken': keys['SODA']})

limit=50000
offset = 0
file_no = 0
while True:
    print(limit, offset)
    r = req.get('https://data.cityofnewyork.us/resource/9w7m-hzhe.json',
                params={'$limit': limit, '$offset': offset})
    data = r.json()
    with open('data/%s.json' % file_no, 'w') as f:
        json.dump(data, f)
    if len(data) < limit:
        break
    offset += limit
    file_no += 1
