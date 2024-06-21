import json

def update_json_data(target_category, updated_audio, audio_data=None, streaming_url=None):
        data_json = 'api/static/text/data.json'
        description_json = 'api/static/text/description.json'
        updated_audio = updated_audio.split('.')[0]
        if updated_audio == '':
            return

        #get ids
        with open(data_json, 'r', encoding='utf-8') as file:
            data = json.load(file)
        with open(description_json, 'r', encoding='utf-8') as file:
            description_data = json.load(file)

        #create audio file with form (ex:1-001.mp3) and update data.json
        if {updated_audio:streaming_url} not in data[target_category]:
            data[target_category].append({updated_audio:streaming_url})
            audio_name = '{}-{:03d}.mp3'.format(list(data.keys()).index(target_category)+1,len(data[target_category]))
            if audio_data is not None:
                with open('api/static/audios/{}'.format(audio_name),'wb') as file:
                    file.write(audio_data)
        with open(data_json, 'w', encoding='utf-8') as file:
            json.dump(data, file, ensure_ascii=False, indent=4)
            
        #create translate file
        for lang in description_data['lang']:
            try:
                with open('api/static/text/{}.json'.format(lang),'r',encoding='utf-8') as file:
                    lang_dict = json.load(file)
            except:
                lang_dict = {}
            #lang_dict.update({'site-title':description_data['site-title']})

            for item_index,item in get_keys(data).items():
                if item_index not in lang_dict:
                    lang_dict[item_index] = item

            for item_index,item in flatten_dict(description_data).items():
                if item_index not in lang_dict:
                    if item_index not in ['footer_left'] and isinstance(item, list):
                        lang_dict[item_index] = item[0]
                    else:
                        lang_dict[item_index] = item

            temp = sorted(lang_dict.keys(),reverse=True)
            lang_dict = {key: lang_dict[key] for key in temp}

            with open('api/static/text/{}.json'.format(lang),'w',encoding='utf-8') as file:
                json.dump(lang_dict, file, ensure_ascii=False, indent=4)

def flatten_dict(d):
    items = []
    for k, v in d.items():
        if isinstance(v, dict):
            items.extend(flatten_dict(v).items())
        else:
            items.append((k, v))
    return dict(items)

def get_keys(d):
    keys = {}
    for index,category in enumerate(list(d.keys())):
        keys.update({'category_{}'.format(index+1):category})
        for item_index,items in enumerate(d[category]):
            for item in items.keys():
                keys.update({'{}-{:03d}'.format(index+1,item_index+1):item})
    return keys

