from rest_framework import serializers
from .models import Activity


class LogActivitySerializer(serializers.Serializer):
    transportType = serializers.ChoiceField(
        choices=[c[0] for c in Activity.TRANSPORT_CHOICES],
        required=False,
        allow_null=True,
    )
    distanceKm = serializers.DecimalField(
        max_digits=10, decimal_places=3,
        required=False, allow_null=True,
    )
    electricityKwh = serializers.DecimalField(
        max_digits=10, decimal_places=3,
        required=False, allow_null=True,
    )
    foodType = serializers.ChoiceField(
        choices=[c[0] for c in Activity.FOOD_CHOICES],
        required=False,
        allow_null=True,
    )

    def validate(self, data):
        if not any([
            data.get('transportType'),
            data.get('distanceKm') is not None,
            data.get('electricityKwh') is not None,
            data.get('foodType'),
        ]):
            raise serializers.ValidationError(
                "At least one field (transportType, distanceKm, electricityKwh, foodType) is required"
            )
        return data

    def create(self, validated_data):
        return Activity.objects.create(
            transport_type=validated_data.get('transportType'),
            distance_km=validated_data.get('distanceKm'),
            electricity_kwh=validated_data.get('electricityKwh'),
            food_type=validated_data.get('foodType'),
        )


class ActivityResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'carbon_score', 'breakdown_transport',
                  'breakdown_electricity', 'breakdown_food', 'created_at']

    def to_representation(self, instance):
        return {
            'success': True,
            'data': {
                'id': instance.id,
                'score': float(instance.carbon_score),
                'breakdown': {
                    'transport': float(instance.breakdown_transport),
                    'electricity': float(instance.breakdown_electricity),
                    'food': float(instance.breakdown_food),
                },
                'createdAt': instance.created_at.strftime('%Y-%m-%dT%H:%M:%SZ'),
            },
        }
