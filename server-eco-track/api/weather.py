from datetime import datetime

import pytz
import requests
from django.conf import settings


def get_climate_data(lat, lon):
    api_key = settings.WEATHER_API_KEY

    if api_key:
        url = (
            f'https://api.openweathermap.org/data/2.5/weather'
            f'?lat={lat}&lon={lon}&appid={api_key}&units=metric'
        )
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        w = resp.json()

        temp = round(w['main']['temp'])
        condition = w['weather'][0]['main']
        humidity = w['main']['humidity']
        wind_speed = round(w['wind']['speed'])
        city = w.get('name', 'Unknown')
        country = w.get('sys', {}).get('country', '')
    else:
        temp = 24
        condition = 'Cloudy'
        humidity = 60
        wind_speed = 10
        city = 'Nairobi'
        country = 'Kenya'

    if temp > 28:
        message = 'Hot weather increases cooling needs'
        factor = 1.2
    elif temp < 18:
        message = 'Cold weather increases heating needs'
        factor = 1.1
    else:
        message = 'Cool weather reduces energy usage'
        factor = 0.9

    return {
        'location': {
            'city': city,
            'country': country,
            'lat': float(lat),
            'lon': float(lon),
        },
        'weather': {
            'temperature': temp,
            'condition': condition,
            'humidity': humidity,
            'windSpeed': wind_speed,
            'timestamp': datetime.now(pytz.timezone('UTC')).strftime('%Y-%m-%dT%H:%M:%SZ'),
        },
        'carbonContext': {
            'message': message,
            'seasonalFactor': factor,
        },
    }
