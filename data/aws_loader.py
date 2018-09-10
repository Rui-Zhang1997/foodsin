import boto3
import json
import decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)

db = boto3.resource('dynamodb', region_name='us', endpoint_url='http://localhost:8000')

table = db.Table('Test')

r = table.scan()['Items']
print(json.dumps(r, cls=DecimalEncoder))
