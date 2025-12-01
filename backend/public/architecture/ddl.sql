CREATE TABLE "athlete"(
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "photo_path" TEXT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "updated_by" TEXT NULL,
    "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "deleted_by" TEXT NULL
);
ALTER TABLE
    "athlete" ADD PRIMARY KEY("id");
CREATE TABLE "enrollment"(
    "id" SERIAL NOT NULL,
    "id_team" BIGINT NOT NULL,
    "id_athlete" BIGINT NOT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "updated_by" TEXT NULL,
    "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "deleted_by" TEXT NULL
);
ALTER TABLE
    "enrollment" ADD PRIMARY KEY("id");
CREATE TABLE "team"(
    "id" SERIAL NOT NULL,
    "id_coach" BIGINT NOT NULL,
    "id_sport" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NULL,
    "photo_path" TEXT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "updated_by" TEXT NULL,
    "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "deleted_by" TEXT NULL
);
ALTER TABLE
    "team" ADD PRIMARY KEY("id");
CREATE TABLE "coach"(
    "id" SERIAL NOT NULL,
    "id_level" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "photo_path" TEXT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "updated_by" TEXT NULL,
    "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "deleted_by" TEXT NULL
);
ALTER TABLE
    "coach" ADD PRIMARY KEY("id");
CREATE TABLE "sport"(
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NULL,
    "photo_path" TEXT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "updated_by" TEXT NULL,
    "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "deleted_by" TEXT NULL
);
ALTER TABLE
    "sport" ADD PRIMARY KEY("id");
CREATE TABLE "type_exercise"(
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "updated_by" TEXT NULL,
    "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "deleted_by" TEXT NULL
);
ALTER TABLE
    "type_exercise" ADD PRIMARY KEY("id");
CREATE TABLE "exercise"(
    "id" SERIAL NOT NULL,
    "id_type" BIGINT NOT NULL,
    "id_sport" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "reps" INTEGER NULL,
    "sets" INTEGER NULL,
    "goal" INTEGER NULL,
    "description" TEXT NULL,
    "video_path" TEXT NULL,
    "photo_path" TEXT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "updated_by" TEXT NULL,
    "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "deleted_by" TEXT NULL
);
ALTER TABLE
    "exercise" ADD PRIMARY KEY("id");
CREATE TABLE "routine_has_exercise"(
    "id" SERIAL NOT NULL,
    "id_routine" BIGINT NOT NULL,
    "id_exercise" BIGINT NOT NULL,
    "days_of_week" VARCHAR(255) CHECK
        ("days_of_week" IN
            (
                'MONDAY',
                'TUESDAY',
                'WEDNESDAY',
                'THURSDAY',
                'FRIDAY',
                'SATURDAY',
                'SUNDAY'
            )
        ) NOT NULL,
        "start_hour" TIME(0) WITHOUT TIME ZONE NOT NULL,
        "end_hour" TIME(0) WITHOUT TIME ZONE NOT NULL,
        "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
        "created_by" TEXT NOT NULL,
        "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
        "updated_by" TEXT NULL,
        "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
        "deleted_by" TEXT NULL
);
ALTER TABLE
    "routine_has_exercise" ADD PRIMARY KEY("id");
CREATE TABLE "routine"(
    "id" SERIAL NOT NULL,
    "id_athlete" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "updated_by" TEXT NULL,
    "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "deleted_by" TEXT NULL
);
ALTER TABLE
    "routine" ADD PRIMARY KEY("id");
CREATE TABLE "level"(
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NULL,
    "photo_path" TEXT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "updated_by" TEXT NULL,
    "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "deleted_by" TEXT NULL
);
ALTER TABLE
    "level" ADD PRIMARY KEY("id");
CREATE TABLE "routine_exercise_excluded_dates"(
    "id" SERIAL NOT NULL,
    "id_routine_has_exercise" BIGINT NOT NULL,
    "excluded_date" DATE NOT NULL,
    "reason" TEXT NULL
);
ALTER TABLE
    "routine_exercise_excluded_dates" ADD PRIMARY KEY("id");
CREATE TABLE "exercise_stats"(
    "id" SERIAL NOT NULL,
    "sets" INTEGER NULL,
    "reps" INTEGER NULL,
    "goal" INTEGER NULL,
    "concluded_reps" INTEGER NULL,
    "concluded_sets" INTEGER NULL,
    "concluded_goal" INTEGER NULL,
    "start_date" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "end_date" TIMESTAMP(0) WITHOUT TIME ZONE NULL
);
ALTER TABLE
    "exercise_stats" ADD PRIMARY KEY("id");
