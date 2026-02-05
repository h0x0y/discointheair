from django.db import models


class Track(models.Model):
    title = models.CharField(max_length=200, verbose_name='歌曲名')
    artist = models.CharField(max_length=200, verbose_name='艺术家')
    cover = models.ImageField(upload_to='thumbnails/', verbose_name='封面图')
    audio_file = models.FileField(upload_to='music/', verbose_name='音频文件')
    duration = models.IntegerField(default=0, verbose_name='时长(秒)')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'music_tracks'
        verbose_name = '音乐'
        verbose_name_plural = '音乐库'

    def __str__(self):
        return f"{self.title} - {self.artist}"