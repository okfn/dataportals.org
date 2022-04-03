'''Export data from datacatalogs.org CKAN instance and convert to new DB
structure (as of 2014-08-23).

- Get data from API
- Clean it up and merge with old export (which included updated locations)

To run you will need to install unicode csv
'''
import urllib
import json
import unicodecsv as csv

url = 'https://datacatalogs.org/api/search/package?all_fields=1&limit=400'
ckan_fp = 'archive/ckan-export.json'
existing_fp = 'catalogs.csv'
new_fp = 'new.csv'

def retrieve():
    '''retreive current CKAN datacatalogs.org data
    '''
    data = urllib.urlopen(url).read()
    data = json.loads(data)

    fo = open(ckan_fp, 'w')
    json.dump(data, fo, indent=2)

def clean():
    reader = csv.DictReader(open(existing_fp))
    olddata = [ x for x in reader ]
    lookup = {}
    for xx in olddata:
        lookup[xx['id']] = xx

    data = json.load(open(ckan_fp))

    out = []

    for entry in data['results']:
        previous = lookup.get(entry['name'], {})

        description = entry['notes']
        # use previous description if 'better'
        if previous and previous['description'] != entry['notes'] and len(previous['description']) >= len(entry['notes']):
            description = previous['description']

        place = entry['extras'].get('spatial_text')
        if previous:
            place = previous['place'] or place

        showdiffs = False
        # conclusion from by-eye exam is that only differences have ckan stuff
        # as newer and better
        if previous and showdiffs:
            for x in ['title', 'url']:
                if previous[x] != entry[x]:
                    print previous[x], '|||', entry[x]
                    print entry['metadata_modified']

        newrec = {
            'name': entry['name'],
            'title': entry['title'],
            'url': entry['url'],
            'author': entry['author'],
            'description': description,
            'tags': ' '.join(entry.get('tags', [])),
            'groups': ' '.join(entry.get('groups', [])),
            'license': entry.get('license_id', ''),
            'place': place,
            'location': previous.get('location', ''),
            'country': entry['extras'].get('spatial', ''),
            'language': entry['extras'].get('language', ''),
            'status': 'active',
            'metadatacreated': entry['metadata_created'],
            'metadatamodified':  entry['metadata_modified']
            }
        out.append(newrec)

    header = [
        'name',
        'title',
        'url',
        'author',
        'description',
        'tags',
        'groups',
        'license',
        'place',
        'location',
        'country',
        'language',
        'status',
        'metadatacreated',
        'metadatamodified'
        ]
    out = sorted(out, key=lambda x: x['name'])

    print('CKAN entries: %s' % len(data['results']))
    print('Previous entries: %s' % len(olddata))
    print('Output entries: %s' % len(out))

    writer = csv.DictWriter(open(new_fp, 'w'), header, lineterminator='\n')
    writer.writeheader()
    writer.writerows(out)

if __name__ == '__main__':
    # retrieve()
    clean()

