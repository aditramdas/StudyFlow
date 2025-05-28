# MVP Build Plan: Granular, Testable Tasks

Each task below is self-contained, with a clear **Start**, **End**, and **Test** step, and focuses on exactly one concern. Hand them one at a time to your engineering LLM and verify before moving on.

---

## A. Infrastructure

1. **Add Postgres Service**

   - **Start:** `docker-compose.yml` has no Postgres block.
   - **End:** `docker-compose.yml` includes a `postgres` service; `docker-compose up -d` launches a `project-postgres` container.
   - **Test:**
     ```bash
     docker ps | grep project-postgres
     docker exec project-postgres psql -c "\l"
     ```

2. **Add Redis Service**

   - **Start:** `docker-compose.yml` has no Redis block.
   - **End:** Redis service added; `docker-compose up -d` launches `project-redis`.
   - **Test:**
     ```bash
     redis-cli -h localhost -p 6379 ping  # returns PONG
     ```

3. **Add RabbitMQ Service**

   - **Start:** No RabbitMQ in compose.
   - **End:** RabbitMQ service added; container named `project-rabbitmq` runs.
   - **Test:** Open http://localhost:15672 → management UI prompts login.

4. **Add Neo4j Service**
   - **Start:** No Neo4j in compose.
   - **End:** Neo4j service added; container named `project-neo4j` runs.
   - **Test:** Open http://localhost:7474 → see Neo4j login.

---

## B. Shared Libraries

5. **Initialize `shared/db` Package**

   - **Start:** `shared/db/` is empty.
   - **End:** `shared/db/package.json` exists and `shared/db/index.ts` exports a `connect()` stub.
   - **Test:**
     ```bash
     cd shared/db && npm install
     ```

6. **Implement Postgres Connection**

   - **Start:** `connect()` is a no-op.
   - **End:** `connect()` uses `pg` (or ORM) to connect using `PG_*` env vars.
   - **Test:** Create `shared/db/test-conn.ts` that logs “DB connected” when run.

7. **Initialize `shared/messaging` Package**

   - **Start:** `shared/messaging/` is empty.
   - **End:** `shared/messaging/package.json` exists and `shared/messaging/index.ts` exports `publish()`/`consume()` stubs.
   - **Test:**
     ```bash
     cd shared/messaging && npm install
     ```

8. **Implement RabbitMQ Client**
   - **Start:** Messaging stubs do nothing.
   - **End:** `publish(queue, msg)` and `consume(queue, handler)` use `amqplib` to connect at `MQ_URL`.
   - **Test:** Write `shared/messaging/test-mq.ts` that publishes and consumes a message.

---

## C. API Gateway

9. **Scaffold API Gateway**

   - **Start:** No gateway code.
   - **End:** Create `gateway/src/index.ts` with Express listening on port 8000.
   - **Test:**
     ```bash
     node gateway/src/index.js  # logs “Gateway listening on 8000”
     ```

10. **Proxy `/auth/*` to Auth Service**

    - **Start:** Gateway has no routes.
    - **End:** Add proxy rule: `/auth/*` → `http://localhost:3000/*`.
    - **Test:**
      ```bash
      curl http://localhost:8000/auth/health  # returns Auth’s health response
      ```

11. **Proxy `/upload` to Ingestion Service**
    - **Start:** Only auth is proxied.
    - **End:** Add proxy for `POST /upload` → `http://localhost:3001/upload`.
    - **Test:**
      ```bash
      curl -X POST http://localhost:8000/upload  # returns ingestion stub
      ```

---

## D. Auth Service

12. **Scaffold Auth Service**

    - **Start:** `backend/auth-service/` is empty.
    - **End:** `src/index.ts` spins up Express on port 3000.
    - **Test:** Service logs “Auth service running on 3000”.

13. **Add `GET /health`**

    - **Start:** No endpoints.
    - **End:** Returns `{"status":"ok"}`.
    - **Test:**
      ```bash
      curl http://localhost:3000/health
      ```

14. **Implement Login Stub**

    - **Start:** No login route.
    - **End:** `POST /auth/login` returns `{"token":"dummy"}`.
    - **Test:**
      ```bash
      curl -X POST http://localhost:3000/auth/login -d '{"username":"x","password":"y"}'
      ```

15. **Add JWT Middleware Stub**
    - **Start:** No middleware.
    - **End:** Middleware reads `Authorization` header and allows all requests through.
    - **Test:** Attach to a new `GET /protected` and call with/without header, verify logs.

---

## E. Ingestion Service

16. **Scaffold Ingestion Service**

    - **Start:** `backend/ingestion-service/` is empty.
    - **End:** `src/index.ts` starts Express on 3001.
    - **Test:** Logs “Ingestion running on 3001”.

17. **Add `GET /health`**

    - **Start:** No endpoints.
    - **End:** Returns `{"status":"ok"}`.
    - **Test:**
      ```bash
      curl http://localhost:3001/health
      ```

18. **Add `POST /upload` Stub**

    - **Start:** No upload logic.
    - **End:** Returns `{"message":"uploaded"}`.
    - **Test:**
      ```bash
      curl -X POST http://localhost:3001/upload
      ```

19. **Integrate `shared/db`**

    - **Start:** No DB usage.
    - **End:** Import and connect to Postgres on startup.
    - **Test:** On start, log “Connected to Postgres”.

20. **Save File Locally**

    - **Start:** Upload stub ignores file.
    - **End:** Use `multer` to save file to `uploads/` and return saved path in response.
    - **Test:**
      ```bash
      curl -F file=@test.pdf http://localhost:3001/upload
      ls uploads/  # contains test.pdf
      ```

