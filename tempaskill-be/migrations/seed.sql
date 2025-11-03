-- ====================================
-- TempaSKill Database Seed Data
-- ====================================
-- Purpose: Populate database with sample courses and lessons for testing
-- Created: 2024-11-02
-- ====================================

-- Clear existing data (except users - preserve test accounts)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE lesson_progress;
TRUNCATE TABLE enrollments;
TRUNCATE TABLE lessons;
TRUNCATE TABLE courses;
SET FOREIGN_KEY_CHECKS = 1;

-- ====================================
-- COURSES
-- ====================================
-- Note: instructor_id references users table
-- Using existing instructor users: id=2 (Jane Instructor), id=3 (John Instructor)

INSERT INTO courses (id, title, slug, description, category, difficulty, instructor_id, price, thumbnail_url, is_published, created_at, updated_at) VALUES

-- Course 1: Pemrograman Web Modern (instructor_id=2)
(1, 
 'Pemrograman Web Modern dengan React & Next.js', 
 'pemrograman-web-modern-react-nextjs',
 'Belajar membangun aplikasi web modern menggunakan React dan Next.js dari dasar hingga mahir. Kursus ini mencakup konsep fundamental React, hooks, state management, routing, dan deployment.',
 'Web Development',
 'beginner',
 2,
 499000,
 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
 true,
 NOW(),
 NOW()),

-- Course 2: Backend API dengan Go (instructor_id=3)
(2,
 'Membangun Backend API dengan Go & Gin Framework',
 'backend-api-go-gin',
 'Pelajari cara membangun RESTful API yang scalable dan performant menggunakan bahasa Go dan Gin framework. Meliputi authentication, database, middleware, testing, dan deployment.',
 'Backend Development',
 'intermediate',
 3,
 799000,
 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800',
 true,
 NOW(),
 NOW()),

-- Course 3: UI/UX Design Fundamental (instructor_id=2)
(3,
 'Fundamental UI/UX Design untuk Developer',
 'ui-ux-design-fundamental',
 'Kuasai prinsip-prinsip desain antarmuka dan pengalaman pengguna. Belajar membuat wireframe, prototype, dan design system yang efektif untuk aplikasi modern.',
 'Design',
 'beginner',
 2,
 349000,
 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
 true,
 NOW(),
 NOW()),

-- Course 4: Database Design & SQL (instructor_id=3)
(4,
 'Database Design & SQL untuk Aplikasi Modern',
 'database-design-sql',
 'Pelajari cara merancang database yang efisien, menulis query SQL yang optimal, dan memahami konsep normalisasi, indexing, dan query optimization.',
 'Database',
 'intermediate',
 3,
 649000,
 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
 true,
 NOW(),
 NOW()),

-- Course 5: DevOps & Docker (instructor_id=2)
(5,
 'DevOps Essentials: Docker, CI/CD & Cloud Deployment',
 'devops-docker-cicd',
 'Kuasai praktik DevOps modern mulai dari containerization dengan Docker, continuous integration/deployment, infrastructure as code, hingga cloud deployment.',
 'DevOps',
 'advanced',
 2,
 899000,
 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800',
 true,
 NOW(),
 NOW());

-- ====================================
-- LESSONS - Course 1: React & Next.js (10 lessons)
-- ====================================
-- Note: Schema has is_published, not is_free
-- duration is in minutes, not duration_minutes
-- Removed video_url (not in schema)

INSERT INTO lessons (id, course_id, title, slug, content, duration, order_index, is_published, created_at, updated_at) VALUES

(1, 1, 'Pengenalan React & Next.js', 'pengenalan-react-nextjs', 
 '<h2>Selamat Datang!</h2><p>Di pelajaran ini, kamu akan mempelajari:</p><ul><li>Apa itu React dan Next.js</li><li>Mengapa menggunakan framework modern</li><li>Setup development environment</li><li>Hello World dengan Next.js</li></ul><p><strong>Target:</strong> Memahami fundamental dan setup project pertama</p>',
 45, 1, true, NOW(), NOW()),

