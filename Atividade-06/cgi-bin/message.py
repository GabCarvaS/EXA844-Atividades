import cgi
import json
import datetime
import sys
from urllib.parse import parse_qs

data = sys.stdin.read()
fields = parse_qs(data)

message = fields['message'][0]
author = fields['author'][0]

try:
    # Abrir o arquivo JSON
    with open('messages.json', 'r', encoding="utf-8") as f:
        data = json.load(f)

    # Se o campo messages não estiver presente ou estiver vazio, crie uma nova lista
    if 'messages' not in data or len(data['messages']) == 0:
        data = {'messages': []}

except FileNotFoundError:
    # Se o arquivo não existir, crie uma nova lista
    data = {'messages': []}

# Adicionar a nova mensagem ao dicionário
new_message = {
    'author': author,
    'message': message,
    'timestamp': str(datetime.datetime.now())
}
data['messages'].append(new_message)

# Salvar o arquivo JSON atualizado
with open('messages.json', 'w', encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

print("Content-type: text/plain\n")
print("Message saved successfully")