21. **Insert Metadata Record**

    - **Start:** Files are saved only.
    - **End:** After saving, insert into `documents` table with fields `(id, filename, path, status, createdAt)`.
    - **Test:**
      ```sql
      SELECT * FROM documents;
      ```

22. **Publish `document.uploaded` Event**
    - **Start:** No messaging.
    - **End:** Call `publish('document.uploaded', { documentId })` after insert.
    - **Test:** Check RabbitMQ queue `document.uploaded` for a message.

---

## F. NLP Service

23. **Scaffold NLP Service**

    - **Start:** `backend/nlp-service/` is empty.
    - **End:** `server.py` with FastAPI on port 3002.
    - **Test:**
      ```bash
      uvicorn server:app  # logs “Running on 3002”
      ```

24. **Add `GET /health`**

    - **Start:** No endpoints.
    - **End:** Returns `{"status":"ok"}`.
    - **Test:**
      ```bash
      curl http://localhost:3002/health
      ```

25. **Consume `document.uploaded`**

    - **Start:** No event handling.
    - **End:** On startup, `consume('document.uploaded', handler)` logs incoming payload.
    - **Test:** Publish a test message; service logs it.

26. **Implement Simple Summarization Endpoint**

    - **Start:** No summarization.
    - **End:** `POST /nlp/summarize` reads `documentId`, fetches file path from DB, returns first 100 chars.
    - **Test:**
      ```bash
      curl -X POST http://localhost:3002/nlp/summarize -d '{"documentId":1}'
      ```

27. **Save Summary to DB**

    - **Start:** Summary returned only.
    - **End:** Insert into `summaries(documentId, text)`.
    - **Test:**
      ```sql
      SELECT * FROM summaries;
      ```

28. **Publish `nlp.completed` Event**
    - **Start:** No event emission.
    - **End:** After saving, `publish('nlp.completed', { documentId })`.
    - **Test:** Check RabbitMQ queue `nlp.completed`.

---

## G. Scheduler Service

29. **Scaffold Scheduler Service**

    - **Start:** `backend/scheduler-service/` is empty.
    - **End:** `src/index.ts` starts Express on 3003.
    - **Test:** Logs “Scheduler running on 3003”.

30. **Add `GET /health`**

    - **Start:** No endpoints.
    - **End:** Returns `{"status":"ok"}`.
    - **Test:**
      ```bash
      curl http://localhost:3003/health
      ```

31. **Setup Cron Job**

    - **Start:** No scheduling.
    - **End:** Use `node-cron` to log “Scanning due flashcards” every minute.
    - **Test:** Wait one minute; observe log.

32. **Consume `nlp.completed` & Seed Schedule**

    - **Start:** No event handling.
    - **End:** On `nlp.completed`, insert a dummy review entry into Redis sorted set `due:flashcards`.
    - **Test:** After event, `redis-cli zrange due:flashcards 0 -1`.

33. **Expose `/schedule/today`**
    - **Start:** No schedule endpoint.
    - **End:** Returns `[{ documentId, dueAt }]` from Redis.
    - **Test:**
      ```bash
      curl http://localhost:3003/schedule/today
      ```

---

## H. Analytics Service

34. **Scaffold Analytics Service**

    - **Start:** `backend/analytics-service/` is empty.
    - **End:** `src/index.ts` starts Express on 3004.
    - **Test:** Logs “Analytics running on 3004”.

35. **Add `GET /health`**

    - **Start:** No endpoints.
    - **End:** Returns `{"status":"ok"}`.
    - **Test:**
      ```bash
      curl http://localhost:3004/health
      ```

36. **Consume Study/Quiz Events**

    - **Start:** No event handling.
    - **End:** `consume('study.session', handler)` and `consume('quiz.completed', handler)` log payloads.
    - **Test:** Publish test messages; observe logs.

37. **Expose `/dashboard/metrics`**
    - **Start:** No metrics endpoint.
    - **End:** Returns static JSON matching your Performance Analytics UI.
    - **Test:**
      ```bash
      curl http://localhost:3004/dashboard/metrics
      ```

---

## I. Notification Service

38. **Scaffold Notification Service**

    - **Start:** `backend/notification-service/` is empty.
    - **End:** `src/index.ts` starts Express on port 3005.
    - **Test:** Logs “Notification running on 3005”.

39. **Add `GET /health`**

    - **Start:** No endpoints.
    - **End:** Returns `{"status":"ok"}`.
    - **Test:**
      ```bash
      curl http://localhost:3005/health
      ```

40. **Consume Reminder Events**
    - **Start:** No event handling.
    - **End:** `consume('reminder', handler)` logs “Notify user: documentId”.
    - **Test:** Publish a `reminder` event; observe log.

---

## J. Frontend Integration

41. **Configure Axios Base URL**

    - **Start:** Services are called directly on ports.
    - **End:** All Axios clients use `import.meta.env.VITE_API_BASE_URL`.
    - **Test:** Change `.env`, rebuild, verify network calls go to gateway.

42. **Test Login Flow in UI**
    - **Start:** No login UI integration.
    - **End:** Login form calls `/auth/login`, stores token in memory.
    - **Test:** Enter credentials, inspect network & console for token.

---

## K. End-to-End Verification

43. **Manual End-to-End Flow Test**
    - **Start:** All services running, no flow test.
    - **End:**
      1. Upload a PDF via the UI.
      2. Confirm ingestion, NLP, scheduler, analytics, notification logs.
      3. Verify flashcards appear in UI and metrics update.
    - **Test:** Complete steps, ensure each service log and UI element behaves as expected.

---

> **Note:** After each task passes its **Test** step, proceed to the next. This ensures incremental validation and isolates issues quickly. Good luck!
