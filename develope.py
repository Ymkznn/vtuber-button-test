import json
import os
import re

def __read_data__():
    with open('data.json','r',encoding='utf-8') as file:
        data = json.load(file)
    return data

def __write_data__(data):
    with open('data.json','w',encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)

def __calc_filenum__(data:json,category:str,filename:str):
    index = 0
    filename = filename.split('.')[0]
    category_num = list(data.keys()).index(category)+1

    for button_name in data[category]:
        index += 1
        if filename in button_name.keys():
            return {
                'exist':True,
                'num':'{}-{:03d}.mp3'.format(category_num,index)
            }
    return {
        'exist':False,
        'num':'{}-{:03d}.mp3'.format(category_num,len(data[category])+1)
    }

def add_audio(category:str,filename:str,note:str=None):
    data = __read_data__()
    button = __calc_filenum__(data,category,filename)
    filename = filename.split('.')[0]
    if button['exist']:
        print('This button name is already exist.')
        return
    with open('temp_audio/{}.mp3'.format(filename),'rb') as file:
        audio_file = file.read()
    with open('static/audios/{}'.format(button['num']),'wb') as file:
        file.write(audio_file)

    data[category].append({filename:note})
    __write_data__(data)
    os.remove('temp_audio/{}.mp3'.format(filename))

def del_audio(category:str,filename:str):
    data = __read_data__()
    button = __calc_filenum__(data,category,filename)
    if not button['exist']:
        print('This button does not exist.')
        return
    directory = 'static/audios'
    files = [f for f in os.listdir(directory) if f.endswith('.mp3')]
    files.sort()
    try:
        match = re.match(r"(\d+)-(\d{3})\.mp3", button['num'])
        category_num,number = int(match.group(1)), int(match.group(2))
        os.remove(os.path.join(directory, button['num']))
        for filename in files:
            match = re.match(r"(\d+)-(\d{3})\.mp3", filename)
            f_type, f_number = int(match.group(1)), int(match.group(2))
            if f_type == category_num:
                if f_number > number:
                    os.rename(
                        os.path.join(directory, filename), 
                        os.path.join(directory, '{}-{:03d}.mp3'.format(f_type,f_number-1))
                    )
        del (data[category][number-1]) 
        __write_data__(data)
    except:
        print('This audio file does not exist.')

def change_audio(category:str,buttonname:str,filename:str):
    data = __read_data__()
    button = __calc_filenum__(data,category,buttonname)
    filename = filename.split('.')[0]
    with open('temp_audio/{}.mp3'.format(filename),'rb') as file:
        audio_file = file.read()
    with open('static/audios/{}'.format(button['num']),'wb') as file:
        file.write(audio_file)

add_audio('大学/選手権','考えて行動大学')