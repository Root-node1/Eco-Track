from decimal import Decimal
from django.conf import settings

TRANSPORT_BASE = {
    'car': Decimal('0.6'),
    'bus': Decimal('0.3'),
    'train': Decimal('0.1'),
    'bike': Decimal('0.0'),
    'walk': Decimal('0.0'),
}

FOOD_BASE = {
    'meat': Decimal('6.0'),
    'vegetarian': Decimal('2.0'),
    'vegan': Decimal('1.5'),
}


def calculate_carbon(activity):
    transport = Decimal('0')
    if activity.transport_type and activity.distance_km is not None:
        base = TRANSPORT_BASE.get(activity.transport_type, Decimal('0'))
        transport = Decimal(str(activity.distance_km)) * base

    electricity = Decimal('0')
    if activity.electricity_kwh is not None:
        factor = Decimal(str(settings.CARBON_FACTORS['ELECTRICITY']))
        electricity = Decimal(str(activity.electricity_kwh)) * factor

    food = Decimal('0')
    if activity.food_type:
        base = FOOD_BASE.get(activity.food_type, Decimal('0'))
        factor = Decimal(str(settings.CARBON_FACTORS['FOOD']))
        food = base * factor

    transport = transport.quantize(Decimal('0.01'))
    electricity = electricity.quantize(Decimal('0.01'))
    food = food.quantize(Decimal('0.01'))

    return {
        'transport': transport,
        'electricity': electricity,
        'food': food,
        'total': (transport + electricity + food).quantize(Decimal('0.01')),
    }
