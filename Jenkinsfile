pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_VERSION = '1.29.2'
        APP_CONTAINER_NAME = 'your-project-root_app_1'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose'
                sh 'chmod +x /usr/local/bin/docker-compose'
            }
        }

        stage('Build') {
            steps {
                sh 'docker-compose build'
            }
        }

        stage('Test') {
            steps {
                sh 'docker-compose up -d'
                sh 'sleep 30' // Wait for the application to start
                script {
                    def response = sh(script: "docker exec ${APP_CONTAINER_NAME} curl -s http://localhost:3000/items", returnStdout: true).trim()
                    echo "Response from app: ${response}"
                    if (response != '[]') {
                        error "Unexpected response from application"
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker-compose down'
                sh 'docker-compose up -d'
            }
        }
    }

    post {
        always {
            sh 'docker-compose down'
        }
        success {
            echo 'Pipeline succeeded! The application is now deployed.'
        }
        failure {
            echo 'Pipeline failed. Please check the logs for details.'
        }
    }
}