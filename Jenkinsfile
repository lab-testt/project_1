pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_VERSION = '1.29.2'
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

        stage('Deploy and Diagnose') {
            steps {
                script {
                    sh 'docker-compose down -v'  // Ensure a clean state
                    sh 'docker-compose up -d'
                    sh 'sleep 10'  // Wait a short time for container to attempt startup

                    def containerName = sh(script: "docker-compose ps -q app", returnStdout: true).trim()
                    echo "Application container name: ${containerName}"
                    
                    if (containerName) {
                        // Check container status
                        def containerStatus = sh(script: "docker inspect -f '{{.State.Status}}' ${containerName}", returnStdout: true).trim()
                        echo "Container status: ${containerStatus}"
                        
                        // Get container logs
                        echo "Container logs:"
                        sh "docker logs ${containerName}"
                        
                        // Check exit code if container has exited
                        if (containerStatus == 'exited') {
                            def exitCode = sh(script: "docker inspect -f '{{.State.ExitCode}}' ${containerName}", returnStdout: true).trim()
                            echo "Container exit code: ${exitCode}"
                            
                            echo "Last 50 lines of container logs:"
                            sh "docker logs --tail 50 ${containerName}"
                            
                            error "Container exited with code ${exitCode}"
                        }
                    } else {
                        error "Could not find the application container"
                    }
                }
            }
        }
    }

    post {
        always {
            sh 'docker-compose down -v'
        }
        success {
            echo 'Pipeline succeeded! The application was deployed successfully.'
        }
        failure {
            echo 'Pipeline failed. Please check the logs for details.'
        }
    }
}