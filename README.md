## React Frontend News APP  - Docker Setup Guide

This guide provides step-by-step instructions to run the React Frontend project in a Docker environment.

## Prerequisites

Before you begin, ensure that you have the following installed on your machine:

 - Docker: [Install Docker](https://docs.docker.com/get-docker/).
 - Docker Compose: [Install Docker Compose](https://docs.docker.com/compose/install/).


This project is dockerized with Dockerfile and  docker-compose.yml.

### Steps

- Clone the repository:

    ```
        git clone https://github.com/deepaklaller1988/react-news-app.git
        cd react-news-app

    ```

- Open Terminal and navigate to project root directory.

- Make sure your **Docker Desktop** is running.

- To Run the project in background use this command:

    ```
     docker-compose up -d --build

    ```


- Once everything is good then you can access the project.

 - React Frontend: [http://localhost:3000](http://localhost:3000).



- To stop and remove containers use this command:

    ```
     docker-compose down

    ```



### Used DataSource

I have used this 3 DataSource.

- NewsAPI.org
- NewsAPI.ai
- The New York Times