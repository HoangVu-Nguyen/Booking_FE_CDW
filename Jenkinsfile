pipeline {
    agent any
    
    environment {
        DOCKER_HUB_USER = "clyvasync" 
        IMAGE_NAME      = "booking-fe"
        IMAGE_TAG       = "${BUILD_NUMBER}"
        DOCKER_HUB_CRED = "docker-hub-credentials"
        
        // CẤU HÌNH CHO EC2 FRONTEND MỚI (Đã điền đúng ID thật của bạn)
        TARGET_HOST     = "i-0b0f57367fe1bbcd8" 
        TARGET_CRED_ID  = "ec2-new-fe-key"       
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
                    // Ép Docker luôn build mới từ đầu, tránh kẹt cache bản lỗi cũ
                    sh "docker build --no-cache -t ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG} ."
                }
            }
        }

        stage('3. Push Image lên Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: "${DOCKER_HUB_CRED}", passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                        sh "echo \$DOCKER_PASSWORD | docker login -u \$DOCKER_USERNAME --password-stdin"
                        sh "docker push ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}"
                    }
                }
            }
        }

        stage('4. Deploy FE sang EC2 Mới Qua Ống Ngầm') {
            steps {
                script {
                    // Sử dụng khóa private key để xác thực danh tính với Ubuntu
                    sshagent([ "${TARGET_CRED_ID}" ]) {
                        // Bổ sung ProxyCommand để ép lệnh SSH chui qua ống ngầm AWS SSM, bỏ qua việc tìm Port 22 truyền thống
                        sh """
                        ssh -o StrictHostKeyChecking=no \
                            -o ProxyCommand="aws ssm start-session --target %h --document-name AWS-StartSSHSession --parameters portNumber=%p" \
                            ubuntu@${TARGET_HOST} '
                            
                            # Tải Image mới từ Docker Hub về con EC2 Frontend mới
                            sudo docker pull ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}
                            
                            # Hạ container cũ trên máy mới nếu đang chạy
                            sudo docker stop clyvasync-fe-container || true
                            sudo docker rm clyvasync-fe-container || true
                            
                            # Khởi chạy container Frontend mới trên Port 80 máy mới
                            sudo docker run -d --name clyvasync-fe-container -p 80:80 \\
                                --restart unless-stopped ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}
                                
                            # Dọn dẹp image cũ trên máy mới để tránh đầy ổ cứng
                            sudo docker image prune -f
                        '
                        """
                    }
                }
            }
        }

        stage('5. Dọn dẹp máy Jenkins') {
            steps {
                script {
                    // Xóa bớt các image trung gian trên con EC2 cũ (máy chạy Jenkins) để giải phóng không gian
                    sh "docker image prune -f"
                }
            }
        }
    }
}