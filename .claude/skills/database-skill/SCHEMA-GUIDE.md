# Database Schema Guide

The the Application backend uses a single PostgreSQL 15 database with ~55 tables.

## Supertype / Subtype Pattern
We heavily use the polymorphic pattern:
- **`party`**: The base table for any actor.
- **`person`** (inherits from party): Individual actors.
- **`organization`** (inherits from party): Companies/groups.

Specific actors inherit from `person`:
- `customer` — Individual or Company entity who books drone services
- `drone_operator` — Licensed pilot who performs services
- `field_agent` — On-ground registration agent
- `partner` — Company representative who manages customers & operators
- `employee` — Internal admin/CSR staff

A `person` can have multiple subtypes (e.g., a field agent can also be a drone operator).

## Asset Management
- **`asset`**: Base table.
- **`asset`** (inherits from asset).
- **`equipment`** (inherits from asset).

## JSON and PostGIS Columns
- We use `JSONB` for schema-less attributes like `kyc_documents`, `certifications`, `role_permissions`.
- We use `Geometry` types (via PostGIS/GeoAlchemy2) for location data.
