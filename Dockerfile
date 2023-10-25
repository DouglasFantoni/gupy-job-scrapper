# Usar uma imagem base de Python 3
FROM python:3.9-slim

# Definir a pasta de trabalho dentro do contêiner
WORKDIR /app

# Copiar os arquivos necessários para o contêiner
COPY . /app

# Instalar as bibliotecas Python necessárias
RUN pip install requests python-dotenv

# Comando padrão para executar o script quando o contêiner iniciar
CMD ["python", "scrap_data.py"]
