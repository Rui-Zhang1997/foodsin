import json
import os
from sqlalchemy import update
from models import Inspection, Session, Table

s = Session()
for file in os.listdir('data'):
    print("Working on", file)
    with open(file) as f:
        data = json.load(f)
        for d in data:
            if d['grade'] != None:
                update(Table.inspection).where(Table.inspection.camis==d['camis']).values(grade=d['grade'])
s.commit()
s.close()
