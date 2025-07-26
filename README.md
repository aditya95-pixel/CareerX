# CareerX Documentation

Okay, here's the explanation of your Prisma schema file in a Markdown format suitable for project documentation.

-----
## Why PostgreSQL and Prisma ORM?

**PostgreSQL** (often abbreviated as Postgres) is an open-source, powerful, and highly reliable relational database management system (RDBMS).

Key Features:
- Uses SQL (Structured Query Language).
- Supports ACID transactions (Atomicity, Consistency, Isolation, Durability).
- Supports complex queries, indexes, foreign keys, triggers, and stored procedures.
- Extensible – allows users to define custom data types, functions, etc.
- Known for robust performance and security.
- Can be used with many backends (Node.js, Python, Java, etc.).

**Prisma ORM**

Prisma is a next-generation ORM (Object Relational Mapper) for Node.js and TypeScript. It acts as a bridge between our application and our database (PostgreSQL).

Key Features:
- Auto-generates type-safe database queries.
- Schema-based: We define our data model in a schema.prisma file.
- Supports migrations, seeding, and introspection.
- Works with PostgreSQL, MySQL, SQLite, SQL Server, MongoDB.
- Very developer-friendly and works great with JavaScript.

## Prisma Schema Documentation for CareerX

This explains the database schema defined in `prisma/schema.prisma` for the CareerX application. This schema serves as the single source of truth for our PostgreSQL database structure, managed via Prisma ORM.

### 1\. Overview

The `schema.prisma` file defines the structure of our PostgreSQL database, including tables (models), their columns (fields), data types, and relationships between them. This declarative approach allows Prisma to generate a type-safe client for interacting with the database from our Next.js application.

### 2\. Prisma Configuration

