pipeline {
    agent any
    
    environment {
        // Docker Hub credentials (stored in Jenkins credentials)
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
        DOCKER_USERNAME = 'harshwardhan19'  
        
        // Image tag - uses Jenkins build number for versioning
        IMAGE_TAG = "${BUILD_NUMBER}"
        
        // Kubernetes namespace (using default for simplicity)
        K8S_NAMESPACE = 'default'
    }
    
    stages {
        stage('Checkout Code') {
            steps {
                echo '📥 Checking out code from GitHub...'
                checkout scm
                bat 'git log -1 --pretty=format:"%%h - %%an, %%ar : %%s"'
            }
        }
        
        stage('Build Docker Images') {
            steps {
                echo '🔨 Building Docker images for all microservices...'
                script {
                    // Build all images in parallel for faster builds
                    parallel(
                        'Frontend': {
                            echo 'Building Frontend...'
                            bat """
                                docker build -t ${DOCKER_USERNAME}/frontend:${IMAGE_TAG} -t ${DOCKER_USERNAME}/frontend:latest ./Frontend
                            """
                        },
                        'Gateway': {
                            echo 'Building Gateway...'
                            bat """
                                docker build -t ${DOCKER_USERNAME}/gateway:${IMAGE_TAG} -t ${DOCKER_USERNAME}/gateway:latest ./backend-services/gateway
                            """
                        },
                        'Auth Service': {
                            echo 'Building Auth Service...'
                            bat """
                                docker build -t ${DOCKER_USERNAME}/auth-service:${IMAGE_TAG} -t ${DOCKER_USERNAME}/auth-service:latest ./backend-services/auth-service
                            """
                        },
                        'Log Service': {
                            echo 'Building Log Service...'
                            bat """
                                docker build -t ${DOCKER_USERNAME}/log-service:${IMAGE_TAG} -t ${DOCKER_USERNAME}/log-service:latest ./backend-services/log-service
                            """
                        },
                        'ML Service': {
                            echo 'Building ML Service...'
                            bat """
                                docker build -t ${DOCKER_USERNAME}/ml-service:${IMAGE_TAG} -t ${DOCKER_USERNAME}/ml-service:latest ./backend-services/ml-service
                            """
                        },
                        'ETL Service': {
                            echo 'Building ETL Service...'
                            bat """
                                docker build -t ${DOCKER_USERNAME}/etl-service:${IMAGE_TAG} -t ${DOCKER_USERNAME}/etl-service:latest ./backend-services/etl/etl-service
                            """
                        },
                        'Data Ingestion': {
                            echo 'Building Data Ingestion...'
                            bat """
                                docker build -t ${DOCKER_USERNAME}/data-ingestion:${IMAGE_TAG} -t ${DOCKER_USERNAME}/data-ingestion:latest ./backend-services/etl/data-ingestion
                            """
                        }
                    )
                }
                echo '✅ All images built successfully!'
            }
        }
        
        stage('Push Images to Docker Hub') {
            steps {
                echo '📤 Pushing images to Docker Hub...'
                script {
                    // Login to Docker Hub using credentials from Jenkins
                    docker.withRegistry('https://index.docker.io/v1/', DOCKER_CREDENTIALS_ID) {
                        // Push all images
                        bat """
                            docker push ${DOCKER_USERNAME}/frontend:${IMAGE_TAG}
                            docker push ${DOCKER_USERNAME}/frontend:latest
                            docker push ${DOCKER_USERNAME}/gateway:${IMAGE_TAG}
                            docker push ${DOCKER_USERNAME}/gateway:latest
                            docker push ${DOCKER_USERNAME}/auth-service:${IMAGE_TAG}
                            docker push ${DOCKER_USERNAME}/auth-service:latest
                            docker push ${DOCKER_USERNAME}/log-service:${IMAGE_TAG}
                            docker push ${DOCKER_USERNAME}/log-service:latest
                            docker push ${DOCKER_USERNAME}/ml-service:${IMAGE_TAG}
                            docker push ${DOCKER_USERNAME}/ml-service:latest
                            docker push ${DOCKER_USERNAME}/etl-service:${IMAGE_TAG}
                            docker push ${DOCKER_USERNAME}/etl-service:latest
                            docker push ${DOCKER_USERNAME}/data-ingestion:${IMAGE_TAG}
                            docker push ${DOCKER_USERNAME}/data-ingestion:latest
                        """
                    }
                }
                echo '✅ All images pushed to registry!'
            }
        }
        
        stage('Deploy to Minikube') {
            steps {
                echo '🚀 Deploying to Kubernetes (Minikube)...'
                script {
                    // Apply all Kubernetes manifests
                    bat """
                        kubectl apply -f K8s/frontend.yaml
                        kubectl apply -f K8s/gateway.yaml
                        kubectl apply -f K8s/auth-service.yaml
                        kubectl apply -f K8s/log-service.yaml
                        kubectl apply -f K8s/ml-service.yaml
                        kubectl apply -f K8s/etl-service.yaml
                        kubectl apply -f Pipeline/data-ingestion.yaml
                    """
                    
                    // Force rolling update to pull latest images
                    bat """
                        kubectl rollout restart deployment/frontend -n ${K8S_NAMESPACE}
                        kubectl rollout restart deployment/gateway -n ${K8S_NAMESPACE}
                        kubectl rollout restart deployment/auth-service -n ${K8S_NAMESPACE}
                        kubectl rollout restart deployment/log-service -n ${K8S_NAMESPACE}
                        kubectl rollout restart deployment/ml-service -n ${K8S_NAMESPACE}
                        kubectl rollout restart deployment/etl-service -n ${K8S_NAMESPACE}
                        kubectl rollout restart deployment/data-ingestion -n ${K8S_NAMESPACE}
                    """
                }
                echo '✅ Deployment commands executed!'
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo '🔍 Verifying deployment status...'
                script {
                    // Wait for rollouts to complete
                    bat """
                        echo Waiting for deployments to be ready...
                        kubectl rollout status deployment/frontend -n ${K8S_NAMESPACE} --timeout=5m
                        kubectl rollout status deployment/gateway -n ${K8S_NAMESPACE} --timeout=5m
                        kubectl rollout status deployment/auth-service -n ${K8S_NAMESPACE} --timeout=5m
                        kubectl rollout status deployment/log-service -n ${K8S_NAMESPACE} --timeout=5m
                        kubectl rollout status deployment/ml-service -n ${K8S_NAMESPACE} --timeout=5m
                        kubectl rollout status deployment/etl-service -n ${K8S_NAMESPACE} --timeout=5m
                        kubectl rollout status deployment/data-ingestion -n ${K8S_NAMESPACE} --timeout=5m
                    """
                    
                    // Show final status
                    bat """
                        echo === DEPLOYMENT STATUS ===
                        kubectl get deployments -n ${K8S_NAMESPACE}
                        echo === POD STATUS ===
                        kubectl get pods -n ${K8S_NAMESPACE} -o wide
                        echo === SERVICE STATUS ===
                        kubectl get services -n ${K8S_NAMESPACE}
                    """
                }
                echo '✅ Deployment verification complete!'
            }
        }
        
        stage('Health Check') {
            steps {
                echo '💊 Running health checks...'
                script {
                    // Optional: Add basic health checks
                    powershell """
                        Write-Host "Checking if all pods are running..."
                        \$pending = kubectl get pods -n ${K8S_NAMESPACE} --field-selector=status.phase!=Running --no-headers 2>`$null
                        if (\$pending) {
                            Write-Host "⚠️  Warning: Some pods are not in Running state"
                            kubectl get pods -n ${K8S_NAMESPACE} --field-selector=status.phase!=Running
                        } else {
                            Write-Host "✅ All pods are running!"
                        }
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo '🎉 Pipeline completed successfully! All services deployed to Minikube.'
            echo "Build #${BUILD_NUMBER} - SUCCESS"
            // Optional: Send notification (Slack, email, etc.)
        }
        
        failure {
            echo '❌ Pipeline failed! Check logs for details.'
            echo "Build #${BUILD_NUMBER} - FAILED"
            // Show recent pod events for debugging
            bat """
                echo === RECENT EVENTS ===
                kubectl get events -n ${K8S_NAMESPACE} --sort-by=.lastTimestamp
            """
            // Optional: Send failure notification
        }
        
        always {
            echo '🧹 Cleaning up old Docker images...'
            bat """
                docker image prune -af --filter "until=24h" || exit 0
            """
        }
    }
}