(2, 1, 'React Components & JSX', 'react-components-jsx',
 '<h2>Memahami Components</h2><p>Topik yang akan dipelajari:</p><ul><li>Functional vs Class Components</li><li>JSX syntax dan rules</li><li>Props dan component composition</li><li>Membuat reusable components</li></ul>',
 60, 2, true, NOW(), NOW()),

(3, 1, 'State Management dengan Hooks', 'state-management-hooks',
 '<h2>React Hooks</h2><p>Materi:</p><ul><li>useState untuk state lokal</li><li>useEffect untuk side effects</li><li>useContext untuk global state</li><li>Custom hooks</li></ul>',
 75, 3, true, NOW(), NOW()),

(4, 1, 'Routing dengan Next.js', 'routing-nextjs',
 '<h2>File-based Routing</h2><p>Pelajari:</p><ul><li>Pages dan dynamic routes</li><li>Link component</li><li>useRouter hook</li><li>Route parameters</li></ul>',
 60, 4, true, NOW(), NOW()),

(5, 1, 'Data Fetching & API Integration', 'data-fetching-api',
 '<h2>Fetch Data</h2><p>Topik:</p><ul><li>getServerSideProps</li><li>getStaticProps</li><li>Client-side fetching</li><li>React Query</li></ul>',
 90, 5, true, NOW(), NOW()),

(6, 1, 'Form Handling & Validation', 'form-handling-validation',
 '<h2>Formulir Interaktif</h2><p>Materi:</p><ul><li>Controlled components</li><li>React Hook Form</li><li>Zod validation</li><li>Error handling</li></ul>',
 75, 6, true, NOW(), NOW()),

(7, 1, 'Styling dengan Tailwind CSS', 'styling-tailwind',
 '<h2>Modern CSS</h2><p>Pelajari:</p><ul><li>Utility-first CSS</li><li>Responsive design</li><li>Dark mode</li><li>Component patterns</li></ul>',
 60, 7, true, NOW(), NOW()),

(8, 1, 'Authentication & Authorization', 'authentication-authorization',
 '<h2>Keamanan Aplikasi</h2><p>Topik:</p><ul><li>JWT tokens</li><li>Protected routes</li><li>Session management</li><li>OAuth integration</li></ul>',
 90, 8, true, NOW(), NOW()),

(9, 1, 'Testing dengan Jest & Playwright', 'testing-jest-playwright',
 '<h2>Quality Assurance</h2><p>Materi:</p><ul><li>Unit testing dengan Jest</li><li>Component testing</li><li>E2E testing dengan Playwright</li><li>Test coverage</li></ul>',
 75, 9, true, NOW(), NOW()),

(10, 1, 'Deployment & Production', 'deployment-production',
 '<h2>Go Live!</h2><p>Pelajari:</p><ul><li>Build optimization</li><li>Vercel deployment</li><li>Environment variables</li><li>Performance monitoring</li></ul>',
 60, 10, true, NOW(), NOW());

-- ====================================
-- LESSONS - Course 2: Go & Gin (12 lessons)
-- ====================================

INSERT INTO lessons (id, course_id, title, slug, content, duration, order_index, is_published, created_at, updated_at) VALUES

(11, 2, 'Pengenalan Go Programming', 'pengenalan-go',
 '<h2>Welcome to Go!</h2><p>Topik:</p><ul><li>Sejarah dan filosofi Go</li><li>Setup environment</li><li>Go basics: variables, types, functions</li><li>Hello World API</li></ul>',
 60, 1, true, NOW(), NOW()),

(12, 2, 'Gin Framework Basics', 'gin-framework-basics',
 '<h2>Gin Router</h2><p>Materi:</p><ul><li>Setup Gin project</li><li>Routing dan handlers</li><li>Request/response handling</li><li>Middleware basics</li></ul>',
 75, 2, true, NOW(), NOW()),

(13, 2, 'Database Integration dengan GORM', 'database-gorm',
 '<h2>ORM di Go</h2><p>Pelajari:</p><ul><li>GORM setup</li><li>Models dan migrations</li><li>CRUD operations</li><li>Relationships</li></ul>',
 90, 3, true, NOW(), NOW()),

