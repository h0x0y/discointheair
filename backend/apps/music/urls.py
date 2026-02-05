from django.urls import path
from .views import TrackListView, TrackDetailView

urlpatterns = [
    path('list/', TrackListView.as_view(), name='track-list'),
    path('<int:pk>/', TrackDetailView.as_view(), name='track-detail'),
]