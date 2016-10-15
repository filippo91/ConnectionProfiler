import json
from pprint import pprint

with open('mock_data.json') as data_file:    
    data = json.load(data_file)

new_data = {}



for el in data:
    if el['asnum'] not in new_data:
        new_data[el['asnum']] = el['asname']
    else:
    	el['asname'] = new_data[el['asnum']]

with open('mock_data_parsed.json', 'w') as outfile:
    json.dump(data, outfile)