(14, 2, 'RESTful API Design', 'restful-api-design',
 '<h2>Best Practices API</h2><p>Topik:</p><ul><li>REST principles</li><li>HTTP methods</li><li>Status codes</li><li>API versioning</li></ul>',
 60, 4, true, NOW(), NOW()),

(15, 2, 'Authentication dengan JWT', 'authentication-jwt',
 '<h2>Secure API</h2><p>Materi:</p><ul><li>JWT tokens</li><li>Password hashing</li><li>Auth middleware</li><li>Refresh tokens</li></ul>',
 90, 5, true, NOW(), NOW()),

(16, 2, 'Validation & Error Handling', 'validation-error-handling',
 '<h2>Data Validation</h2><p>Pelajari:</p><ul><li>Request validation</li><li>Custom validators</li><li>Error responses</li><li>Structured logging</li></ul>',
 75, 6, true, NOW(), NOW()),

(17, 2, 'Middleware & Rate Limiting', 'middleware-rate-limiting',
 '<h2>Middleware Chain</h2><p>Topik:</p><ul><li>Custom middleware</li><li>CORS</li><li>Rate limiting</li><li>Request logging</li></ul>',
 60, 7, true, NOW(), NOW()),

(18, 2, 'Testing di Go', 'testing-go',
 '<h2>Go Testing</h2><p>Materi:</p><ul><li>Unit testing</li><li>Table-driven tests</li><li>Mocking</li><li>Test coverage</li></ul>',
 90, 8, true, NOW(), NOW()),

(19, 2, 'Background Jobs & Caching', 'background-jobs-caching',
 '<h2>Optimasi Performance</h2><p>Pelajari:</p><ul><li>Worker pools</li><li>Redis caching</li><li>Job queues</li><li>Performance tuning</li></ul>',
 90, 9, true, NOW(), NOW()),

(20, 2, 'API Documentation dengan Swagger', 'api-documentation-swagger',
 '<h2>Dokumentasi API</h2><p>Topik:</p><ul><li>OpenAPI specification</li><li>Swagger annotations</li><li>Interactive docs</li><li>Postman collections</li></ul>',
 60, 10, true, NOW(), NOW()),

(21, 2, 'Security Best Practices', 'security-best-practices',
 '<h2>Aplikasi Aman</h2><p>Materi:</p><ul><li>SQL injection prevention</li><li>XSS protection</li><li>CSRF tokens</li><li>Security headers</li></ul>',
 75, 11, true, NOW(), NOW()),

(22, 2, 'Deployment ke Production', 'deployment-production',
 '<h2>Go Live!</h2><p>Pelajari:</p><ul><li>Build optimization</li><li>Docker containerization</li><li>Cloud deployment (AWS/GCP)</li><li>Monitoring & logging</li></ul>',
 90, 12, true, NOW(), NOW());

-- ====================================
-- LESSONS - Course 3: UI/UX Design (8 lessons)
-- ====================================

INSERT INTO lessons (id, course_id, title, slug, content, duration, order_index, is_published, created_at, updated_at) VALUES

(23, 3, 'Fundamental UI/UX Design', 'fundamental-uiux',
 '<h2>Dasar-dasar Design</h2><p>Topik:</p><ul><li>UI vs UX</li><li>Design principles</li><li>Color theory</li><li>Typography basics</li></ul>',
 60, 1, true, NOW(), NOW()),

(24, 3, 'User Research & Personas', 'user-research-personas',
 '<h2>Memahami User</h2><p>Materi:</p><ul><li>User interviews</li><li>Surveys</li><li>Creating personas</li><li>User journey mapping</li></ul>',
 60, 2, true, NOW(), NOW()),

(25, 3, 'Wireframing & Prototyping', 'wireframing-prototyping',
 '<h2>Design Process</h2><p>Pelajari:</p><ul><li>Low-fidelity wireframes</li><li>High-fidelity mockups</li><li>Interactive prototypes</li><li>Tools: Figma, Sketch</li></ul>',
 75, 3, true, NOW(), NOW()),

(26, 3, 'Design Systems & Components', 'design-systems',
 '<h2>Konsistensi Design</h2><p>Topik:</p><ul><li>Component library</li><li>Style guides</li><li>Design tokens</li><li>Pattern libraries</li></ul>',
 60, 4, true, NOW(), NOW()),

