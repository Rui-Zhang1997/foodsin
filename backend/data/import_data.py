import json
import os
from sqlalchemy import update
from models import Restaurant, Inspection, Session, Tables

s = Session()
for file in os.listdir('data'):
    if file.split('.')[-1] == 'json':
        print("Working on", file)
        with open(os.path.join('data', file)) as f:
            data = json.load(f)
            for d in data:
                if 'grade' in d and d['grade'] != None:
                    id = s.query(Restaurant.id).filter(Restaurant.camis==d['camis']).one()[0]
                    q = "update inspection set grade=\"%s\" where restaurant=%s" % (d['grade'], id)
                    s.execute(q)
        s.commit()
s.close()
