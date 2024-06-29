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

        stage('Deploy and Test') {
            steps {
                script {
                    sh 'docker-compose down -v'  // Ensure a clean state
                    sh 'docker-compose up -d'
                    sh 'sleep 30'  // Wait for services to start

                    def containerName = sh(script: "docker-compose ps -q app", returnStdout: true).trim()
                    echo "Application container name: ${containerName}"
                    
                    if (containerName) {
                        // Check container status
                        def containerStatus = sh(script: "docker inspect -f '{{.State.Status}}' ${containerName}", returnStdout: true).trim()
                        echo "Container status: ${containerStatus}"
                        
                        if (containerStatus != 'running') {
                            error "Container is not running. Current status: ${containerStatus}"
                        }
                        
                        // Check logs
                        echo "Container logs:"
                        sh "docker logs ${containerName}"
                        
                        // Network diagnostics
                        echo "Network diagnostics:"
                        sh "docker network ls"
                        sh "docker network inspect \$(docker network ls -q)"
                        
                        // Container network settings
                        echo "Container network settings:"
                        sh "docker inspect -f '{{json .NetworkSettings.Networks}}' ${containerName}"
                        
                        // Check if Node.js process is running
                        def isNodeRunning = sh(script: "docker exec ${containerName} pgrep -f 'node app.js'", returnStatus: true)
                        echo "Is Node.js process running? ${isNodeRunning == 0 ? 'Yes' : 'No'}"
                        
                        // Check if port 3000 is being listened on
                        def isPortListened = sh(script: "docker exec ${containerName} netstat -tuln | grep :3000", returnStatus: true)
                        echo "Is port 3000 being listened on? ${isPortListened == 0 ? 'Yes' : 'No'}"
                        
                        // Attempt to curl from within the container
                        def curlResult = sh(script: "docker exec ${containerName} curl -s http://localhost:3000/items", returnStatus: true)
                        
                        if (curlResult == 0) {
                            def response = sh(script: "docker exec ${containerName} curl -s http://localhost:3000/items", returnStdout: true).trim()
                            echo "Response from app: ${response}"
                            if (response != '[]') {
                                error "Unexpected response from application"
                            }
                        } else {
                            error "Failed to connect to the application within the container"
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
            echo 'Pipeline succeeded! The application was deployed and tested successfully.'
        }
        failure {
            echo 'Pipeline failed. Please check the logs for details.'
        }
    }
}