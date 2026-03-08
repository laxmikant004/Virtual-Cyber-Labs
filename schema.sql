CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150),
    password_hash TEXT,
    role ENUM('student','instructor','admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE tbl_networks (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    bridge_name VARCHAR(50) UNIQUE NOT NULL,
    net_gateway VARCHAR(50) NOT NULL,
    net_subnet VARCHAR(50) NOT NULL,

    dc_net_name VARCHAR(100),
    lxd_net_name VARCHAR(100),

    dns_mask VARCHAR(100),

    is_active TINYINT(1) DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE images (
    id INT AUTO_INCREMENT PRIMARY KEY,

    image_name VARCHAR(150) NOT NULL,
    image_type ENUM('docker','lxc') NOT NULL,

    image_source VARCHAR(200) NOT NULL,

    os_type VARCHAR(100),

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE lab_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,
    network_id INT,

    session_name VARCHAR(150),

    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,

    status ENUM('running','completed','expired','terminated') DEFAULT 'running',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (network_id) REFERENCES tbl_networks(id)
);
CREATE TABLE tbl_running_machine_info (

    id INT AUTO_INCREMENT PRIMARY KEY,

    session_id INT,
    user_id INT NOT NULL,

    machine_name VARCHAR(150) NOT NULL,
    instance_id VARCHAR(150) NOT NULL,

    instance_type ENUM('Docker','LXC') NOT NULL,

    instance_os_type VARCHAR(150),

    instance_mac VARCHAR(50),

    instance_ip VARCHAR(50),

    host_port INT,
    internal_port INT,

    instance_username VARCHAR(100),
    instance_password VARCHAR(100),

    instance_url TEXT,

    instance_category VARCHAR(50),

    group_id INT,
    module_id INT,

    status ENUM('running','stopped','deleted') DEFAULT 'running',

    is_active TINYINT(1) DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (session_id) REFERENCES lab_sessions(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX idx_user_id ON tbl_running_machine_info(user_id);

CREATE INDEX idx_machine_name ON tbl_running_machine_info(machine_name);

CREATE INDEX idx_network_user ON tbl_networks(user_id);