pipeline {
    agent any
    
    environment {
        DOCKER_HUB_USER = "clyvasync" 
        
        IMAGE_NAME      = "booking-fe"
        IMAGE_TAG       = "${BUILD_NUMBER}"
        
        DOCKER_HUB_CRED = "docker-hub-credentials"
    }

    stages {
        stage('1. Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('2. Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG} ."
                }
            }
        }

        stage('3. Push Image lên Docker Hub') {
            steps {
                script {
                    // Sử dụng plugin Credentials Binding để tự động login và push bảo mật
                    withCredentials([usernamePassword(credentialsId: "${DOCKER_HUB_CRED}", passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                        // Đăng nhập vào Docker Hub
                        sh "echo \$DOCKER_PASSWORD | docker login -u \$DOCKER_USERNAME --password-stdin"
                        
                        // Đẩy image lên kho lưu trữ online
                        sh "docker push ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}"
                    }
                }
            }
        }

        stage('4. Deploy FE Container') {
            steps {
                script {
                    // Hạ container cũ
                    sh "docker stop clyvasync-fe-container || true"
                    sh "docker rm clyvasync-fe-container || true"
                    
                    // Chạy container mới từ image vừa build
                    sh "docker run -d --name clyvasync-fe-container -p 80:80 \
                        --restart unless-stopped ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }

        stage('5. Dọn dẹp') {
            steps {
                script {
                    // Xóa bớt các image trung gian để tránh đầy ổ cứng EC2
                    sh "docker image prune -f"
                }
            }
        }
    }
}