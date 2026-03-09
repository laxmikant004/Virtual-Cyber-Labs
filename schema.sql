
CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    role VARCHAR(20) DEFAULT 'student',

    is_verified BOOLEAN DEFAULT FALSE,

    otp_code VARCHAR(10),
    otp_expiry TIMESTAMP,

    reset_token TEXT,
    reset_token_expiry TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE tbl_networks (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL,

    bridge_name VARCHAR(50) UNIQUE NOT NULL,
    net_gateway VARCHAR(50) NOT NULL,
    net_subnet VARCHAR(50) NOT NULL,

    dc_net_name VARCHAR(100),
    lxd_net_name VARCHAR(100),

    dns_mask VARCHAR(100),

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE images (
    id SERIAL PRIMARY KEY,

    image_name VARCHAR(150) NOT NULL,
    image_type VARCHAR(20) NOT NULL,

    image_source VARCHAR(200) NOT NULL,

    os_type VARCHAR(100),

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE lab_sessions (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL,
    network_id INT,

    session_name VARCHAR(150),

    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,

    status VARCHAR(20) DEFAULT 'running',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (network_id) REFERENCES tbl_networks(id)
);
CREATE TABLE tbl_running_machine_info (

    id SERIAL PRIMARY KEY,

    session_id INT,
    user_id INT NOT NULL,

    machine_name VARCHAR(150) NOT NULL,
    instance_id VARCHAR(150) NOT NULL,

    instance_type VARCHAR(20),

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

    status VARCHAR(20) DEFAULT 'running',

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (session_id) REFERENCES lab_sessions(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX idx_running_user
ON tbl_running_machine_info(user_id);

CREATE INDEX idx_running_machine
ON tbl_running_machine_info(machine_name);

CREATE INDEX idx_network_user
ON tbl_networks(user_id);