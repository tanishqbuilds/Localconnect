# Advanced Database Management Systems (ADBMS) Implementation Guide
**Application: LocalConnect Civic Platform**

This document outlines how the core concepts of an Advanced Database Management Systems (ADBMS) syllabus have been structurally implemented within the PostgreSQL schema of the LocalConnect platform. The implementation logic resides in the `adbms_migration.sql` file.

---

### 1. Distributed Database Design (Fragmentation & Replication)
Distributed databases improve scalability and availability by dividing data geographically or logically. 

**Implementation:**
- **Horizontal Fragmentation**: Implemented via PostgreSQL Table Partitioning. The `complaints_partitioned` table demonstrates how records are structurally distributed across different partitions (e.g., `complaints_mumbai`, `complaints_delhi`) based on a geographic partition key (`city`). When queries demand metrics for Delhi, only the node/partition hosting Delhi’s data is hit, significantly reducing execution time.
- **Replication-friendly Tables**: Tables such as `categories` and `locations` update rarely but read often. They serve as references and can be symmetrically replicated alongside each regional data node so joind operations can be performed locally.

### 2. Query Optimization
Effective indexing strategies are critical for query optimization, minimizing system disk I/O, and CPU load.

**Implementation:**
- **B-Tree Indexing**: Created specific indexes (`idx_complaints_status`, `idx_complaints_priority`, `idx_complaints_category`, `idx_complaints_location`, `idx_complaints_created_at`) to optimize standard application views.
- **Optimized Joined Selections**: Utilizing indexed foreign keys dramatically decreases the query cost (visualized by running an `EXPLAIN ANALYZE` command on join clauses fetching users, locations, and complaints).

### 3. Advanced Access Protocols (RBAC & Discretionary Access)
Securing data at the lowest level guarantees an architecture that prevents backend exploitation.

**Implementation:**
- **Row Level Security (RLS)**: Enforced logic restricting Citizens from viewing complaints logged by others, while Officers override this scope to view all reports. 
- **Discretionary Access Control (DAC)**: Simulated structural `GRANT` and `REVOKE` DCL scripts. Defined logic to dynamically bind CRUD access rights specifically to an administrative superset (e.g., an `admin_role`), preventing Public domain exploitation.

### 4. XML and JSON Data Interoperability
Modern APIs require databases to serialize structured data inherently into JSON or XML for disparate data consumption.

**Implementation:**
- **JSON Serialization**: Configured the SQL function `export_complaint_json()` wrapped around `row_to_json()` to pack multi-table outputs into nested RESTful-ready JSON responses natively within the DB layer.
- **XML Interoperability**: Similarly, implemented `export_complaint_xml()` using native `query_to_xml()`. This enables the legacy extraction of schema records mapped to standards-compliant XML structures.

### 5. NoSQL-style Document Storage
It's often necessary to preserve unpredictable schema shapes alongside strictly relation topologies—referred to as Multi-model engineering.

**Implementation:**
- **Document Payload Configuration**: In the `complaint_activity_logs` table, the `event_data` field utilizes a `JSONB` binary data format. This acts as a NoSQL document sink logging varying analytical properties completely free of structural column constraints.
- **GIN Indexing**: Placed a Generalized Inverted Index (GIN) on the NoSQL document column, ensuring complex nested JSON paths remain queryable with sub-millisecond speeds.

### 6. Temporal Database Features
Temporal databases allow continuous historical state tracking over time without losing transitional details.

**Implementation:**
- **History Preservation Tables**: Added a `complaint_history` ledger.
- **Pl/pgSQL Triggers**: A native pre-update database trigger (`on_complaint_status_change`) tracks transitions. If an Officer shifts a complaint from "In Progress" to "Resolved," the trigger dynamically catches the state-mutation, records prior metrics onto the history ledger, and injects temporal context (the resolution time `resolved_at`) directly into the parent table autonomously.

### 7. Graph Databases & Relationships
Relationships are edge-based connections driving topological queries such as connections layers, recommendations, and mutuals.

**Implementation:**
- **Graph Traversal Patterns**: Modeled via the `follows` table (combining `follower` and `following` relationship nodes). This creates a directed graph. Example traversal paths to extract "Friends of Friends" (2nd-degree connections) highlight standard node-hopping principles using self-referencing joins.

### 8. Spatial Database Features
Geo-locational algorithms provide distance computations natively inside the database kernel.

**Implementation:**
- **Coordinate Types & Haversine formula**: Expanded `locations` with `latitude` and `longitude` numeric schemas. Added a customized `calculate_distance()` function that implements spherical trigonometry (the Haversine formula) so spatial perimeter queries like *"Find all complaints in a 5km radius"* run natively without backend application bottlenecks.