(27, 3, 'Responsive & Mobile Design', 'responsive-mobile',
 '<h2>Multi-platform Design</h2><p>Materi:</p><ul><li>Mobile-first approach</li><li>Breakpoints</li><li>Touch interfaces</li><li>Adaptive layouts</li></ul>',
 60, 5, true, NOW(), NOW()),

(28, 3, 'Accessibility & Inclusive Design', 'accessibility',
 '<h2>Design untuk Semua</h2><p>Pelajari:</p><ul><li>WCAG guidelines</li><li>Screen readers</li><li>Color contrast</li><li>Keyboard navigation</li></ul>',
 60, 6, true, NOW(), NOW()),

(29, 3, 'Usability Testing', 'usability-testing',
 '<h2>Testing & Iteration</h2><p>Topik:</p><ul><li>Test planning</li><li>Moderated testing</li><li>A/B testing</li><li>Analytics</li></ul>',
 60, 7, true, NOW(), NOW()),

(30, 3, 'Design Handoff & Collaboration', 'design-handoff',
 '<h2>Kerja Tim</h2><p>Materi:</p><ul><li>Developer handoff</li><li>Design specs</li><li>Version control</li><li>Feedback loops</li></ul>',
 45, 8, true, NOW(), NOW());

-- ====================================
-- LESSONS - Course 4: Database & SQL (14 lessons)
-- ====================================

INSERT INTO lessons (id, course_id, title, slug, content, duration, order_index, is_published, created_at, updated_at) VALUES

(31, 4, 'Pengenalan Database & SQL', 'pengenalan-database-sql',
 '<h2>Database Basics</h2><p>Topik:</p><ul><li>RDBMS vs NoSQL</li><li>Database terminology</li><li>SQL syntax basics</li><li>MySQL setup</li></ul>',
 60, 1, true, NOW(), NOW()),

(32, 4, 'Data Types & Table Design', 'data-types-table',
 '<h2>Merancang Tabel</h2><p>Materi:</p><ul><li>Data types</li><li>Primary keys</li><li>Foreign keys</li><li>Constraints</li></ul>',
 75, 2, true, NOW(), NOW()),

(33, 4, 'CRUD Operations', 'crud-operations',
 '<h2>Basic Queries</h2><p>Pelajari:</p><ul><li>INSERT statements</li><li>SELECT queries</li><li>UPDATE data</li><li>DELETE records</li></ul>',
 60, 3, true, NOW(), NOW()),

(34, 4, 'Joins & Relationships', 'joins-relationships',
 '<h2>Relasi Tabel</h2><p>Topik:</p><ul><li>INNER JOIN</li><li>LEFT/RIGHT JOIN</li><li>Many-to-many relations</li><li>Junction tables</li></ul>',
 90, 4, true, NOW(), NOW()),

(35, 4, 'Aggregate Functions & GROUP BY', 'aggregate-functions',
 '<h2>Data Aggregation</h2><p>Materi:</p><ul><li>COUNT, SUM, AVG</li><li>GROUP BY clause</li><li>HAVING filter</li><li>Subqueries</li></ul>',
 60, 5, true, NOW(), NOW()),

(36, 4, 'Database Normalization', 'normalization',
 '<h2>Normal Forms</h2><p>Pelajari:</p><ul><li>1NF, 2NF, 3NF</li><li>Denormalization</li><li>Data redundancy</li><li>Design patterns</li></ul>',
 75, 6, true, NOW(), NOW()),

(37, 4, 'Indexes & Performance', 'indexes-performance',
 '<h2>Optimasi Query</h2><p>Topik:</p><ul><li>Index types</li><li>Query optimization</li><li>EXPLAIN analysis</li><li>Performance tuning</li></ul>',
 90, 7, true, NOW(), NOW()),

(38, 4, 'Transactions & ACID', 'transactions-acid',
 '<h2>Data Integrity</h2><p>Materi:</p><ul><li>BEGIN, COMMIT, ROLLBACK</li><li>ACID properties</li><li>Isolation levels</li><li>Deadlocks</li></ul>',
 60, 8, true, NOW(), NOW()),

