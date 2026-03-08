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

## FRONTEND

    npm create vite@latest frontend /*select react then typescript*/

    cd frontend /*move to the folder*/
    
    npm install /*install packages*/

    npm install -D tailwindcss@3 postcss autoprefixer /*install tailwind*/
 
    npx tailwindcss init -p /*intialize tailwind*/


## BACKEND

    mkdir backend /*make the folder*/
    
    cd backend /*move to the folder*/

    npm init -y /*initialize the npm*/

    npm install express cors dotenv pg jsonwebtoken bcrypt helmet express-rate-limit express-validator /*install dependencies*/

    npm install nodemon --save-dev /*install development tool*/

    nano .env /*make a file and add this to the file*/
        DB_USER=postgres
        DB_PASSWORD=your_password
        DB_NAME=cyberlab
        DB_HOST=localhost
        JWT_SECRET=your_key