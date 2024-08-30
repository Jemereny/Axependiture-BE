# Axependiture

An expenditure telegram bot to keep track of expenses and view them.

## Requirements

- Node v18
- AWS
- yarn

## Installations:

> yarn install
> yarn dev (for development)
> yarn deploy (for production)

## Features

- Adding expenses
- Viewing expenses
- Setting of Timezone
  - This is to ensure the expenses are properly tracked for users in different countries
- View expense for the month (TBD)
- Remove expense (TBD)

## Gotchas

- When giving a response, there is a need to escape special characters as telegram uses **Markdown** to render it's texts.
  - When the text is wrapped with a single or double quote `'` or `"`, there is a need to put double `\\`
  - When the text is wrapped with a single backtick <code>\`</code>
    there is only a need to put a single
- Telegram inline buttons can hold 100 buttons vertically and 7 buttons horizontally

## Implementation details d

Setup is as minimal as possible to reduce cost

### Infrastructure

- Serverless
  - Zero usage, Cheap
- DynamodB
  - $$,
  - Trying out single-table design

### Database

DynamoDB is currently used as there is free storage available. Currently using Single-Table design to take advantage of schema-less design of NoSQL tables to store different types of data.
