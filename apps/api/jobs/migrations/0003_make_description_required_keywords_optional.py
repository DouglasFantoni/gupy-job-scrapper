# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('jobs', '0002_rename_jobs_vacanc_publish_idx_jobs_vacanc_publish_ff8b3a_idx_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='config',
            name='description_required_keywords',
            field=models.TextField(blank=True, default='', help_text='Palavras-chave obrigatórias na descrição, separadas por vírgula'),
        ),
    ]

