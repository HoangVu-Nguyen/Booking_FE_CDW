pipeline {
    agent any
    
    environment {
        DOCKER_HUB_USER = "clyvasync" 
        IMAGE_NAME      = "booking-fe"
        IMAGE_TAG       = "${BUILD_NUMBER}"
        DOCKER_HUB_CRED = "docker-hub-credentials"
        
        // CẤU HÌNH CHO EC2 FRONTEND MỚI
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
                    // Tự động tải và cài đặt AWS CLI chính chủ trực tiếp bên trong vùng an toàn của Jenkins
                    sh """
                    mkdir -p /var/jenkins_home/aws-cli-bin
                    if [ ! -f /var/jenkins_home/aws-cli-bin/aws ]; then
                        echo "=== Tiến hành cấu hình bộ cài AWS CLI riêng cho Jenkins ==="
                        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
                        unzip -q awscliv2.zip || true
                        ./aws/install --install-dir /var/jenkins_home/aws-cli-src --bin-dir /var/jenkins_home/aws-cli-bin --update || true
                        rm -rf awscliv2.zip aws
                    fi
                    """

                    // Gọi SSH Agent để lấy chìa khóa .pem xác thực với Ubuntu
                    sshagent([ "${TARGET_CRED_ID}" ]) {
                        // Khai báo PATH dẫn thẳng tới thư mục chứa lệnh aws của riêng Jenkins
                        sh """
                        export PATH=/var/jenkins_home/aws-cli-bin:\$PATH
                        
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
                    sh "docker image prune -f"
                }
            }
        }
    }
}