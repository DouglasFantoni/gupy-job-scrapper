# Gupy Job Scraper

## Descrição

Este projeto é um web scraper projetado para buscar vagas de emprego de acordo com palavras-chave especificadas no título da vaga e na descrição. O script consulta uma API e salva os resultados em um arquivo CSV, considerando apenas vagas postadas a partir de uma data especificada.

Projeto baseado neste outro projeto: https://github.com/Paulo-z/-gupy_scrap/tree/main

## Configuração

### 1. Variáveis de ambiente

Copie o arquivo `.env,example` na raiz do projeto e modifique as váriaveis. Este arquivo deve conter as seguintes variáveis:

- `TITLE_KEYWORDS`: Palavras-chave para pesquisar no título da vaga. Exemplo: `"front end,frontend,front-end,desenvolvedor react"`.
- `DATE_START`: Data de início da pesquisa. Apenas vagas postadas a partir desta data serão consideradas. Formato: `"DD/MM/YYYY"`.
- `DESCRIPTION_REQUIRED_KEYWORDS`: Textos obrigatórios na descrição da vaga. Exemplo: `"react"`.

### 2. Docker e Docker Compose

Certifique-se de ter o Docker e o Docker Compose instalados em sua máquina.

## Uso

1. **Construa a imagem Docker**:

    ```bash
    docker-compose build
    ```

2. **Execute o scraper**:

    ```bash
    docker-compose up
    ```

Após a execução, você encontrará os resultados no arquivo `jobs.csv` na raiz do projeto.

## Observações

- Ao usar o Docker, o arquivo `jobs.csv` gerado dentro do contêiner será mapeado para o arquivo `jobs.csv` na sua máquina host, graças ao mapeamento de volume especificado no arquivo `docker-compose.yml`.

- Sempre que você fizer mudanças no seu arquivo `.env` ou no seu script, é uma boa prática reconstruir a imagem Docker usando `docker-compose build` antes de executar novamente.

Links que podem ser úteis:
API: https://portal.api.gupy.io/api/job?name=Front%20end&offset=0&limit=10000

Docs: https://developers.gupy.io/reference/authentication

## Contribuições

Sinta-se à vontade para enviar pull requests.