(39, 4, 'Views & Stored Procedures', 'views-stored-procedures',
 '<h2>Advanced SQL</h2><p>Pelajari:</p><ul><li>CREATE VIEW</li><li>Stored procedures</li><li>Functions</li><li>Triggers</li></ul>',
 75, 9, true, NOW(), NOW()),

(40, 4, 'Security & User Management', 'security-users',
 '<h2>Database Security</h2><p>Topik:</p><ul><li>User privileges</li><li>GRANT/REVOKE</li><li>SQL injection prevention</li><li>Encryption</li></ul>',
 60, 10, true, NOW(), NOW()),

(41, 4, 'Backup & Recovery', 'backup-recovery',
 '<h2>Data Protection</h2><p>Materi:</p><ul><li>mysqldump</li><li>Point-in-time recovery</li><li>Replication</li><li>Disaster recovery</li></ul>',
 60, 11, true, NOW(), NOW()),

(42, 4, 'Database Design Patterns', 'design-patterns',
 '<h2>Best Practices</h2><p>Pelajari:</p><ul><li>Soft deletes</li><li>Audit trails</li><li>UUID vs auto-increment</li><li>Timestamps</li></ul>',
 60, 12, true, NOW(), NOW()),

(43, 4, 'NoSQL Introduction', 'nosql-intro',
 '<h2>Beyond SQL</h2><p>Topik:</p><ul><li>Document stores</li><li>MongoDB basics</li><li>When to use NoSQL</li><li>Hybrid approaches</li></ul>',
 75, 13, true, NOW(), NOW()),

(44, 4, 'Database Monitoring & Maintenance', 'monitoring-maintenance',
 '<h2>Production Database</h2><p>Materi:</p><ul><li>Query monitoring</li><li>Slow query log</li><li>Table maintenance</li><li>Scaling strategies</li></ul>',
 60, 14, true, NOW(), NOW());

-- ====================================
-- LESSONS - Course 5: DevOps (18 lessons)
-- ====================================

INSERT INTO lessons (id, course_id, title, slug, content, duration, order_index, is_published, created_at, updated_at) VALUES

(45, 5, 'Pengenalan DevOps', 'pengenalan-devops',
 '<h2>DevOps Culture</h2><p>Topik:</p><ul><li>DevOps philosophy</li><li>CI/CD overview</li><li>Infrastructure as Code</li><li>Tools ecosystem</li></ul>',
 60, 1, true, NOW(), NOW()),

(46, 5, 'Linux Fundamentals', 'linux-fundamentals',
 '<h2>Command Line Basics</h2><p>Materi:</p><ul><li>Shell navigation</li><li>File operations</li><li>Process management</li><li>Package managers</li></ul>',
 75, 2, true, NOW(), NOW()),

(47, 5, 'Git & Version Control', 'git-version-control',
 '<h2>Source Control</h2><p>Pelajari:</p><ul><li>Git basics</li><li>Branching strategies</li><li>Pull requests</li><li>Git workflows</li></ul>',
 60, 3, true, NOW(), NOW()),

(48, 5, 'Docker Basics', 'docker-basics',
 '<h2>Containerization</h2><p>Topik:</p><ul><li>Docker architecture</li><li>Images & containers</li><li>Dockerfile</li><li>Docker commands</li></ul>',
 90, 4, true, NOW(), NOW()),

(49, 5, 'Docker Compose', 'docker-compose',
 '<h2>Multi-container Apps</h2><p>Materi:</p><ul><li>docker-compose.yml</li><li>Services</li><li>Networks</li><li>Volumes</li></ul>',
 75, 5, true, NOW(), NOW()),

(50, 5, 'CI/CD dengan GitHub Actions', 'cicd-github-actions',
 '<h2>Automation Pipeline</h2><p>Pelajari:</p><ul><li>Workflows</li><li>Actions</li><li>Automated testing</li><li>Deployment automation</li></ul>',
 90, 6, true, NOW(), NOW()),

(51, 5, 'Nginx & Reverse Proxy', 'nginx-reverse-proxy',
 '<h2>Web Server</h2><p>Topik:</p><ul><li>Nginx configuration</li><li>Reverse proxy</li><li>Load balancing</li><li>SSL/TLS</li></ul>',
 60, 7, true, NOW(), NOW()),

