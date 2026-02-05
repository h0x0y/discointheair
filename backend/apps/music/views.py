# apps/music/views.py
from rest_framework import generics
from .models import Track
from .serializers import TrackSerializer

class TrackListView(generics.ListAPIView):
    queryset = Track.objects.all().order_by('created_at')
    serializer_class = TrackSerializer

class TrackDetailView(generics.RetrieveAPIView):
    queryset = Track.objects.all()
    serializer_class = TrackSerializer