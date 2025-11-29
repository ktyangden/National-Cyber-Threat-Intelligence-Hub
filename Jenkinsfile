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
                echo 'Checking out code from GitHub...'
                checkout scm
                bat 'git log -1 --pretty=format:"%%h - %%an, %%ar : %%s"'
            }
        }
        
        stage('Build Docker Images') {
            steps {
                echo 'Building Docker images in Minikube Docker daemon...'
                script {
                    // Build all images in Minikube's Docker (sequential to maintain env)
                    powershell """
                        Write-Host "Configuring Docker to use Minikube daemon..."
                        & minikube -p project docker-env | Invoke-Expression
                        
                        Write-Host "Building all images..."
                        docker build -t ${env.DOCKER_USERNAME}/frontend:${env.IMAGE_TAG} -t ${env.DOCKER_USERNAME}/frontend:latest ./Frontend
                        docker build -t ${env.DOCKER_USERNAME}/gateway:${env.IMAGE_TAG} -t ${env.DOCKER_USERNAME}/gateway:latest ./backend-services/gateway
                        docker build -t ${env.DOCKER_USERNAME}/auth-service:${env.IMAGE_TAG} -t ${env.DOCKER_USERNAME}/auth-service:latest ./backend-services/auth-service
                        docker build -t ${env.DOCKER_USERNAME}/log-service:${env.IMAGE_TAG} -t ${env.DOCKER_USERNAME}/log-service:latest ./backend-services/log-service
                        docker build -t ${env.DOCKER_USERNAME}/ml-service:${env.IMAGE_TAG} -t ${env.DOCKER_USERNAME}/ml-service:latest ./backend-services/ml-service
                        docker build -t ${env.DOCKER_USERNAME}/etl-service:${env.IMAGE_TAG} -t ${env.DOCKER_USERNAME}/etl-service:latest ./backend-services/etl/etl-service
                        docker build -t ${env.DOCKER_USERNAME}/data-ingestion:${env.IMAGE_TAG} -t ${env.DOCKER_USERNAME}/data-ingestion:latest ./backend-services/etl/data-ingestion
                        
                        Write-Host "All images built in Minikube!"
                        docker images | Select-String harshwardhan19
                        minikube -p project image load harshwardhan19/auth-service:${IMAGE_TAG}
                        minikube -p project image load harshwardhan19/log-service:${IMAGE_TAG}
                        minikube -p project image load harshwardhan19/ml-service:${IMAGE_TAG}
                        minikube -p project image load harshwardhan19/etl-service:${IMAGE_TAG}
                        minikube -p project image load harshwardhan19/data-ingestion:${IMAGE_TAG}
                        
                        minikube -p project image load harshwardhan19/frontend:latest
                        minikube -p project image load harshwardhan19/gateway:latest
                        minikube -p project image load harshwardhan19/auth-service:latest
                        minikube -p project image load harshwardhan19/log-service:latest
                        minikube -p project image load harshwardhan19/ml-service:latest
                        minikube -p project image load harshwardhan19/etl-service:latest
                        minikube -p project image load harshwardhan19/data-ingestion:latest
                    """
                }
                echo 'All images loaded into Minikube!'
            }
        }
        
        stage('Deploy to Minikube') {
            steps {
                echo 'Deploying to Kubernetes (Minikube)...'
                script {
                    // Set kubeconfig path
                    def kubeconfigPath = 'C:\\ProgramData\\Jenkins\\.jenkins\\.kube\\config'
                    
                    // Apply all Kubernetes manifests
                    bat """
                        kubectl --kubeconfig="${kubeconfigPath}" apply -f K8s/frontend.yaml --validate=false
                        kubectl --kubeconfig="${kubeconfigPath}" apply -f K8s/gateway.yaml --validate=false
                        kubectl --kubeconfig="${kubeconfigPath}" apply -f K8s/auth-service.yaml --validate=false
                        kubectl --kubeconfig="${kubeconfigPath}" apply -f K8s/log-service.yaml --validate=false
                        kubectl --kubeconfig="${kubeconfigPath}" apply -f K8s/ml-service.yaml --validate=false
                        kubectl --kubeconfig="${kubeconfigPath}" apply -f K8s/etl-service.yaml --validate=false
                        kubectl --kubeconfig="${kubeconfigPath}" apply -f Pipeline/data-ingestion.yaml --validate=false
                    """
                    
                    // Force rolling update to pull latest images
                    bat """
                        kubectl --kubeconfig="${kubeconfigPath}" rollout restart deployment/frontend -n ${K8S_NAMESPACE}
                        kubectl --kubeconfig="${kubeconfigPath}" rollout restart deployment/gateway -n ${K8S_NAMESPACE}
                        kubectl --kubeconfig="${kubeconfigPath}" rollout restart deployment/auth-service -n ${K8S_NAMESPACE}
                        kubectl --kubeconfig="${kubeconfigPath}" rollout restart deployment/log-service -n ${K8S_NAMESPACE}
                        kubectl --kubeconfig="${kubeconfigPath}" rollout restart deployment/ml-service -n ${K8S_NAMESPACE}
                        kubectl --kubeconfig="${kubeconfigPath}" rollout restart deployment/etl-service -n ${K8S_NAMESPACE}
                        kubectl --kubeconfig="${kubeconfigPath}" rollout restart deployment/data-ingestion -n ${K8S_NAMESPACE}
                    """
                }
                echo 'Deployment commands executed!'
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo 'Verifying deployment status...'
                script {
                    def kubeconfigPath = 'C:\\ProgramData\\Jenkins\\.jenkins\\.kube\\config'
                    
                    // Wait for rollouts to complete
                    bat """
                        echo Waiting for deployments to be ready...
                        kubectl --kubeconfig="${kubeconfigPath}" rollout status deployment/frontend -n ${K8S_NAMESPACE} --timeout=5m
                        kubectl --kubeconfig="${kubeconfigPath}" rollout status deployment/gateway -n ${K8S_NAMESPACE} --timeout=5m
                        kubectl --kubeconfig="${kubeconfigPath}" rollout status deployment/auth-service -n ${K8S_NAMESPACE} --timeout=5m
                        kubectl --kubeconfig="${kubeconfigPath}" rollout status deployment/log-service -n ${K8S_NAMESPACE} --timeout=5m
                        kubectl --kubeconfig="${kubeconfigPath}" rollout status deployment/ml-service -n ${K8S_NAMESPACE} --timeout=5m
                        kubectl --kubeconfig="${kubeconfigPath}" rollout status deployment/etl-service -n ${K8S_NAMESPACE} --timeout=5m
                        kubectl --kubeconfig="${kubeconfigPath}" rollout status deployment/data-ingestion -n ${K8S_NAMESPACE} --timeout=5m
                    """
                    
                    // Show final status
                    bat """
                        echo === DEPLOYMENT STATUS ===
                        kubectl --kubeconfig="${kubeconfigPath}" get deployments -n ${K8S_NAMESPACE}
                        echo === POD STATUS ===
                        kubectl --kubeconfig="${kubeconfigPath}" get pods -n ${K8S_NAMESPACE} -o wide
                        echo === SERVICE STATUS ===
                        kubectl --kubeconfig="${kubeconfigPath}" get services -n ${K8S_NAMESPACE}
                    """
                }
                echo 'Deployment verification complete!'
            }
        }
        
        stage('Health Check') {
            steps {
                echo 'Running health checks...'
                script {
                    def kubeconfigPath = 'C:\\ProgramData\\Jenkins\\.jenkins\\.kube\\config'
                    // Optional: Add basic health checks
                    bat """
                        echo Checking if all pods are running...
                        kubectl --kubeconfig="${kubeconfigPath}" get pods -n ${K8S_NAMESPACE}
                        echo Health check complete!
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully! All services deployed to Minikube.'
            echo "Build #${BUILD_NUMBER} - SUCCESS"
            // Optional: Send notification (Slack, email, etc.)
        }
        
        failure {
            echo 'Pipeline failed! Check logs for details.'
            echo "Build #${BUILD_NUMBER} - FAILED"
            // Show recent pod events for debugging
            bat """
                echo === RECENT EVENTS ===
                kubectl --kubeconfig="C:\\ProgramData\\Jenkins\\.jenkins\\.kube\\config" get events -n ${K8S_NAMESPACE} --sort-by=.lastTimestamp
            """
            // Optional: Send failure notification
        }
        
        always {
            echo 'Cleaning up old Docker images...'
            bat """
                docker image prune -af --filter "until=24h" || exit 0
            """
        }
    }
}
