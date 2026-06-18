import pytest
from decimal import Decimal
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

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


def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {'HTTP_AUTHORIZATION': f'Bearer {refresh.access_token}'}


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


@pytest.mark.django_db
class TestAuthAndProfile:
    def setup_method(self):
        self.client = APIClient()

    def test_register(self):
        resp = self.client.post('/api/auth/register', {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
        }, format='json')
        assert resp.status_code == 201
        data = resp.json()
        assert 'access' in data
        assert 'refresh' in data
        assert data['user']['username'] == 'testuser'

    def test_register_duplicate_username(self):
        self.client.post('/api/auth/register', {
            'username': 'testuser',
            'password': 'testpass123',
        }, format='json')
        resp = self.client.post('/api/auth/register', {
            'username': 'testuser',
            'password': 'testpass456',
        }, format='json')
        assert resp.status_code == 400

    def test_login(self):
        User.objects.create_user(username='testuser', password='testpass123')
        resp = self.client.post('/api/auth/login', {
            'username': 'testuser',
            'password': 'testpass123',
        }, format='json')
        assert resp.status_code == 200
        data = resp.json()
        assert 'access' in data
        assert 'refresh' in data

    def test_login_invalid(self):
        resp = self.client.post('/api/auth/login', {
            'username': 'nonexistent',
            'password': 'wrong',
        }, format='json')
        assert resp.status_code == 401

    def test_refresh_token(self):
        self.client.post('/api/auth/register', {
            'username': 'testuser',
            'password': 'testpass123',
        }, format='json')
        login_resp = self.client.post('/api/auth/login', {
            'username': 'testuser',
            'password': 'testpass123',
        }, format='json')
        refresh_token = login_resp.json()['refresh']
        resp = self.client.post('/api/auth/refresh', {
            'refresh': refresh_token,
        }, format='json')
        assert resp.status_code == 200
        assert 'access' in resp.json()

    def test_logout(self):
        self.client.post('/api/auth/register', {
            'username': 'testuser',
            'password': 'testpass123',
        }, format='json')
        login_resp = self.client.post('/api/auth/login', {
            'username': 'testuser',
            'password': 'testpass123',
        }, format='json')
        refresh_token = login_resp.json()['refresh']
        resp = self.client.post('/api/auth/logout', {
            'refresh': refresh_token,
        }, format='json')
        assert resp.status_code == 200

    def test_profile_get(self):
        user = User.objects.create_user(username='testuser', password='testpass123')
        headers = get_tokens(user)
        resp = self.client.get('/api/profile', **headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data['user']['username'] == 'testuser'
        assert 'bio' in data
        assert 'location' in data

    def test_profile_update(self):
        user = User.objects.create_user(username='testuser', password='testpass123')
        headers = get_tokens(user)
        resp = self.client.put('/api/profile', {
            'bio': 'Hello world',
            'location': 'Nairobi',
        }, format='json', **headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data['bio'] == 'Hello world'
        assert data['location'] == 'Nairobi'

    def test_profile_partial_update(self):
        user = User.objects.create_user(username='testuser', password='testpass123')
        headers = get_tokens(user)
        resp = self.client.patch('/api/profile', {
            'location': 'Mombasa',
        }, format='json', **headers)
        assert resp.status_code == 200
        assert resp.json()['location'] == 'Mombasa'

    def test_profile_delete(self):
        user = User.objects.create_user(username='testuser', password='testpass123')
        headers = get_tokens(user)
        resp = self.client.delete('/api/profile', **headers)
        assert resp.status_code == 204
        assert User.objects.filter(username='testuser').count() == 0

    def test_profile_unauthenticated(self):
        resp = self.client.get('/api/profile', format='json')
        assert resp.status_code == 401

    def test_register_creates_profile(self):
        resp = self.client.post('/api/auth/register', {
            'username': 'testuser',
            'password': 'testpass123',
        }, format='json')
        assert resp.status_code == 201
        user = User.objects.get(username='testuser')
        assert hasattr(user, 'profile')
        assert user.profile.bio == ''

    def test_log_unauthenticated_still_works(self):
        resp = self.client.post('/api/log', {
            'transportType': 'car', 'distanceKm': '10',
        }, format='json')
        assert resp.status_code == 201

    def test_log_with_authenticated_user(self):
        user = User.objects.create_user(username='testuser', password='testpass123')
        headers = get_tokens(user)
        resp = self.client.post('/api/log', {
            'transportType': 'car', 'distanceKm': '10',
        }, format='json', **headers)
        assert resp.status_code == 201
        activity = Activity.objects.last()
        assert activity.user == user