(52, 5, 'Infrastructure as Code', 'infrastructure-as-code',
 '<h2>IaC Basics</h2><p>Materi:</p><ul><li>Terraform intro</li><li>Configuration management</li><li>Ansible basics</li><li>State management</li></ul>',
 90, 8, true, NOW(), NOW()),

(53, 5, 'Kubernetes Introduction', 'kubernetes-intro',
 '<h2>Container Orchestration</h2><p>Pelajari:</p><ul><li>K8s architecture</li><li>Pods & deployments</li><li>Services</li><li>kubectl basics</li></ul>',
 90, 9, true, NOW(), NOW()),

(54, 5, 'Monitoring dengan Prometheus', 'monitoring-prometheus',
 '<h2>Application Monitoring</h2><p>Topik:</p><ul><li>Metrics collection</li><li>Prometheus setup</li><li>Grafana dashboards</li><li>Alerting</li></ul>',
 60, 10, true, NOW(), NOW()),

(55, 5, 'Logging & Log Management', 'logging-management',
 '<h2>Centralized Logging</h2><p>Materi:</p><ul><li>ELK stack</li><li>Log aggregation</li><li>Log analysis</li><li>Debugging production</li></ul>',
 60, 11, true, NOW(), NOW()),

(56, 5, 'Cloud Computing - AWS Basics', 'aws-basics',
 '<h2>Amazon Web Services</h2><p>Pelajari:</p><ul><li>EC2 instances</li><li>S3 storage</li><li>RDS databases</li><li>IAM security</li></ul>',
 90, 12, true, NOW(), NOW()),

(57, 5, 'Cloud Computing - GCP', 'gcp-basics',
 '<h2>Google Cloud Platform</h2><p>Topik:</p><ul><li>Compute Engine</li><li>Cloud Storage</li><li>Cloud SQL</li><li>App Engine</li></ul>',
 75, 13, true, NOW(), NOW()),

(58, 5, 'Security & Secrets Management', 'security-secrets',
 '<h2>DevSecOps</h2><p>Materi:</p><ul><li>Secret managers</li><li>Environment variables</li><li>Security scanning</li><li>Vulnerability management</li></ul>',
 60, 14, true, NOW(), NOW()),

(59, 5, 'Database Migration Strategies', 'database-migrations',
 '<h2>Zero-downtime Deployment</h2><p>Pelajari:</p><ul><li>Blue-green deployment</li><li>Schema migrations</li><li>Rollback strategies</li><li>Data consistency</li></ul>',
 60, 15, true, NOW(), NOW()),

(60, 5, 'Performance Optimization', 'performance-optimization',
 '<h2>Speed Matters</h2><p>Topik:</p><ul><li>Caching strategies</li><li>CDN setup</li><li>Database optimization</li><li>Load testing</li></ul>',
 75, 16, true, NOW(), NOW()),

(61, 5, 'Disaster Recovery', 'disaster-recovery',
 '<h2>Business Continuity</h2><p>Materi:</p><ul><li>Backup strategies</li><li>RPO/RTO</li><li>Failover setup</li><li>Incident response</li></ul>',
 60, 17, true, NOW(), NOW()),

(62, 5, 'DevOps Best Practices', 'devops-best-practices',
 '<h2>Production Ready</h2><p>Pelajari:</p><ul><li>12-factor app</li><li>Continuous deployment</li><li>SRE principles</li><li>Team collaboration</li></ul>',
 60, 18, true, NOW(), NOW());

-- ====================================
-- SUCCESS MESSAGE
-- ====================================

SELECT '✓ Database seeded successfully!' AS Status;
SELECT '📊 Summary:' AS Info;
SELECT 
    (SELECT COUNT(*) FROM courses) AS 'Courses Created',
    (SELECT COUNT(*) FROM lessons) AS 'Lessons Created',
    (SELECT SUM(duration) FROM lessons) AS 'Total Lesson Duration (minutes)',
    (SELECT COUNT(*) FROM lessons WHERE is_published = true) AS 'Published Lessons';
