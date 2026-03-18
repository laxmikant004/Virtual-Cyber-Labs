# Virtual-Cyber-Labs
	
### AIM

To design and implement a web-based virtual cyber laboratory that allows students to perform practical cybersecurity experiments and gain hands-on experience with real-world security tools, attack simulations, and defensive techniques.


### GOAL

To develop a web-based virtual cyber laboratory that provides students with a safe, scalable, and interactive environment with isolated lab instances, enabling them to perform practical cybersecurity experiments and gain hands-on experience with real-world security tools, attack simulations, and defensive techniques.

### OBJECTIVE

-**Provide Practical Learning Environment**
    
    Create an online platform where students can perform cybersecurity experiments without needing complex local setups.

-**Enable Hands-on Experience with Security Tools**
    
    Allow students to use industry-standard cybersecurity tools for tasks such as penetration testing, vulnerability analysis, and network monitoring.

-**Simulate Real-World Cyber Attacks and Defenses**
    
    Design controlled attack scenarios and defense exercises to help students understand real cyber threats and mitigation strategies.

-**Ensure Secure and Isolated Lab Environments**
    
    Use containerization or virtualization technologies to provide isolated lab environments for each student to safely execute experiments.

-**Support Scalable Multi-User Access**
    
    Develop the system to support multiple students simultaneously while maintaining performance and reliability.

-**Automate Lab Deployment and Management**
    
    Implement backend automation to dynamically create, manage, and terminate lab environments when students start or finish experiments.

-**Enhance Cybersecurity Skills and Awareness**
    
    Help students build practical cybersecurity skills and improve their understanding of modern security challenges.


### TOOLS

- Operating system -- Ubuntu 22.04
- Virtualization - Docker,LXC/LXD
- Frontend -- React + Typescript + Tailwind
- Backend -- Node.js + Express
- Automation -- Python
- Database -- Postgres
- Task Queue/Caching -- Redis
- Remote Access -- NoVnc

### SETUP

## TOOLS SETUP {only for Ubuntu OS}


 #### LXC/LXD setup
    sudo apt install lxd -y

    sudo lxd init

    Would you like to use LXD clustering? (yes/no) [default=no]: /*Enter*/

    Do you want to configure a new storage pool? (yes/no) [default=yes]: /*Enter*/
    
    Name of the new storage pool [default=default]: /*Enter*/
    
    Name of the storage backend to use (cephobject, dir, lvm, zfs, btrfs, ceph) [default=zfs]: /*Enter*/
    
    Create a new ZFS pool? (yes/no) [default=yes]: /*Enter*/
    
    Would you like to use an existing empty block device (e.g. a disk or partition)? (yes/no) [default=no]: /*Enter*/
    
    Size in GiB of the new loop device (1GiB minimum) [default=30GiB]: 50 /*type 50 & Enter*/
    
    Would you like to connect to a MAAS server? (yes/no) [default=no]: /*Enter*/
    
    Would you like to create a new local network bridge? (yes/no) [default=yes]: no /*type no & Enter*/
    
    Would you like to configure LXD to use an existing bridge or host interface? (yes/no) [default=no]: /*Enter*/
    
    Would you like the LXD server to be available over the network? (yes/no) [default=no]: yes /*type yes & Enter*/
    
    Address to bind LXD to (not including port) [default=all]:  /*Enter*/
    
    Port to bind LXD to [default=8443]: /*Enter*/
    
    Would you like stale cached images to be updated automatically? (yes/no) [default=yes]: /*Enter*/
    
    Would you like a YAML "lxd init" preseed to be printed? (yes/no) [default=no]: /*Enter*/

 #### Docker setup
    sudo apt install ca-certificates curl gnupg lsb-release -y
    
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
    sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

    echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt update
    sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
 
    sudo systemctl start docker
    sudo systemctl enable docker
 #### Redis setup
    sudo apt install redis-server
    sudo systemctl enable redis
    sudo systemctl start redis

 #### Node.js {Required for React + Express}
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install nodejs -y

 #### Python
    sudo apt install python3 python3-pip python3-venv -y
 #### Postgres SQL
    sudo apt install postgresql postgresql-contrib -y

    sudo systemctl start postgresql
    sudo systemctl enable postgresql
   
## FRONTEND {REACT}

    npm create vite@latest frontend /*select react then typescript*/

    cd frontend /*move to the folder*/
    
    npm install axios react-router-dom install lucide-react/*install packages*/

    npm install -D tailwindcss@3 postcss autoprefixer /*install tailwind*/
 
    npx tailwindcss init -p /*intialize tailwind*/


## BACKEND {NODE.JS}

    mkdir backend /*make the folder*/
    
    cd backend /*move to the folder*/

    npm init -y /*initialize the npm*/

    npm install express cors dotenv pg jsonwebtoken bcrypt helmet express-rate-limit express-validator nodemailer cookie-parser speakeasy ioredis /*install dependencies*/

    npm install nodemon --save-dev /*install development tool*/

    nano .env /*make a file and add this to the file*/
        DB_USER=postgres
        DB_PASSWORD=your_password
        DB_NAME=cyberlab
        DB_HOST=localhost
        JWT_SECRET=your_key
        EMAIL_USER=your_email@gmail.com
        EMAIL_PASS=your_app_password

## BACKEND 2 {PYTHON}
    
    nano .gitignore

    venv/
    .env
    __pycache__/
    logs/
    *.pyc

    python3 -m venv venv

    source venv/bin/activate

    nano requirements.txt

    psycopg2-binary /*add to requriments.txt*/
    redis
    PyYAML
    python-dotenv

    pip install -r requirements.txt

    nano .env

    DB_HOST=localhost /*add .env*/
    DB_PORT=5432
    DB_NAME=cyberlab
    DB_USER=postgres
    DB_PASSWORD=yourpassword

    REDIS_HOST=localhost
    REDIS_PORT=6379
    REDIS_DB=0

    sudo visudo

    laxmikant ALL=(ALL) NOPASSWD: /home/laxmikant/Virtual-Cyber-Labs/backend2/venv/bin/python /home/laxmikant/Virtual-Cyber-Labs/backend2/scripts/create_user_bridges.py *create_user_bridges.py *