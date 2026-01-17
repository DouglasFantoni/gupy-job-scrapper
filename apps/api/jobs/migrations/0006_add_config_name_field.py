# Generated manually

from django.db import migrations, models


def populate_name_from_title_keywords(apps, schema_editor):
    """Popula o campo name com title_keywords para registros existentes"""
    Config = apps.get_model('jobs', 'Config')
    for config in Config.objects.all():
        if not config.name:
            # Usa title_keywords como nome, limitando a 200 caracteres
            config.name = config.title_keywords[:200] if config.title_keywords else f"Busca {config.id}"
            config.save()


class Migration(migrations.Migration):

    dependencies = [
        ('jobs', '0005_config_country_config_job_types_config_state'),
    ]

    operations = [
        migrations.AddField(
            model_name='config',
            name='name',
            field=models.CharField(blank=True, null=True, help_text='Nome da busca de vagas', max_length=200),
        ),
        migrations.RunPython(populate_name_from_title_keywords, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='config',
            name='name',
            field=models.CharField(help_text='Nome da busca de vagas', max_length=200),
        ),
    ]
