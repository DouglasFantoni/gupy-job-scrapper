# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('jobs', '0003_make_description_required_keywords_optional'),
    ]

    operations = [
        migrations.AlterField(
            model_name='config',
            name='date_start',
            field=models.DateField(blank=True, help_text='Data mínima de publicação das vagas', null=True),
        ),
    ]