CREATE TABLE "exercise_history"(
    "id" SERIAL NOT NULL,
    "id_exercise_stats" BIGINT NOT NULL,
    "id_routine_has_exercise" BIGINT NOT NULL,
    "status" VARCHAR(255) CHECK
        ("status" IN
            (
                'IN PROGRESS',
                'COMPLETED'
            )
        ) NOT NULL,
        "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
        "created_by" TEXT NOT NULL,
        "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
        "updated_by" TEXT NULL,
        "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
        "deleted_by" TEXT NULL
);
ALTER TABLE
    "exercise_history" ADD PRIMARY KEY("id");
CREATE TABLE "metric"(
    "id" SERIAL NOT NULL,
    "id_formula" BIGINT NULL,
    "id_coach" BIGINT NOT NULL,
    "id_sport" BIGINT NOT NULL,
    "ids_metrics" TEXT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NULL,
    "aggregated" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "updated_by" TEXT NULL,
    "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "deleted_by" BIGINT NULL
);
ALTER TABLE
    "metric" ADD PRIMARY KEY("id");
CREATE TABLE "athlete_has_metric"(
    "id" SERIAL NOT NULL,
    "id_metric" BIGINT NOT NULL,
    "id_athlete" BIGINT NOT NULL,
    "value" BIGINT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "updated_by" TEXT NULL,
    "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "deleted_by" TEXT NULL
);
ALTER TABLE
    "athlete_has_metric" ADD PRIMARY KEY("id");
CREATE TABLE "formula"(
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "updated_by" TEXT NULL,
    "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "deleted_by" TEXT NULL
);
ALTER TABLE
    "formula" ADD PRIMARY KEY("id");
ALTER TABLE
    "metric" ADD CONSTRAINT "metric_id_formula_foreign" FOREIGN KEY("id_formula") REFERENCES "formula"("id");
ALTER TABLE
    "metric" ADD CONSTRAINT "metric_id_sport_foreign" FOREIGN KEY("id_sport") REFERENCES "sport"("id");
ALTER TABLE
    "coach" ADD CONSTRAINT "coach_id_level_foreign" FOREIGN KEY("id_level") REFERENCES "level"("id");
ALTER TABLE
    "athlete_has_metric" ADD CONSTRAINT "athlete_has_metric_id_metric_foreign" FOREIGN KEY("id_metric") REFERENCES "metric"("id");
ALTER TABLE
    "exercise" ADD CONSTRAINT "exercise_id_type_foreign" FOREIGN KEY("id_type") REFERENCES "type_exercise"("id");
ALTER TABLE
    "team" ADD CONSTRAINT "team_id_sport_foreign" FOREIGN KEY("id_sport") REFERENCES "sport"("id");
ALTER TABLE
    "enrollment" ADD CONSTRAINT "enrollment_id_athlete_foreign" FOREIGN KEY("id_athlete") REFERENCES "athlete"("id");
ALTER TABLE
    "routine_exercise_excluded_dates" ADD CONSTRAINT "routine_exercise_excluded_dates_id_routine_has_exercise_foreign" FOREIGN KEY("id_routine_has_exercise") REFERENCES "routine_has_exercise"("id");
ALTER TABLE
    "routine" ADD CONSTRAINT "routine_id_athlete_foreign" FOREIGN KEY("id_athlete") REFERENCES "athlete"("id");
ALTER TABLE
    "team" ADD CONSTRAINT "team_id_coach_foreign" FOREIGN KEY("id_coach") REFERENCES "coach"("id");
ALTER TABLE
    "routine_has_exercise" ADD CONSTRAINT "routine_has_exercise_id_exercise_foreign" FOREIGN KEY("id_exercise") REFERENCES "exercise"("id");
ALTER TABLE
    "exercise_history" ADD CONSTRAINT "exercise_history_id_exercise_stats_foreign" FOREIGN KEY("id_exercise_stats") REFERENCES "exercise_stats"("id");
ALTER TABLE
    "routine_has_exercise" ADD CONSTRAINT "routine_has_exercise_id_routine_foreign" FOREIGN KEY("id_routine") REFERENCES "routine"("id");
ALTER TABLE
    "enrollment" ADD CONSTRAINT "enrollment_id_team_foreign" FOREIGN KEY("id_team") REFERENCES "team"("id");
ALTER TABLE
    "exercise" ADD CONSTRAINT "exercise_id_sport_foreign" FOREIGN KEY("id_sport") REFERENCES "sport"("id");
ALTER TABLE
    "metric" ADD CONSTRAINT "metric_id_coach_foreign" FOREIGN KEY("id_coach") REFERENCES "coach"("id");
ALTER TABLE
    "athlete_has_metric" ADD CONSTRAINT "athlete_has_metric_id_athlete_foreign" FOREIGN KEY("id_athlete") REFERENCES "athlete"("id");
ALTER TABLE
    "exercise_history" ADD CONSTRAINT "exercise_history_id_routine_has_exercise_foreign" FOREIGN KEY("id_routine_has_exercise") REFERENCES "routine_has_exercise"("id");