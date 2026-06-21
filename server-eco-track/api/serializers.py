from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Activity, UserProfile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['user', 'avatar', 'bio', 'location', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


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
        user = self.context.get('user') if self.context else None
        return Activity.objects.create(
            transport_type=validated_data.get('transportType'),
            distance_km=validated_data.get('distanceKm'),
            electricity_kwh=validated_data.get('electricityKwh'),
            food_type=validated_data.get('foodType'),
            user=user,
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
