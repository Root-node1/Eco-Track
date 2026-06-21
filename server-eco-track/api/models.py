import uuid
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='profile'
    )
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.username


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


class Activity(models.Model):
    TRANSPORT_CHOICES = [
        ('car', 'Car'),
        ('bus', 'Bus'),
        ('train', 'Train'),
        ('bike', 'Bike'),
        ('walk', 'Walk'),
    ]

    FOOD_CHOICES = [
        ('meat', 'Meat'),
        ('vegetarian', 'Vegetarian'),
        ('vegan', 'Vegan'),
    ]

    id = models.CharField(
        primary_key=True,
        max_length=20,
        editable=False,
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activities',
    )
    transport_type = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        choices=TRANSPORT_CHOICES,
    )
    distance_km = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        blank=True,
        null=True,
    )
    electricity_kwh = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        blank=True,
        null=True,
    )
    food_type = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        choices=FOOD_CHOICES,
    )
    carbon_score = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )
    breakdown_transport = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )
    breakdown_electricity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )
    breakdown_food = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.id:
            short_uuid = uuid.uuid4().hex[:8]
            self.id = f"act_{short_uuid}"
        from api.services import calculate_carbon
        scores = calculate_carbon(self)
        self.breakdown_transport = scores['transport']
        self.breakdown_electricity = scores['electricity']
        self.breakdown_food = scores['food']
        self.carbon_score = scores['total']
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.id} - {self.carbon_score}"
