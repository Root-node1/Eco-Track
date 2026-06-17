import pytest
from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Activity
from .services import calculate_carbon


class CarbonCalculationTests(TestCase):
    def test_full_activity(self):
        activity = Activity(
            transport_type='car',
            distance_km=Decimal('10'),
            electricity_kwh=Decimal('5'),
            food_type='meat',
        )
        scores = calculate_carbon(activity)
        self.assertEqual(scores['transport'], Decimal('6.00'))
        self.assertEqual(scores['electricity'], Decimal('3.50'))
        self.assertEqual(scores['food'], Decimal('3.00'))
        self.assertEqual(scores['total'], Decimal('12.50'))

    def test_transport_only(self):
        activity = Activity(transport_type='bus', distance_km=Decimal('20'))
        scores = calculate_carbon(activity)
        self.assertEqual(scores['transport'], Decimal('6.00'))
        self.assertEqual(scores['electricity'], Decimal('0'))
        self.assertEqual(scores['food'], Decimal('0'))
        self.assertEqual(scores['total'], Decimal('6.00'))

    def test_electricity_only(self):
        activity = Activity(electricity_kwh=Decimal('10'))
        scores = calculate_carbon(activity)
        self.assertEqual(scores['transport'], Decimal('0'))
        self.assertEqual(scores['electricity'], Decimal('7.00'))
        self.assertEqual(scores['food'], Decimal('0'))
        self.assertEqual(scores['total'], Decimal('7.00'))

    def test_food_only(self):
        activity = Activity(food_type='vegan')
        scores = calculate_carbon(activity)
        self.assertEqual(scores['transport'], Decimal('0'))
        self.assertEqual(scores['electricity'], Decimal('0'))
        self.assertEqual(scores['food'], Decimal('0.75'))
        self.assertEqual(scores['total'], Decimal('0.75'))

    def test_bike_zero_emissions(self):
        activity = Activity(transport_type='bike', distance_km=Decimal('5'))
        scores = calculate_carbon(activity)
        self.assertEqual(scores['transport'], Decimal('0.00'))
        self.assertEqual(scores['total'], Decimal('0.00'))


@pytest.mark.django_db
class TestAPIEndpoints:
    def setup_method(self):
        self.client = APIClient()

    def test_log_activity_full(self):
        payload = {
            'transportType': 'car',
            'distanceKm': '10',
            'electricityKwh': '5',
            'foodType': 'meat',
        }
        resp = self.client.post('/api/log', payload, format='json')
        assert resp.status_code == 201
        data = resp.json()
        assert data['success'] is True
        assert data['data']['score'] == 12.5
        assert data['data']['breakdown']['transport'] == 6.0
        assert data['data']['breakdown']['electricity'] == 3.5
        assert data['data']['breakdown']['food'] == 3.0
        assert data['data']['id'].startswith('act_')
        assert 'createdAt' in data['data']

    def test_log_activity_partial(self):
        payload = {'transportType': 'bus', 'distanceKm': '20'}
        resp = self.client.post('/api/log', payload, format='json')
        assert resp.status_code == 201
        data = resp.json()
        assert data['data']['score'] == 6.0

    def test_log_activity_empty_fails(self):
        resp = self.client.post('/api/log', {}, format='json')
        assert resp.status_code == 400

    def test_get_stats_empty(self):
        resp = self.client.get('/api/stats')
        assert resp.status_code == 200
        data = resp.json()
        assert data['data']['totalActivities'] == 0
        assert data['data']['period'] == '7d'

    def test_get_stats_with_data(self):
        self.client.post('/api/log', {
            'transportType': 'car', 'distanceKm': '10',
        }, format='json')
        self.client.post('/api/log', {
            'electricityKwh': '5',
        }, format='json')
        resp = self.client.get('/api/stats')
        assert resp.status_code == 200
        data = resp.json()
        assert data['data']['totalActivities'] == 2
        assert data['data']['period'] == '7d'
        assert data['data']['userScore'] > 0

    def test_get_climate_default(self):
        resp = self.client.get('/api/climate')
        assert resp.status_code == 200
        data = resp.json()
        assert data['success'] is True
        assert data['data']['location']['city'] == 'Nairobi'
        assert 'weather' in data['data']
        assert 'carbonContext' in data['data']
