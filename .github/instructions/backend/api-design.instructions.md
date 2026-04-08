```instructions
# Backend API Design Guidelines (Per-Table CRUD)

These rules define the required backend API contract for any resource that maps to a database table.

## Mandatory model contract (Pydantic `BaseModel`)

For each table/resource `X`, define exactly these Pydantic models:

- `XParameterCreate`
- `XParameterUpdate`
- `XParameterResponse`
- `XParameterDelete`

**Rules**

1. **Naming and location**
	- Place the models in `backend/models/<x>_models.py`.
	- Use English-only names for classes, fields, and docs.
	- Use consistent resource naming across code:
		- Router: `<x>_routes.py`
		- Controller: `<x>_controller.py`
		- Integration methods: `create_<x>`, `list_<x>`, `get_<x>`, `update_<x>`, `delete_<x>`

2. **Field naming**
	- Prefer `snake_case` field names matching database column names.
	- If an API field must differ from the DB column, explicitly define the mapping (aliases) and keep it consistent across Create/Update/Response.

3. **`XParameterCreate`**
	- Contains only client-provided input fields.
	- Must NOT require `id`.
	- Must NOT require audit fields like `created_at`, `updated_at`, `deleted_at`.

4. **`XParameterUpdate` (PUT-complete semantics)**
	- Must represent a **complete** update payload for `PUT /<x>/{id}`.
	- Must NOT include or require `id` (the id comes from the path).
	- Must require all fields that are non-nullable in the database (unless the API explicitly forbids editing them).
	- Nullable / optional DB columns may be optional, but the route/controller must define how omission is handled.

5. **`XParameterResponse`**
	- Represents the public API contract returned by endpoints.
	- Must include `id`.
	- Should include audit fields if the API exposes them (keep consistent across all resources):
		- `created_at`, `created_by`
		- `updated_at`, `updated_by`
		- `deleted_at`, `deleted_by` (usually nullable)

6. **`XParameterDelete` (soft delete metadata)**
	- Used to carry any server-side delete metadata (e.g. `deleted_by`).
	- Routes should not require a request body for DELETE.

## Routes (FastAPI)

For each table/resource `X`, implement a router in `backend/routes/<x>_routes.py` that follows this shape:

- `POST /<x>`
	- Body: `XParameterCreate`
	- Response: `XParameterResponse`
	- Status: `201`

- `GET /<x>`
	- Response: `list[XParameterResponse]`

- `GET /<x>/{id}`
	- Response: `XParameterResponse`

- `PUT /<x>/{id}`
	- Body: `XParameterUpdate`
	- Response: `XParameterResponse`

- `DELETE /<x>/{id}`
	- No body
	- Status: `204`

**Mandatory rules**

- Always declare `response_model` (including list endpoints) so the API contract is explicit and stable.
- Do not require `id` in request bodies for update/delete; the id must come from the path.
- Do not leak database client response objects (e.g. Supabase `.execute()` results) as route return values; return normalized data matching `XParameterResponse`.

## Controllers

Controllers (`backend/controllers/<x>_controller.py`) must:

- Accept typed inputs (`XParameterCreate`, `XParameterUpdate`) and return normalized data that matches `XParameterResponse`.
- Contain resource-specific business rules and orchestration (e.g. calling S3 helpers, enforcing invariants).
- Avoid returning raw third-party client objects.

## Integrations (Supabase)

All database operations must be implemented through an integration layer (e.g. `backend/integrations/supabase_integration.py`) following the same per-table contract.

**Per-table method set**

- `create_<x>(params: XParameterCreate) -> dict`
- `list_<x>() -> list[dict]`
- `get_<x>(id: int) -> dict | None`
- `update_<x>(id: int, params: XParameterUpdate) -> dict`
- `delete_<x>(id: int, params: XParameterDelete) -> None`

**Return contract**

- Integration methods must return normalized Python data (`dict`/`list[dict]`) ready to be validated/serialized into `XParameterResponse`.
- Do not return the raw Supabase query object or raw `.execute()` response.

## Delete standard (Soft Delete)

- All resources must implement **soft delete** as the default:
	- `delete_<x>` sets `deleted_at` and `deleted_by` (and optionally `updated_at/updated_by`).
	- `list_<x>` and `get_<x>` must exclude deleted rows by default (`deleted_at is null`).

## Exceptions

- Use-case-specific flows (e.g. auth or multi-step workflows) may define additional `*Request`/`*Response` models.
- However, any endpoint that represents CRUD for a table/resource must still follow the `XParameterCreate/Update/Response/Delete` convention and route shape above.
```