#### Generator Client

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../lib/generated/prisma"
}
```

  * **Purpose**: This block configures how Prisma generates its client library.
  * **`provider = "prisma-client-js"`**: Specifies that a Node.js/JavaScript client will be generated. This client is the actual library used in our application code to perform database operations.
  * **`output = "../lib/generated/prisma"`**: Defines the output path for the generated Prisma Client. In our project, the client can be imported from `src/lib/generated/prisma` (or `../lib/generated/prisma` relative to the schema file itself).

#### Datasource Database

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

  * **Purpose**: This block defines the connection details for our database.
  * **`provider = "postgresql"`**: Indicates that PostgreSQL is the database system being used, aligning with our Neon.tech setup.
  * **`url = env("DATABASE_URL")`**: Specifies that the database connection string is loaded from an environment variable named `DATABASE_URL`. This variable must be set in `.env.local` for local development and in the deployment environment (e.g., Vercel) for production.

### 3\. Data Models

Each `model` block in the schema corresponds to a table in the PostgreSQL database.

#### `User` Model

Represents a user account in the CareerX application.

| Field         | Type       | Attributes                                   | Description                                                     |
| :------------ | :--------- | :------------------------------------------- | :-------------------------------------------------------------- |
| `id`          | `String`   | `@id @default(uuid())`                      | Unique identifier for the user (UUID generated automatically).  |
| `clerkUserId` | `String`   | `@unique`                                    | The unique ID provided by Clerk authentication; ensures one-to-one mapping with Clerk's user system. |
| `email`       | `String`   | `@unique`                                    | User's email address, must be unique.                           |
| `name`        | `String?`  | `nullable`                                   | User's full name.                                               |
| `imageUrl`    | `String?`  | `nullable`                                   | URL to the user's profile picture.                              |
| `industry`    | `String?`  | `nullable`                                   | Combined industry and sub-industry (e.g., "tech-software-development"). Used for relation to `IndustryInsight`. |
| `industryInsight`| `IndustryInsight?` | `@relation(fields: [industry], references: [industry])` | Relates a user to their specific industry insights. Optional. |
| `createdAt`   | `DateTime` | `@default(now())`                           | Timestamp of user creation.                                     |
| `updatedAt`   | `DateTime` | `@updatedAt`                                 | Timestamp of last update to the user record.                    |
| `bio`         | `String?`  | `nullable`                                   | User's biographical information or summary.                     |
| `experience`  | `Int?`     | `nullable`                                   | Years of professional experience.                               |
| `skills`      | `String[]` | `array`                                      | An array of skills possessed by the user.                       |
| `assessments` | `Assessment[]` | `one-to-many relation`                       | List of assessments taken by the user.                          |
| `resume`      | `Resume?`  | `one-to-one relation`                        | The user's resume (optional, one per user).                     |
| `coverLetter` | `CoverLetter[]` | `one-to-many relation`                       | List of cover letters generated by or for the user.             |

#### `Assessment` Model

Stores details of user assessments or quizzes.

| Field          | Type       | Attributes                                     | Description                                                     |
| :------------- | :--------- | :--------------------------------------------- | :-------------------------------------------------------------- |
| `id`           | `String`   | `@id @default(cuid())`                        | Unique identifier for the assessment.                           |
| `userId`       | `String`   |                                                | Foreign key linking to the `User` model.                        |
| `user`         | `User`     | `@relation(fields: [userId], references: [id])` | Defines the many-to-one relationship with `User`.               |
| `quizScore`    | `Float`    |                                                | Overall score obtained in the assessment.                       |
| `questions`    | `Json[]`   | `array`                                        | Array of JSON objects, each representing a question with user's answer and correctness. |
| `category`     | `String`   |                                                | Category of the assessment (e.g., "Technical", "Behavioral").   |
| `improvementTip`| `String?`  | `nullable`                                     | AI-generated tip for improvement based on assessment results.   |
| `createdAt`    | `DateTime` | `@default(now())`                             | Timestamp of assessment creation.                               |
| `updatedAt`    | `DateTime` | `@updatedAt`                                   | Timestamp of last update to the assessment record.              |
| `@@index([userId])` | `index`    |                                                | Optimizes queries filtering by `userId`.                        |

#### `Resume` Model

Stores a user's resume content and AI analysis results.

| Field       | Type       | Attributes                                     | Description                                                     |
| :---------- | :--------- | :--------------------------------------------- | :-------------------------------------------------------------- |
| `id`        | `String`   | `@id @default(cuid())`                        | Unique identifier for the resume.                               |
| `userId`    | `String`   | `@unique`                                      | Foreign key linking to the `User` model; ensures one resume per user. |
| `user`      | `User`     | `@relation(fields: [userId], references: [id])` | Defines the one-to-one relationship with `User`.                |
| `content`   | `String`   | `@db.Text`                                     | The full content of the resume, stored as a long text string (Markdown). |
| `atsScore`  | `Float?`   | `nullable`                                     | AI-generated Applicant Tracking System (ATS) compatibility score. |
| `feedback`  | `String?`  | `nullable`                                     | AI-generated feedback on the resume.                            |
| `createdAt` | `DateTime` | `@default(now())`                             | Timestamp of resume creation/upload.                            |
| `updatedAt` | `DateTime` | `@updatedAt`                                   | Timestamp of last update to the resume record.                  |

#### `CoverLetter` Model

Stores details of generated cover letters.

| Field          | Type       | Attributes                                     | Description                                                     |
| :------------- | :--------- | :--------------------------------------------- | :-------------------------------------------------------------- |
| `id`           | `String`   | `@id @default(cuid())`                        | Unique identifier for the cover letter.                         |
| `userId`       | `String`   |                                                | Foreign key linking to the `User` model.                        |
| `user`         | `User`     | `@relation(fields: [userId], references: [id])` | Defines the many-to-one relationship with `User`.               |
| `content`      | `String`   |                                                | The content of the cover letter (e.g., AI-generated Markdown).  |
| `jobDescription`| `String?`  | `nullable`                                     | The job description for which the cover letter was written.     |
| `companyName`  | `String`   |                                                | Name of the company the cover letter is for.                    |
| `jobTitle`     | `String`   |                                                | Title of the position the cover letter is for.                  |
| `status`       | `String`   | `@default("draft")`                           | Current status of the cover letter (e.g., "draft", "completed", "sent"). |
| `createdAt`    | `DateTime` | `@default(now())`                             | Timestamp of cover letter creation.                             |
| `updatedAt`    | `DateTime` | `@updatedAt`                                   | Timestamp of last update to the cover letter record.            |
| `@@index([userId])` | `index`    |                                                | Optimizes queries filtering by `userId`.                        |

#### `IndustryInsight` Model

Aggregated data and insights for specific industries.

| Field             | Type       | Attributes                                     | Description                                                     |
| :---------------- | :--------- | :--------------------------------------------- | :-------------------------------------------------------------- |
| `id`              | `String`   | `@id @default(cuid())`                        | Unique identifier for the industry insight record.              |
| `industry`        | `String`   | `@unique`                                      | The specific industry this data belongs to (e.g., "tech-software-development"). This serves as a unique identifier for the insight. |
| `users`           | `User[]`   | `one-to-many inverse relation`                 | List of users associated with this industry.                    |
| `salaryRanges`    | `Json[]`   | `array`                                        | Array of JSON objects, each detailing salary ranges for roles within the industry. |
| `growthRate`      | `Float`    |                                                | Estimated growth rate of the industry.                          |
| `demandLevel`     | `String`   |                                                | Current demand level for jobs in this industry ("High", "Medium", "Low"). |
| `topSkills`       | `String[]` | `array`                                        | List of most in-demand skills for this industry.                |
| `marketOutlook`   | `String`   |                                                | Overall market outlook for the industry ("Positive", "Neutral", "Negative"). |
| `keyTrends`       | `String[]` | `array`                                        | List of current significant trends affecting the industry.      |
| `recommendedSkills`| `String[]` | `array`                                        | Skills recommended for individuals looking to thrive in this industry. |
| `lastUpdated`     | `DateTime` | `@default(now())`                             | Timestamp when the industry insight data was last updated.      |
| `nextUpdate`      | `DateTime` |                                                | Scheduled timestamp for the next data update.                   |
| `@@index([industry])` | `index`    |                                                | Optimizes queries filtering by `industry`.                      |

### 4\. Key Prisma Features Used

  * **`@id`**: Defines the primary key for a model.
  * **`@default()`**: Specifies a default value for a field when a new record is created (e.g., `uuid()`, `cuid()`, `now()`).
  * **`@unique`**: Ensures that all values in a specific field are unique across the table.
  * **`@updatedAt`**: Automatically updates the `DateTime` field to the current timestamp whenever the record is modified.
  * **`String[]`, `Json[]`**: Represents array types in PostgreSQL, allowing a single field to store multiple values (e.g., a list of skills) or complex structured data.
  * **`@db.Text`**: Explicitly maps a `String` field to PostgreSQL's `TEXT` type, suitable for storing long strings like resume content.
  * **`@relation()`**: Defines relationships between models (one-to-one, one-to-many). It specifies the foreign key fields and the referenced primary keys.
  * **`@@index()`**: Creates a database index on the specified fields, significantly improving the performance of queries that filter or sort by these fields.

## 5\. Database Management

After any changes to this `schema.prisma` file, the following steps are crucial:

1.  **Generate Prisma Client**: Run `npx prisma generate` to update the Prisma Client library with the new schema definitions. This ensures our application code remains type-safe and has access to the latest database methods.

2.  **Create/Apply Migrations**:
      * For development, use `npx prisma migrate dev` to create a new migration file and apply it to your database.
      * For production deployments, use `npx prisma migrate deploy` to apply pending migrations.

These steps ensure that our application's data models are always in sync with our actual PostgreSQL database schema.

-----

Sure! Here's a **Markdown-formatted explanation** of the provided **`ModeToggle`** component:

---

## `ModeToggle` Component (Dark/Light Theme Switch)

This React component provides a **toggle button** to switch between **light** and **dark** themes in a Next.js app using the `next-themes` library and **ShadCN UI components**.

---

### Technologies Used

* `React`
* `next-themes`
* `lucide-react` icons
* `@/components/ui/button` and `dropdown-menu` from **ShadCN UI**

---

### Code Breakdown

#### 1. `use client`

Marks this as a **Client Component** in Next.js (needed for state/hooks to work).

---

#### 2. Imports

```js
import { useTheme } from "next-themes"    // Hook to change theme
```

---

#### 3. Functional Component: `ModeToggle`

```jsx
export function ModeToggle() {
  const { setTheme } = useTheme()  // Access theme setter function
```

---

#### 4. Dropdown Menu Items

```jsx
<DropdownMenuItem onClick={() => setTheme("light")}>
  Light
</DropdownMenuItem>
<DropdownMenuItem onClick={() => setTheme("dark")}>
  Dark
</DropdownMenuItem>
```

* Clicking an option calls `setTheme("light")` or `setTheme("dark")` from `next-themes`.

---

Sure! Here's a complete **Markdown-formatted explanation** of your custom hook `useFetch`:

---

## `useFetch` Custom React Hook

This is a reusable **data-fetching hook** built with `React` and `sonner` (for toast notifications). It helps manage:

* API call execution
* Loading state
* Error handling
* Fetched data state

**Location**: `hooks/use-fetch.js`

---

### Code Overview

```js
import { useState } from "react";
import { toast } from "sonner";
```

* `useState` is used to manage local states (`data`, `loading`, `error`).
* `toast` from **Sonner** is used to display errors in a non-blocking way.

---

#### Hook Declaration

```js
const useFetch = (cb) => {
```

* Takes a function `cb` (typically an API call or async operation) as an argument.

---

#### State Management

```js
const [data, setData] = useState(undefined);
const [loading, setLoading] = useState(null);
const [error, setError] = useState(null);
```

* `data`: Stores the fetched response.
* `loading`: Boolean to track if the request is in progress.
* `error`: Stores any error from the request.

---

#### The Main Function: `fn`

```js
const fn = async (...args) => {
```

* Accepts any number of arguments (`...args`) and passes them to the `cb` function.
* Handles asynchronous flow: sets loading, calls the function, catches errors, and updates state accordingly.

**Logic inside `fn`**:

1. `setLoading(true)` – start loading
2. Try to:

   * Run the callback
   * Save the result to `data`
3. Catch errors:

   * Save the error to `error`
   * Show a toast with `error.message`
4. Finally:

   * `setLoading(false)` – stop loading

---

#### Returned Values

```js
return { data, loading, error, fn, setData };
```

* `data`: Result from the fetch
* `loading`: Boolean – `true` when request is in progress
* `error`: Error object if the request fails
* `fn`: The wrapped async function you call to trigger the fetch
* `setData`: Allows manual update of the data if needed

---

Sure! Here's a **Markdown-formatted explanation** of your `lib/inngest/client.js` file:

---

## `lib/inngest/client.js`

This file sets up the **Inngest client** for our application. Inngest is a **serverless event-driven workflow platform** that helps us build background jobs, queues, and scheduled tasks easily.

---

### Code

```js
import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "careerx", name: "Careerx" });
```

---

### Explanation

#### 1. **Creating the Inngest Client**

```js
export const inngest = new Inngest({ id: "careerx", name: "Careerx" });
```

* `new Inngest({...})` creates a new **client instance** for our project.
* The object passed to `Inngest` contains:

| Field  | Description                                                                   |
| ------ | ----------------------------------------------------------------------------- |
| `id`   | A unique identifier for our app. Used internally by Inngest. |
| `name` | A human-readable name for our app (shown in Inngest dashboard).              |

* `export const inngest` makes this client available to use in other files in our app.

---

Here’s a detailed explanation of the code in `lib/inngest/functions.js` written in **Markdown syntax**, suitable for documentation:

---

## `lib/inngest/functions.js` – Industry Insights Generator (Inngest + Gemini)

This file defines a scheduled background function using **Inngest** and **Google Gemini (GenAI)** to automatically generate and update industry insights every week.

---

### Imports

```js
import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { GoogleGenAI } from "@google/genai";
```

* `db`: Prisma client instance for accessing the database.
* `inngest`: Inngest client used to create background functions and workflows.
* `GoogleGenAI`: Gemini AI client from the `@google/genai` package.

---

### API Key Setup

```js
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
```

* Instantiates the Gemini AI client using your API key from environment variables.

---

### Scheduled Function – `generateIndustryInsights`

```js
export const generateIndustryInsights = inngest.createFunction(
  { name: "Generate Industry Insights" },
  { cron: "0 0 * * 0" },
  async ({ event, step }) => {
```

* **Function Name**: `Generate Industry Insights`
* **Schedule (Cron)**: Runs **every Sunday at midnight**.
* `step`: Inngest step-based execution system for managing retries, logs, and external calls.

---

### Step 1: Fetch Industries from DB

```js
const industries = await step.run("Fetch industries", async () => {
  return await db.industryInsight.findMany({
    select: { industry: true },
  });
});
```

* Retrieves a list of all industries stored in the `industryInsight` table.

---

### Step 2: For Each Industry – Generate Insights with Gemini

For each industry:

1. A prompt is constructed to request insights in **strict JSON format**.
2. Gemini is called to generate the response.
3. JSON is cleaned and parsed.
4. The database is updated with the new insights.

#### AI Prompt Example

```js
const prompt = `
  Analyze the current state of the ${industry} industry...
  {
    "salaryRanges": [ ... ],
    ...
  }
`;
```

* The prompt asks Gemini to return a structured JSON containing:

  * `salaryRanges` (min, max, median per role),
  * `growthRate`,
  * `demandLevel` (High | Medium | Low),
  * `topSkills`,
  * `marketOutlook`,
  * `keyTrends`,
  * `recommendedSkills`.

#### AI Execution with Gemini

```js
const res = await step.ai.wrap(
  "gemini",
  async (p) => {
    return await genAI.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: p
    });
  },
  prompt
);
```

* `step.ai.wrap` is an Inngest helper to handle AI steps with retries.
* Uses Gemini model `gemini-2.0-flash-001` for fast inference.

#### Cleaning & Parsing the Response

````js
const text = res.candidates[0].content.parts[0].text || "";
const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
const insights = JSON.parse(cleanedText);
````

* Removes any backticks or markdown formatting.
* Parses the clean string into a usable JSON object.

---

### Step 3: Update DB

```js
await step.run(`Update ${industry} insights`, async () => {
  await db.industryInsight.update({
    where: { industry },
    data: {
      ...insights,
      lastUpdated: new Date(),
      nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
});
```

* Updates the corresponding industry record with:

  * Latest AI-generated insights,
  * `lastUpdated` timestamp,
  * `nextUpdate` set to 1 week later.

---

Here's a **Markdown-formatted explanation** of the `lib/checkSignin.js` file:

---

## `lib/checkSignin.js` – Check User Sign-in Status

This utility function verifies if the current user is signed in and exists in the database.

---

### Imports

```js
import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";
```

* `currentUser`: Fetches the authenticated user via Clerk.
* `db`: Prisma client used to interact with the database.

---

### Function: `checkSignin`

```js
export const checkSignin = async () => {
  const user = await currentUser();
```

* Retrieves the current user from Clerk.
* If there's no signed-in user, returns `false`.

---

#### Logic Breakdown

**1. Check if user is authenticated**

```js
  if (!user) {
    return false;
  }
```

* If the user is not signed in, immediately return `false`.

---

**2. Find the user in the database**

```js
  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });
```

* Searches for a user in the `user` table where the `clerkUserId` matches the current user's Clerk ID.

---

**3. Return result**

```js
    if (loggedInUser) {
      return true;
    } else {
      return false;
    }
```

* If found, return `true` (user is signed in and registered).
* If not, return `false`.

---

### Return Values

| Case                             | Returns                                  |
| -------------------------------- | ---------------------------------------- |
| User not authenticated via Clerk | `false`                                  |
| User authenticated & found in DB | `true`                                   |
| User authenticated but not in DB | `false`                                  |
| DB error occurs                  | Logs error and function ends (no return) |

---

Here is a **Markdown-formatted explanation** of the `lib/checkUser.js` file:

---

## `lib/checkUser.js` – Get or Create a Logged-In User

This utility function is used to:

* Check if a user is authenticated via **Clerk**.
* Find the user in the **PostgreSQL database** using **Prisma**.
* If the user doesn't exist in the database, it creates a new user entry.

---

### Function: `checkUser`

```js
export const checkUser = async () => {
  const user = await currentUser();
```

#### Step 1: Get Current User from Clerk

* Uses Clerk's server-side helper to get the currently authenticated user.
* If no user is authenticated, return `null`.

```js
  if (!user) {
    return null;
  }
```

---

#### Step 2: Look for User in the Database

```js
  const loggedInUser = await db.user.findUnique({
    where: {
      clerkUserId: user.id,
    },
  });
```

* Searches the `user` table for a record with the matching `clerkUserId`.

---

#### Step 3: Return If User Exists

```js
  if (loggedInUser) {
    return loggedInUser;
  }
```

* If found, returns the existing user object.

---

#### Step 4: Create a New User if Not Found

```js
  const name = `${user.firstName} ${user.lastName}`;
  const newUser = await db.user.create({
    data: {
      clerkUserId: user.id,
      name,
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
    },
  });
  return newUser;
```

* If not found, constructs a new user object using data from Clerk.
* Creates the new user in the database.
* Returns the newly created user.

---

### Summary

| Scenario                            | Outcome                      |
| ----------------------------------- | ---------------------------- |
| No user is authenticated            | Returns `null`               |
| User is found in the DB             | Returns that user object     |
| User is authenticated but not in DB | Creates and returns new user |
| Error during DB operation           | Logs error (no return value) |


---

## `lib/prisma.js` – Prisma Client Setup (for development only)

This file initializes a single instance of Prisma Client and prevents it from being re-created on every reload during development (especially important in Next.js).

---

###Imports

```js
import { PrismaClient } from "./generated/prisma";
```

* We're importing the `PrismaClient` from our custom Prisma output path (`./generated/prisma`).

---

### Instantiate Prisma Client

```js
export const db = new PrismaClient();
```

* Creates a new instance of the Prisma Client.
* Used to interact with your database throughout the app.

---

### Prevent Reinitialization in Dev

```js
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
```

#### Why this matters:

* In development, **Next.js hot-reloads** can cause multiple instances of Prisma Client to be created.
* This leads to memory leaks and `PrismaClientInitializationError`.

#### This line solves that:

* It attaches the `db` instance to `globalThis` so it's **reused** rather than recreated.

---

### Summary

| Part                     | Purpose                                                     |
| ------------------------ | ----------------------------------------------------------- |
| `new PrismaClient()`     | Initializes Prisma Client to connect with your DB           |
| `globalThis.prisma = db` | Caches the instance during development to avoid duplication |
| `NODE_ENV` check         | Ensures caching only happens in non-production environments |

---

## lib/utils.js – Tailwind + Class Utility Helper

This file exports a helper function cn that helps combine and conditionally merge CSS class names, especially useful with Tailwind CSS.

---

## data folder contain various js files which in turn contain dummy data for our landing page

Here’s a **Markdown-formatted explanation** of the `actions/user.js` file:

---

## `actions/user.js`

This file contains **server-side functions** related to user operations, including updating user profile details and checking onboarding status. These functions interact with the **Prisma database** and use **Clerk for authentication**.

---

### Imports

```js
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";
```

* `db`: Prisma client for database operations.
* `auth`: Retrieves the current authenticated user via Clerk.
* `revalidatePath`: Used to revalidate the cache for static paths after data mutation.
* `generateAIInsights`: Custom AI function that returns industry-specific insights.

---

### Function: `updateUser(data)`

#### Description:

Updates a user’s profile information (industry, experience, bio, and skills). If the industry doesn’t exist in the database, it creates a new industry insight using AI-generated insights.

#### Parameters:

* `data` (object): Contains user fields like:

  * `industry`
  * `experience`
  * `bio`
  * `skills`

#### Flow:

1. **Authenticate User**

   ```js
   const { userId } = await auth();
   ```

2. **Find User in DB**

   ```js
   const user = await db.user.findUnique({ where: { clerkUserId: userId } });
   ```

3. **Run a Transaction** to:

   * Check if the industry already exists.
   * If not, generate insights via `generateAIInsights()` and create a new record.
   * Update the user’s profile in the database.

4. **Revalidate** the homepage cache:

   ```js
   revalidatePath("/");
   ```

5. **Return** updated user info or throw appropriate errors.

---

### Function: `getUserOnboardingStatus()`

#### Description:

Checks if the authenticated user has completed onboarding by verifying whether the `industry` field is filled in the user's profile.

#### Logic:

1. **Authenticate User**
2. **Fetch User’s `industry` field** from the database.
3. **Return** onboarding status as:

   ```js
   { isOnboarded: true | false }
   ```

---

Here’s a clear and well-formatted explanation of the `actions/dashboard.js` file using **Markdown syntax**:

---

## `actions/dashboard.js`

This file defines **server-side logic** for:

1. Generating AI-powered industry insights using the **Gemini API**.
2. Fetching or creating industry insight data for a logged-in user using **Prisma ORM** and **Clerk authentication**.

---


### Initialize Gemini AI Client

```js
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
```

---

### `generateAIInsights(industry)`

#### Description:

Generates **structured insights** about a given industry using **Gemini 2.0**.

### 🔍 How It Works:

1. Constructs a **prompt** instructing Gemini to return only **JSON** with:

   * Salary ranges
   * Growth rate
   * Demand level
   * Skills
   * Trends
   * Market outlook
2. Sends the prompt to Gemini using `generateContent`.
3. Cleans the response by stripping unnecessary formatting.
4. Parses the string into a JSON object and returns it.

#### Example Output Format:

```json
{
  "salaryRanges": [
    { "role": "Frontend Developer", "min": 50000, "max": 120000, "median": 85000, "location": "Remote" }
  ],
  "growthRate": 7.5,
  "demandLevel": "High",
  "topSkills": ["React", "TypeScript", "GraphQL"],
  "marketOutlook": "Positive",
  "keyTrends": ["AI", "Remote Work"],
  "recommendedSkills": ["Docker", "Next.js"]
}
```

---

### `getIndustryInsights()`

#### Description:

Returns industry insight data for the currently logged-in user. If not available, generates and stores it using `generateAIInsights`.

#### Steps:

1. Get the logged-in `userId` from Clerk.
2. Fetch the user from the database using `clerkUserId`.
3. If user doesn't exist → throw error.
4. If user **has no industry insight data**:

   * Generate new insights via Gemini.
   * Save them to the `industryInsight` table with a `nextUpdate` date set to 7 days from now.

5. If user **already has insights**, return them directly.

---

Here is an explanation of the `actions/interview.js` file in **Markdown syntax** for clear documentation and learning:

---

## `actions/interview.js`

This server-side file defines logic for managing **technical quiz assessments**:

* Generating AI-powered quizzes
* Saving quiz results with feedback
* Fetching a user's assessment history

---

###  `generateQuiz()`

#### Purpose:

Generates a personalized multiple-choice technical quiz using **Gemini AI**, based on the user’s **industry** and **skills**.

#### How It Works:

1. Fetches the user’s `industry` and `skills`.
2. Constructs a detailed prompt to Gemini for **10 multiple-choice questions**.
3. Gemini returns a structured JSON of quiz questions.
4. The function parses and returns the `questions`.

#### Quiz Format:

```json
{
  "questions": [
    {
      "question": "What is closure in JavaScript?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "B",
      "explanation": "Closures allow functions to access outer scope variables."
    }
  ]
}
```

---

### `saveQuizResult(questions, answers, score)`

#### Purpose:

Saves the results of a completed quiz to the database, and optionally generates a tip for improvement if there are incorrect answers.

#### Key Features:

* Maps user answers against correct answers.
* Flags which questions were answered correctly or incorrectly.
* If there are **wrong answers**, uses Gemini to generate an **encouraging improvement tip**.
* Saves all this data to the `assessment` table.

#### Stored in DB:

* User ID
* Quiz Score
* All question data
* Category (e.g., `"Technical"`)
* Optional improvement tip


### `getAssessments()`

#### Purpose:

Fetches all past assessments for the logged-in user.

#### How It Works:

* Uses Clerk to identify the user.
* Retrieves all related entries from the `assessment` table.
* Sorts them by creation date (`createdAt` ascending).

---

### Summary

| Function           | Role                                                      |
| ------------------ | --------------------------------------------------------- |
| `generateQuiz()`   | Creates personalized multiple-choice questions via Gemini |
| `saveQuizResult()` | Saves results and generates AI-based tips                 |
| `getAssessments()` | Lists previous quiz results for a user                    |

---

Here is a **Markdown explanation** of the `actions/resume.js` file in your Next.js app:

---

## `actions/resume.js` – Resume Handling & AI Enhancement

This file contains server-side logic for handling user resumes in a Next.js app. It uses:

---

###  `saveResume(content)`

**Purpose**:
Save or update a user's resume content in the database.

#### Steps:

1. **Authenticate** the user via Clerk.
2. **Check** if the user exists in the `user` table (using `clerkUserId`).
3. **Upsert** the resume:

   * If resume exists → update.
   * Else → create a new resume for the user.
4. **Revalidate** the `/resume` page using `revalidatePath`.


### `getResume()`

**Purpose**:
Fetch the resume content for the currently authenticated user.

### Steps:

1. Authenticates the user.
2. Looks up the user in the database.
3. Returns the resume using `userId` as the key.

---

### `improveWithAI({ current, type })`

**Purpose**:
Uses **Google Gemini API** to enhance a specific part of a resume (like "experience" or "summary").

#### Parameters:

* `current`: The current content from the user.
* `type`: The section type (e.g., "experience", "education", etc.)

#### Steps:

1. Authenticate the user.
2. Fetch the user along with `industryInsight` (to tailor resume to domain).
3. Construct a detailed **prompt** for the Gemini model to improve the resume section.
4. Call `genAI.models.generateContent(...)` with the `gemini-2.0-flash-001` model.
5. Return the **improved version** of the content.

#### Prompt includes:

* Action verbs.
* Metrics/results.
* Industry-specific keywords.
* Achievements > Responsibilities.

---

Here's a **markdown-formatted explanation** of the `actions/cover-letter.js` file:

---

# 📄 `actions/cover-letter.js` — Cover Letter Actions with Google Gemini & Prisma

This file contains **server-side logic** to generate, retrieve, and delete AI-generated cover letters using **Google Gemini API**, **Prisma ORM**, and **Clerk authentication**.

---

## ✅ Prerequisites

* `@google/genai`: For calling the Gemini API
* `@clerk/nextjs/server`: For getting the authenticated user
* `@/lib/prisma`: Custom wrapper around Prisma Client
* Environment variable: `GEMINI_API_KEY` for accessing Gemini

---

## 🧠 `generateCoverLetter(data)`

### Purpose:

Generates a professional cover letter using Gemini API based on:

* Authenticated user profile
* Job details passed in `data`

### Steps:

1. Authenticate user using Clerk.
2. Fetch user details from the database.
3. Create a structured prompt including user experience, skills, and job description.
4. Call the Gemini API using `generateContent()`.
5. Save the generated letter in the `coverLetter` table using Prisma.

### Returns:

* The saved cover letter document.

### Example Input:

```js
{
  jobTitle: "Frontend Engineer",
  companyName: "Google",
  jobDescription: "Build and optimize React applications..."
}
```

---

### `getCoverLetters()`

#### Purpose:

Retrieves all cover letters created by the current authenticated user.

#### Steps:

1. Authenticate the user.
2. Get the user's ID from the database.
3. Fetch all cover letters where `userId` matches, ordered by `createdAt`.

#### Returns:

* Array of cover letter records.

---

### `getCoverLetter(id)`

#### Purpose:

Fetches a single cover letter by its `id` that belongs to the authenticated user.

#### Steps:

1. Authenticate the user.
2. Fetch the user from the database.
3. Find the unique cover letter by `id` and `userId`.

---

### `deleteCoverLetter(id)`

#### Purpose:

Deletes a single cover letter that belongs to the current user.

#### Steps:

1. Authenticate the user.
2. Fetch the user.
3. Delete the letter from the database where `id` and `userId` match.

---


### Gemini Prompt Customization

Prompt includes:

* Candidate's experience, skills, and background from DB
* Job details from form input
* 7 specific formatting and content requirements (tone, examples, markdown, etc.)

---

Here's a detailed explanation of the `app/api/inngest/route.js` file in **Markdown syntax**:

---

# `app/api/inngest/route.js` Explanation

This file sets up an API route using the **Inngest** framework, which enables background function execution and event-driven workflows in Next.js applications.

### Purpose

The file exports API handlers (`GET`, `POST`, `PUT`) that will be used by Inngest to trigger and serve event-driven functions. In this case, it registers a function called `generateIndustryInsights`.

---

### Code Breakdown

```js
import { serve } from "inngest/next";
```

* Imports the `serve` helper from `inngest/next` which creates API handlers compatible with Next.js API routes.

---

```js
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    generateIndustryInsights
  ],
});
```

* `serve` sets up the Inngest API handler for this route.
* The returned `GET`, `POST`, and `PUT` methods are automatically handled by Inngest for triggering and running functions.
* We pass the `generateIndustryInsights` function into the `functions` array so Inngest knows what can be triggered by events.

---

### Summary

This route acts as the server-side endpoint for Inngest in our Next.js app. It:

* Initializes Inngest with your client configuration.
* Registers the `generateIndustryInsights` function for event handling.
* Exports API handlers (`GET`, `POST`, `PUT`) for Inngest to manage function execution.

---

Here's a clear Markdown explanation for the `app/lib/schema.js` file:

---

### `app/lib/schema.js` Explanation

This file defines **validation schemas** using the [`zod`](https://github.com/colinhacks/zod) library for various forms used throughout the application. It helps validate and transform user inputs before processing or saving them to a database.

---

#### 1. `onboardingSchema`

Used to validate user onboarding form data.

```js
export const onboardingSchema = z.object({
  industry: z.string({ required_error: "Please select an industry" }),
  subIndustry: z.string({ required_error: "Please select a specialization" }),
  bio: z.string().max(500).optional(),
  experience: z.string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(0).max(50)),
  skills: z.string().transform((val) => val?.split(",").map(s => s.trim()).filter(Boolean)),
});
```

* **industry, subIndustry**: Required fields as strings.
* **bio**: Optional field, maximum 500 characters.
* **experience**: Input is a string, parsed into a number and validated between 0 and 50.
* **skills**: Comma-separated string transformed into an array of trimmed strings.

---

#### 2. `contactSchema`

Used to validate the contact information section of a form.

```js
export const contactSchema = z.object({
  email: z.string().email("Invalid email address"),
  mobile: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
});
```

* **email**: Required, must be a valid email.
* **mobile, linkedin, twitter**: Optional strings.

---

#### 3. `entrySchema`

Reusable schema for work experience, education, and projects.

```js
export const entrySchema = z.object({
  title: z.string().min(1),
  organization: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  description: z.string().min(1),
  current: z.boolean().default(false),
}).refine((data) => data.current || !!data.endDate, {
  message: "End date is required unless this is your current position",
  path: ["endDate"],
});
```

* Validates fields like **title**, **organization**, and **dates**.
* Includes logic to require an end date unless the position is marked as `current`.

---

#### 4. `resumeSchema`

Schema for validating the entire resume object.

```js
export const resumeSchema = z.object({
  contactInfo: contactSchema,
  summary: z.string().min(1),
  skills: z.string().min(1),
  experience: z.array(entrySchema),
  education: z.array(entrySchema),
  projects: z.array(entrySchema),
});
```

* Combines **contactSchema** and **entrySchema** for structured resume data.
* Requires **summary** and **skills**.
* **experience**, **education**, **projects** must be arrays of valid entries.

---

#### 5. `coverLetterSchema`

Used to validate the cover letter input.

```js
export const coverLetterSchema = z.object({
  companyName: z.string().min(1),
  jobTitle: z.string().min(1),
  jobDescription: z.string().min(1),
});
```

* All fields are required and must contain at least one character.

---

## Summary

This file ensures **structured, clean, and safe input validation** across forms like onboarding, resumes, and cover letters. Using `zod` makes it easier to manage validations, transformations, and error messages in a type-safe and declarative way.

---
