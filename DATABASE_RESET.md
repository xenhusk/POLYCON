# Database Data Reset Guide for Polycon Production

This guide provides a step-by-step process to safely and efficiently clear all application-specific data from the `polycon_9qxs` PostgreSQL database hosted on Render, while preserving the database schema (tables, relationships, and sequences).

---

**🚨 CRITICAL WARNINGS & CONSIDERATIONS 🚨**

* **PRODUCTION DATABASE:** This process is intended for your **LIVE PRODUCTION DATABASE**. Proceed with extreme caution.
* **DATA DELETION:** This will permanently **DELETE ALL APPLICATION DATA** from your database tables. There is **NO UNDO** without a proper backup.
* **SCHEMA PRESERVATION:** Only the data is removed. Table structures, foreign key constraints, indexes, and sequences (for auto-incrementing IDs) will remain intact and will be reset to their initial state.
* **ALEMBIC SAFETY:** The `alembic_version` table, used for database migrations, will be explicitly excluded from truncation to preserve your migration history.
* **BACKUP IS NON-NEGOTIABLE:** **ALWAYS perform a full database backup immediately before attempting this procedure.**

---

## Prerequisites

* **`psql` client:** Ensure you have the PostgreSQL command-line client (`psql`) installed on your local machine.
* **Database Credentials:** You will need the full connection string for your Render database:
    * **URL:** `postgresql://polycon_user:7uIhkAbmDQhPuNZ73GSleiogdEsMxbyc@dpg-d20fdv2li9vc739vsidg-a.singapore-postgres.render.com/polycon_9qxs`
    * **Host:** `dpg-d20fdv2li9vc739vsidg-a.singapore-postgres.render.com`
    * **User:** `polycon_user`
    * **Password:** `7uIhkAbmDQhPuNZ73GSleiogdEsMxbyc`
    * **Database:** `polycon_9qxs`

---

## Step-by-Step Data Reset Process

### Step 1: 💾 Create a Full Database Backup (CRITICAL!) 💾

Before performing any data deletion, create a complete backup of your production database.

1.  **Open your terminal** (do NOT enter `psql` yet).
2.  **Execute the `pg_dump` command:**

    ```bash
    pg_dump -h dpg-d20fdv2li9vc739vsidg-a.singapore-postgres.render.com -U polycon_user -d polycon_9qxs -W > polycon_9qxs_backup_20250729_1826.sql
    ```
    * Replace `20250729_1826` with the current date and time (e.g., `YYYYMMDD_HHMM`) to create a unique backup file name.
    * You will be prompted to enter the database password (`7uIhkAbmDQhPuNZ73GSleiogdEsMxbyc`).
3.  **Verify the backup:**
    * Ensure the `polycon_9qxs_backup_YYYYMMDD_HHMM.sql` file was created.
    * Check its size to confirm it's not empty.

### Step 2: 🔌 Connect to the Production Database 🔌

1.  **Open your terminal.**
2.  **Execute the `psql` command to connect:**

    ```bash
    psql "postgresql://polycon_user:7uIhkAbmDQhPuNZ73GSleiogdEsMxbyc@dpg-d20fdv2li9vc739vsidg-a.singapore-postgres.render.com/polycon_9qxs"
    ```
3.  Upon successful connection, your terminal prompt will change to `polycon_9qxs=#`. This confirms you are now connected to the production database. **Proceed with extreme caution from this point.**

### Step 3: 🧐 Identify Application Tables 🧐

It's good practice to list all tables to confirm which ones will be affected.

1.  At the `polycon_9qxs=#` prompt, type:

    ```sql
    \dt
    ```
    This will list all tables in the `public` schema. You should see tables like `bookings`, `users`, `students`, `alembic_version`, etc.

### Step 4: 🗑️ Generate and Execute TRUNCATE Commands 🗑️

We will use `TRUNCATE TABLE ... RESTART IDENTITY CASCADE;` for efficient data removal. The `RESTART IDENTITY` clause resets auto-incrementing sequences, and `CASCADE` automatically handles foreign key dependencies by truncating related tables. We will explicitly exclude `alembic_version`.

1.  **Generate the `TRUNCATE` commands:**
    Copy and paste the following `SELECT` statement into your `polycon_9qxs=#` prompt and press Enter:

    ```sql
    SELECT 'TRUNCATE TABLE ' || quote_ident(tablename) || ' RESTART IDENTITY CASCADE;'
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename != 'alembic_version';
    ```
    This command will output a list of `TRUNCATE TABLE` statements, one for each application table.

2.  **Execute the generated `TRUNCATE` commands:**
    **Carefully copy only the `TRUNCATE TABLE ... CASCADE;` lines** from the output of the previous `SELECT` query. Do not copy the `?column?` header or the `(XX rows)` footer.

    Paste **all copied lines** directly into your `polycon_9qxs=#` prompt and press Enter.

    * For each command, you will see `TRUNCATE TABLE` indicating success.
    * You may also see `NOTICE: truncate cascades to table "..."` messages. These are normal and confirm that related data is being cleared due to foreign key constraints.

### Step 5: ✅ Verify Data Deletion ✅

After executing all the `TRUNCATE` commands, verify that your tables are empty.

1.  At the `polycon_9qxs=#` prompt, run `SELECT COUNT(*)` for several (or all) application tables:

    ```sql
    SELECT COUNT(*) FROM bookings;
    SELECT COUNT(*) FROM users;
    SELECT COUNT(*) FROM notifications;
    SELECT COUNT(*) FROM semesters;
    SELECT COUNT(*) FROM grades;
    SELECT COUNT(*) FROM departments;
    SELECT COUNT(*) FROM faculty;
    SELECT COUNT(*) FROM programs;
    SELECT COUNT(*) FROM students;
    SELECT COUNT(*) FROM consultation_sessions;
    SELECT COUNT(*) FROM courses;
    ```
    * **Expected Result:** All these queries should return `0` for the `count`.

2.  **Confirm `alembic_version` was unaffected:**

    ```sql
    SELECT COUNT(*) FROM alembic_version;
    ```
    * **Expected Result:** This should return its original row count (typically `1`), not `0`.

### Step 6: 🚪 Disconnect from the Database 🚪

Once you've verified that all application data has been successfully cleared and the schema remains intact:

1.  At the `polycon_9qxs=#` prompt, type:

    ```sql
    \q
    ```

You have now successfully reset the data in your `polycon_9qxs` production database.

---