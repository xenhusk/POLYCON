import requests

response = requests.get('http://localhost:5001/hometeacher/student_concern_analytics')
data = response.json()

print('NLP Categories (Page 1 - Sentencing):', len(data.get('nlp_categories', {})))
print('Traditional Categories (Page 2-3 - General Terms):', len(data.get('traditional_categories', {})))
print()

print('Sample NLP Categories:')
for i, (cat, info) in enumerate(list(data.get('nlp_categories', {}).items())[:3]):
    print(f'{i+1}. {cat} ({info["count"]} concerns)')

print()
print('Sample Traditional Categories:')
for i, (cat, info) in enumerate(list(data.get('traditional_categories', {}).items())[:3]):
    print(f'{i+1}. {cat} ({info["count"]} concerns)')

print()
print('Analysis Method:', data.get('analysis_method'))
