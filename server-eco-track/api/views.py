from datetime import timedelta
from decimal import Decimal

from django.db.models import Avg
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample

from .models import Activity
from .serializers import LogActivitySerializer, ActivityResponseSerializer
from .weather import get_climate_data


LOG_EXAMPLE = OpenApiExample(
    'Full Activity',
    value={
        'transportType': 'car',
        'distanceKm': 10,
        'electricityKwh': 5,
        'foodType': 'meat',
    },
    request_only=True,
)

LOG_RESPONSE_EXAMPLE = OpenApiExample(
    'Success Response',
    value={
        'success': True,
        'data': {
            'id': 'act_3475e840',
            'score': 12.5,
            'breakdown': {
                'transport': 6.0,
                'electricity': 3.5,
                'food': 3.0,
            },
            'createdAt': '2026-06-17T09:20:21Z',
        },
    },
    response_only=True,
)

STATS_RESPONSE_EXAMPLE = OpenApiExample(
    'Stats Response',
    value={
        'success': True,
        'data': {
            'userScore': 12.5,
            'communityAverage': 8.2,
            'breakdown': {
                'transport': 4.0,
                'electricity': 2.5,
                'food': 1.7,
            },
            'totalActivities': 25,
            'period': '7d',
        },
    },
    response_only=True,
)

CLIMATE_RESPONSE_EXAMPLE = OpenApiExample(
    'Climate Response',
    value={
        'success': True,
        'data': {
            'location': {
                'city': 'Nairobi',
                'country': 'Kenya',
                'lat': -1.286389,
                'lon': 36.817223,
            },
            'weather': {
                'temperature': 24,
                'condition': 'Cloudy',
                'humidity': 60,
                'windSpeed': 10,
                'timestamp': '2026-06-17T09:20:21Z',
            },
            'carbonContext': {
                'message': 'Cool weather reduces energy usage',
                'seasonalFactor': 0.9,
            },
        },
    },
    response_only=True,
)


@extend_schema(
    summary='Log daily activity',
    description='Log a daily activity and calculate carbon footprint. At least one field is required.',
    request=LogActivitySerializer,
    examples=[LOG_EXAMPLE],
    responses={201: OpenApiExample('Success', value=LOG_RESPONSE_EXAMPLE.value)},
)
@api_view(['POST'])
def log_activity(request):
    serializer = LogActivitySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    activity = serializer.save()
    return Response(
        ActivityResponseSerializer(activity).data,
        status=status.HTTP_201_CREATED,
    )


@extend_schema(
    summary='Get carbon statistics',
    description='Get carbon footprint statistics vs community average for the last 7 days.',
    responses={200: OpenApiExample('Success', value=STATS_RESPONSE_EXAMPLE.value)},
)
@api_view(['GET'])
def get_stats(request):
    period_days = 7
    since = timezone.now() - timedelta(days=period_days)
    activities = Activity.objects.filter(created_at__gte=since)

    total = activities.count()
    if total == 0:
        return Response({
            'success': True,
            'data': {
                'userScore': 0,
                'communityAverage': 0,
                'breakdown': {'transport': 0, 'electricity': 0, 'food': 0},
                'totalActivities': 0,
                'period': f'{period_days}d',
            },
        })

    latest = activities.latest('created_at')

    aggregates = activities.aggregate(
        avg_transport=Avg('breakdown_transport'),
        avg_electricity=Avg('breakdown_electricity'),
        avg_food=Avg('breakdown_food'),
        avg_total=Avg('carbon_score'),
    )

    return Response({
        'success': True,
        'data': {
            'userScore': float(latest.carbon_score),
            'communityAverage': float(aggregates['avg_total'].quantize(Decimal('0.01'))),
            'breakdown': {
                'transport': float(aggregates['avg_transport'].quantize(Decimal('0.01'))),
                'electricity': float(aggregates['avg_electricity'].quantize(Decimal('0.01'))),
                'food': float(aggregates['avg_food'].quantize(Decimal('0.01'))),
            },
            'totalActivities': total,
            'period': f'{period_days}d',
        },
    })


@extend_schema(
    summary='Get climate context',
    description='Fetch weather data and carbon context for a given location.',
    parameters=[
        OpenApiParameter(
            name='lat',
            description='Latitude',
            required=False,
            type=float,
            default=-1.286389,
        ),
        OpenApiParameter(
            name='lon',
            description='Longitude',
            required=False,
            type=float,
            default=36.817223,
        ),
    ],
    responses={200: OpenApiExample('Success', value=CLIMATE_RESPONSE_EXAMPLE.value)},
)
@api_view(['GET'])
def get_climate(request):
    lat = request.query_params.get('lat', '-1.286389')
    lon = request.query_params.get('lon', '36.817223')

    try:
        data = get_climate_data(lat, lon)
        return Response({'success': True, 'data': data})
    except Exception as e:
        return Response(
            {'success': False, 'error': str(e)},
            status=status.HTTP_502_BAD_GATEWAY,
        )
